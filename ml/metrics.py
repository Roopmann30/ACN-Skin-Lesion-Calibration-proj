"""
Calibration evaluation metrics:
  - Expected Calibration Error (ECE)
  - Maximum Calibration Error (MCE)
  - Brier Score
  - Negative Log-Likelihood (NLL)
  - Confident-Wrong Rate at tau=0.9 (CWR@0.9)
  - Per-class one-vs-rest ECE
"""

from typing import Dict, List
import numpy as np
import torch


def compute_calibration_metrics(probs: torch.Tensor, labels: torch.Tensor, n_bins: int = 15) -> Dict[str, float]:
    probs_np = probs.detach().cpu().numpy()
    labels_np = labels.detach().cpu().numpy()

    confidences = np.max(probs_np, axis=1)
    predictions = np.argmax(probs_np, axis=1)
    accuracies = (predictions == labels_np).astype(float)
    n_samples = len(labels_np)

    bin_boundaries = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    mce = 0.0

    for i in range(n_bins):
        low, high = bin_boundaries[i], bin_boundaries[i + 1]
        in_bin = (confidences > low) & (confidences <= high)
        count = np.sum(in_bin)
        if count > 0:
            acc_bin = np.mean(accuracies[in_bin])
            conf_bin = np.mean(confidences[in_bin])
            gap = abs(conf_bin - acc_bin)
            ece += gap * (count / n_samples)
            mce = max(mce, gap)

    one_hot = np.zeros_like(probs_np)
    one_hot[np.arange(n_samples), labels_np] = 1.0
    brier = float(np.mean(np.sum((probs_np - one_hot) ** 2, axis=1)))

    eps = 1e-12
    true_probs = np.clip(probs_np[np.arange(n_samples), labels_np], eps, 1.0)
    nll = float(-np.mean(np.log(true_probs)))

    high_conf_mask = confidences >= 0.9
    if np.sum(high_conf_mask) > 0:
        cwr_09 = float(np.mean(accuracies[high_conf_mask] == 0.0) * 100.0)
    else:
        cwr_09 = 0.0

    return {
        "accuracy": round(float(np.mean(accuracies) * 100.0), 2),
        "ece": round(float(ece * 100.0), 2),
        "mce": round(float(mce * 100.0), 2),
        "brier": round(brier, 4),
        "nll": round(nll, 4),
        "cwr_09": round(cwr_09, 2),
    }


def compute_reliability_bins(
    uncal_probs: torch.Tensor,
    fixed_probs: torch.Tensor,
    acn_probs: torch.Tensor,
    labels: torch.Tensor,
    n_bins: int = 5,
) -> List[Dict[str, float]]:
    """
    Generates bin-wise accuracy vs confidence points for reliability diagrams.
    """
    u_np = uncal_probs.detach().cpu().numpy()
    f_np = fixed_probs.detach().cpu().numpy()
    a_np = acn_probs.detach().cpu().numpy()
    y_np = labels.detach().cpu().numpy()

    edges = np.linspace(0.0, 1.0, n_bins + 1)
    bins_out = []

    for i in range(n_bins):
        low, high = edges[i], edges[i + 1]
        center_pct = round(((low + high) / 2.0) * 100.0)

        def bin_acc(p_arr: np.ndarray) -> float:
            conf = np.max(p_arr, axis=1)
            pred = np.argmax(p_arr, axis=1)
            mask = (conf > low) & (conf <= high)
            if np.sum(mask) == 0:
                return float(center_pct)
            return round(float(np.mean(pred[mask] == y_np[mask]) * 100.0), 1)

        bins_out.append({
            "bin": f"{(low + high) / 2.0:.1f}",
            "confidence": center_pct,
            "uncalibratedAcc": bin_acc(u_np),
            "fixedTAcc": bin_acc(f_np),
            "acnAcc": bin_acc(a_np),
        })

    return bins_out
