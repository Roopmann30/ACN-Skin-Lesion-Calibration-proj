"""
PyTorch implementation of the Auxiliary Calibration Network (ACN) for HAM10000 Dermoscopy.
Extracts 521-dimensional multi-signal uncertainty vectors from a frozen ResNet-18 backbone
and predicts an instance-specific temperature T(x) > 1.0.
"""

from typing import Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet18, ResNet18_Weights

HAM10000_CLASSES = [
    ("mel", "Melanoma", "malignant"),
    ("nv", "Melanocytic Nevus", "benign"),
    ("bcc", "Basal Cell Carcinoma", "malignant"),
    ("bkl", "Seborrheic Keratosis", "benign"),
    ("akiec", "Actinic Keratosis", "malignant"),
    ("vasc", "Vascular Lesion", "benign"),
    ("df", "Dermatofibroma", "benign"),
]


class AuxiliaryCalibrationNetwork(nn.Module):
    """
    Lightweight MLP mapping S(x) in R^521 to per-image temperature T(x) > 1.0.
    """

    def __init__(self, in_features: int = 521, hidden_dim: int = 64, dropout_p: float = 0.2):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_p),
            nn.Linear(hidden_dim, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, 1),
        )

    def forward(self, signals: torch.Tensor) -> torch.Tensor:
        raw_out = self.mlp(signals)
        # Softplus guarantees strict positivity; +1.0 prevents under-smoothing
        return F.softplus(raw_out) + 1.0


class FixedTemperatureScaling(nn.Module):
    """
    Global scalar Temperature Scaling baseline (Guo et al., 2017).
    """

    def __init__(self, init_temp: float = 1.38):
        super().__init__()
        self.temperature = nn.Parameter(torch.ones(1) * init_temp)

    def forward(self, logits: torch.Tensor) -> torch.Tensor:
        T = torch.clamp(self.temperature, min=0.01)
        return logits / T

    def fit(self, val_logits: torch.Tensor, val_labels: torch.Tensor, max_iter: int = 50) -> float:
        optimizer = torch.optim.LBFGS([self.temperature], lr=0.01, max_iter=max_iter)
        criterion = nn.CrossEntropyLoss()

        def eval_loss():
            optimizer.zero_grad()
            loss = criterion(self.forward(val_logits), val_labels)
            loss.backward()
            return loss

        optimizer.step(eval_loss)
        return float(torch.clamp(self.temperature, min=0.01).item())


class ResNet18SignalExtractor(nn.Module):
    """
    Frozen ResNet-18 extracting:
      - Penultimate features f_512 (512)
      - Raw class logits z (7)
      - Max softmax probability (1)
      - Predictive Shannon entropy H(p) (1)
    Total signal dimension = 521.
    """

    def __init__(self, num_classes: int = 7, pretrained: bool = True):
        super().__init__()
        weights = ResNet18_Weights.DEFAULT if pretrained else None
        backbone = resnet18(weights=weights)
        in_features = backbone.fc.in_features
        backbone.fc = nn.Linear(in_features, num_classes)

        self.feature_extractor = nn.Sequential(*list(backbone.children())[:-1])
        self.classifier_head = backbone.fc

        # Freeze backbone weights
        for param in self.feature_extractor.parameters():
            param.requires_grad = False
        for param in self.classifier_head.parameters():
            param.requires_grad = False

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        with torch.no_grad():
            feat = self.feature_extractor(x)
            f_512 = torch.flatten(feat, 1)
            logits = self.classifier_head(f_512)
            probs = F.softmax(logits, dim=-1)
            max_prob, _ = torch.max(probs, dim=-1, keepdim=True)
            eps = 1e-9
            entropy = -torch.sum(probs * torch.log(probs + eps), dim=-1, keepdim=True)
            signals = torch.cat([f_512, logits, max_prob, entropy], dim=-1)
        return signals, logits, f_512, max_prob, entropy


class CalibratedResNet18Pipeline(nn.Module):
    """
    Full inference pipeline combining frozen ResNet-18 signal extraction and ACN.
    """

    def __init__(self, num_classes: int = 7, pretrained: bool = True):
        super().__init__()
        self.extractor = ResNet18SignalExtractor(num_classes=num_classes, pretrained=pretrained)
        self.acn = AuxiliaryCalibrationNetwork(in_features=512 + num_classes + 2)
        self.fixed_ts = FixedTemperatureScaling(init_temp=1.38)

    def forward(self, images: torch.Tensor):
        signals, logits, f_512, max_prob, entropy = self.extractor(images)
        T_x = self.acn(signals)
        acn_probs = F.softmax(logits / T_x, dim=-1)
        fixed_probs = F.softmax(self.fixed_ts(logits), dim=-1)
        uncal_probs = F.softmax(logits, dim=-1)
        return {
            "acn_probs": acn_probs,
            "fixed_probs": fixed_probs,
            "uncal_probs": uncal_probs,
            "T_x": T_x,
            "fixed_T": float(torch.clamp(self.fixed_ts.temperature, min=0.01).item()),
            "logits": logits,
            "f_512": f_512,
            "max_prob": max_prob,
            "entropy": entropy,
        }
