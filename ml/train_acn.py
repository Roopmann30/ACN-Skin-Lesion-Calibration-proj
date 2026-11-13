"""
Training script for Auxiliary Calibration Network (ACN) on HAM10000 or synthetic smoke data.

Usage (Real HAM10000 dataset):
    python train_acn.py --data_dir ./ham10000 --epochs 30 --batch_size 128

Usage (Quick Local Smoke Test without downloading 3GB HAM10000):
    python train_acn.py --synthetic --epochs 20
"""

import argparse
import json
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

from model import CalibratedResNet18Pipeline, HAM10000_CLASSES
from metrics import compute_calibration_metrics


DX_TO_IDX = {code: idx for idx, (code, _, _) in enumerate(HAM10000_CLASSES)}


class HAM10000Dataset(Dataset):
    def __init__(self, df: pd.DataFrame, image_paths: dict, transform=None):
        self.df = df.reset_index(drop=True)
        self.image_paths = image_paths
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = Image.open(self.image_paths[row["image_id"]]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        label = DX_TO_IDX[row["dx"]]
        return img, torch.tensor(label, dtype=torch.long)


class SyntheticDermoscopyDataset(Dataset):
    def __init__(self, num_samples: int = 1500, seed: int = 42):
        rng = np.random.default_rng(seed)
        priors = [0.111, 0.670, 0.051, 0.110, 0.033, 0.014, 0.011]
        self.labels = rng.choice(7, size=num_samples, p=priors)
        torch.manual_seed(seed)
        self.images = torch.randn(num_samples, 3, 224, 224)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.images[idx], torch.tensor(int(self.labels[idx]), dtype=torch.long)


def load_ham10000_splits(data_dir: str, seed: int = 42):
    root = Path(data_dir)
    csv_path = root / "HAM10000_metadata.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Could not find {csv_path}")

    df = pd.read_csv(csv_path)
    image_paths = {p.stem: str(p) for p in root.rglob("*.jpg")}
    df = df[df["image_id"].isin(image_paths)].copy()

    # Lesion-level partitioning to prevent data leakage across multiple views of same lesion
    unique_lesions = df["lesion_id"].unique()
    rng = np.random.default_rng(seed)
    rng.shuffle(unique_lesions)

    n = len(unique_lesions)
    train_lesions = set(unique_lesions[: int(0.70 * n)])
    val_lesions = set(unique_lesions[int(0.70 * n) : int(0.85 * n)])
    test_lesions = set(unique_lesions[int(0.85 * n) :])

    eval_tfms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_ds = HAM10000Dataset(df[df["lesion_id"].isin(val_lesions)], image_paths, eval_tfms)
    test_ds = HAM10000Dataset(df[df["lesion_id"].isin(test_lesions)], image_paths, eval_tfms)
    return val_ds, test_ds


def extract_all(pipeline: CalibratedResNet18Pipeline, loader: DataLoader, device: torch.device):
    pipeline.eval()
    signals_list, logits_list, labels_list = [], [], []
    for imgs, lbls in loader:
        imgs = imgs.to(device)
        sig, log, _, _, _ = pipeline.extractor(imgs)
        signals_list.append(sig.cpu())
        logits_list.append(log.cpu())
        labels_list.append(lbls)
    return (
        torch.cat(signals_list, dim=0).to(device),
        torch.cat(logits_list, dim=0).to(device),
        torch.cat(labels_list, dim=0).to(device),
    )


def main():
    parser = argparse.ArgumentParser(description="Train Auxiliary Calibration Network (ACN)")
    parser.add_argument("--data_dir", type=str, default="./ham10000", help="Path to HAM10000 directory")
    parser.add_argument("--synthetic", action="store_true", help="Run with synthetic data instead of HAM10000")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--patience", type=int, default=10)
    parser.add_argument("--out_dir", type=str, default="./checkpoints")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    if args.synthetic:
        print("Running in synthetic verification mode...")
        val_ds = SyntheticDermoscopyDataset(num_samples=900, seed=101)
        test_ds = SyntheticDermoscopyDataset(num_samples=900, seed=202)
    else:
        val_ds, test_ds = load_ham10000_splits(args.data_dir)

    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False)

    pipeline = CalibratedResNet18Pipeline(num_classes=7, pretrained=True).to(device)

    print("Extracting 521-dim uncertainty signals from frozen ResNet-18...")
    val_signals, val_logits, val_labels = extract_all(pipeline, val_loader, device)
    test_signals, test_logits, test_labels = extract_all(pipeline, test_loader, device)

    # Fit Fixed Temperature Scaling baseline
    fixed_T = pipeline.fixed_ts.fit(val_logits, val_labels)
    print(f"Optimal Fixed Temperature T: {fixed_T:.4f}")

    # Train ACN with Adam and early stopping on validation NLL/ECE
    optimizer = torch.optim.Adam(pipeline.acn.parameters(), lr=args.lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    best_ece = float("inf")
    best_state = None
    no_improve = 0

    for epoch in range(1, args.epochs + 1):
        pipeline.acn.train()
        optimizer.zero_grad()
        T_x = pipeline.acn(val_signals)
        loss = criterion(val_logits / T_x, val_labels)
        loss.backward()
        optimizer.step()

        pipeline.acn.eval()
        with torch.no_grad():
            val_probs = F.softmax(val_logits / pipeline.acn(val_signals), dim=-1)
            val_metrics = compute_calibration_metrics(val_probs, val_labels, n_bins=15)

        if val_metrics["ece"] < best_ece:
            best_ece = val_metrics["ece"]
            best_state = {k: v.cpu() for k, v in pipeline.acn.state_dict().items()}
            no_improve = 0
        else:
            no_improve += 1

        if epoch % 5 == 0 or epoch == 1:
            print(f"Epoch [{epoch:02d}/{args.epochs}] | Loss: {loss.item():.4f} | Val ECE: {val_metrics['ece']}%")

        if no_improve >= args.patience:
            print(f"Early stopping triggered at epoch {epoch} (best Val ECE: {best_ece}%)")
            break

    if best_state is not None:
        pipeline.acn.load_state_dict(best_state)

    # Evaluate on held-out test set
    pipeline.eval()
    with torch.no_grad():
        uncal_probs = F.softmax(test_logits, dim=-1)
        fixed_probs = F.softmax(pipeline.fixed_ts(test_logits), dim=-1)
        acn_probs = F.softmax(test_logits / pipeline.acn(test_signals), dim=-1)

    print("\n--- Held-out Test Calibration Results ---")
    print("Uncalibrated:", compute_calibration_metrics(uncal_probs, test_labels))
    print("Fixed T:     ", compute_calibration_metrics(fixed_probs, test_labels))
    print("ACN (Ours):  ", compute_calibration_metrics(acn_probs, test_labels))

    # Save checkpoints
    out_path = Path(args.out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    torch.save(pipeline.state_dict(), out_path / "acn_weights.pt")
    with open(out_path / "fixed_t.json", "w", encoding="utf-8") as f:
        json.dump({"fixed_T": fixed_T, "best_val_ece": best_ece}, f, indent=2)
    print(f"Saved checkpoints to {out_path.resolve()}")


if __name__ == "__main__":
    main()
