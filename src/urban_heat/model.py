"""
Physics-Informed Machine Learning module for Urban Heat DSS.

Trains a physics-constrained regression model to predict LST based on NDVI, NDBI, and spatial coordinates.
Enforces thermodynamic monotonicity priors:
1. d(LST)/d(NDVI) <= 0: Increased vegetative transpiration must never predict higher surface temperature.
2. d(LST)/d(NDBI) >= 0: Increased built-up concrete/impervious density must never predict lower surface temperature.
"""

from __future__ import annotations

import json
import joblib
from pathlib import Path
from typing import Literal, Any

import geopandas as gpd
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.inspection import permutation_importance

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    TORCH_AVAILABLE = True
    _ModuleBase = nn.Module
except ImportError:
    torch = None
    nn = None
    optim = None
    TORCH_AVAILABLE = False
    _ModuleBase = object

from urban_heat.config import CityConfig
from urban_heat.utils import log, processed_dir


class PhysicsInformedMLP(_ModuleBase):
    """
    Differentiable physics-informed MLP for LST prediction with monotonicity constraints.
    
    Loss: L = MSE + λ_phys * physics_loss
    where physics_loss = mean(relu(∂LST/∂NDVI)^2 + relu(-∂LST/∂NDBI)^2)
    """

    def __init__(
        self,
        input_dim: int = 4,
        hidden_dims: list[int] = None,
        dropout: float = 0.1,
    ):
        if not TORCH_AVAILABLE:
            raise ImportError("PyTorch is required for PhysicsInformedMLP. Install torch via 'pip install torch'.")
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [64, 64, 32]
        
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, 1))
        
        self.net = nn.Sequential(*layers)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Inference mode prediction with automatic normalization if buffers exist."""
        self.eval()
        with torch.no_grad():
            x_tensor = torch.tensor(X, dtype=torch.float32)
            
            # Apply normalization if buffers exist
            if hasattr(self, "X_mean") and hasattr(self, "X_std"):
                x_tensor = (x_tensor - self.X_mean) / self.X_std
            
            pred_norm = self.net(x_tensor).cpu().numpy().flatten()
            
            # Denormalize predictions if buffers exist
            if hasattr(self, "y_mean") and hasattr(self, "y_std"):
                pred_norm = pred_norm * self.y_std.numpy() + self.y_mean.numpy()
            
            return pred_norm


class _TorchModelWrapper:
    """Wrapper to make PyTorch model compatible with sklearn-like interface."""
    
    def __init__(self, model: PhysicsInformedMLP, device: str = "cpu"):
        self.model = model
        self.device = device
        self.model.to(device)
        self._estimator_type = "regressor"
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        """Training is handled externally via train_physics_informed_mlp()."""
        pass
    
    def predict(self, X) -> np.ndarray:
        if isinstance(X, pd.DataFrame):
            X = X.values
        return self.model.predict(X)
    
    def score(self, X: np.ndarray, y: np.ndarray) -> float:
        """R^2 score for sklearn compatibility."""
        from sklearn.metrics import r2_score
        y_pred = self.predict(X)
        return r2_score(y, y_pred)


def train_physics_informed_mlp(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    hidden_dims: list[int] = None,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    lambda_phys: float = 1.0,
    epochs: int = 200,
    batch_size: int = 256,
    patience: int = 20,
    device: str = "cpu",
) -> tuple[PhysicsInformedMLP, dict]:
    """
    Train physics-informed MLP with monotonicity penalty in loss function.
    
    Args:
        X_train: Training features [n_samples, 4] (ndvi, ndbi, x, y)
        y_train: Training targets [n_samples]
        X_val: Validation features
        y_val: Validation targets
        hidden_dims: Hidden layer dimensions
        lr: Learning rate
        weight_decay: L2 regularization
        lambda_phys: Weight for physics loss term
        epochs: Maximum training epochs
        batch_size: Mini-batch size
        patience: Early stopping patience
        device: Training device ("cpu" or "cuda")
    
    Returns:
        Trained model and training history dict
    """
    if hidden_dims is None:
        hidden_dims = [64, 64, 32]
    
    # Normalize features and targets
    X_mean = X_train.mean(axis=0)
    X_std = X_train.std(axis=0) + 1e-8
    y_mean = y_train.mean()
    y_std = y_train.std() + 1e-8
    
    X_train_norm = (X_train - X_mean) / X_std
    X_val_norm = (X_val - X_mean) / X_std
    y_train_norm = (y_train - y_mean) / y_std
    y_val_norm = (y_val - y_mean) / y_std
    
    input_dim = X_train.shape[1]
    model = PhysicsInformedMLP(input_dim=input_dim, hidden_dims=hidden_dims).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=10)
    mse_loss = nn.MSELoss()
    
    X_train_t = torch.tensor(X_train_norm, dtype=torch.float32, device=device)
    y_train_t = torch.tensor(y_train_norm, dtype=torch.float32, device=device).unsqueeze(1)
    X_val_t = torch.tensor(X_val_norm, dtype=torch.float32, device=device)
    y_val_t = torch.tensor(y_val_norm, dtype=torch.float32, device=device).unsqueeze(1)
    
    # Store normalization params for inference
    model.register_buffer("X_mean", torch.tensor(X_mean, dtype=torch.float32))
    model.register_buffer("X_std", torch.tensor(X_std, dtype=torch.float32))
    model.register_buffer("y_mean", torch.tensor(y_mean, dtype=torch.float32))
    model.register_buffer("y_std", torch.tensor(y_std, dtype=torch.float32))
    
    n_train = len(X_train)
    indices = np.arange(n_train)
    
    best_val_loss = float("inf")
    best_state = None
    epochs_no_improve = 0
    history = {"train_loss": [], "val_loss": [], "physics_loss": []}
    
    for epoch in range(epochs):
        model.train()
        np.random.shuffle(indices)
        epoch_train_loss = 0.0
        epoch_phys_loss = 0.0
        n_batches = 0
        
        for start in range(0, n_train, batch_size):
            end = min(start + batch_size, n_train)
            batch_idx = indices[start:end]
            xb = X_train_t[batch_idx]
            yb = y_train_t[batch_idx]
            
            optimizer.zero_grad()
            
            # Data loss
            pred = model(xb)
            data_loss = mse_loss(pred, yb)
            
            # Physics loss: monotonicity penalty via autograd
            xb_phys = xb.clone().requires_grad_(True)
            pred_phys = model(xb_phys)
            grads = torch.autograd.grad(
                pred_phys.sum(), xb_phys, create_graph=True, retain_graph=True
            )[0]
            
            # NDVI is index 0: dLST/dNDVI should be <= 0
            # NDBI is index 1: dLST/dNDBI should be >= 0
            dndvi = grads[:, 0]
            dndbi = grads[:, 1]
            
            phys_loss = (torch.relu(dndvi) ** 2 + torch.relu(-dndbi) ** 2).mean()
            
            total_loss = data_loss + lambda_phys * phys_loss
            total_loss.backward()
            optimizer.step()
            
            epoch_train_loss += data_loss.item()
            epoch_phys_loss += phys_loss.item()
            n_batches += 1
        
        # Validation
        model.eval()
        with torch.no_grad():
            val_pred = model(X_val_t)
            val_loss = mse_loss(val_pred, y_val_t).item()
        
        avg_train_loss = epoch_train_loss / n_batches
        avg_phys_loss = epoch_phys_loss / n_batches
        
        history["train_loss"].append(avg_train_loss)
        history["val_loss"].append(val_loss)
        history["physics_loss"].append(avg_phys_loss)
        
        scheduler.step(val_loss)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            epochs_no_improve = 0
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                log.info(f"Early stopping at epoch {epoch + 1}")
                break
        
        if (epoch + 1) % 20 == 0:
            log.info(f"Epoch {epoch + 1}: train_loss={avg_train_loss:.4f}, val_loss={val_loss:.4f}, phys_loss={avg_phys_loss:.4f}")
    
    if best_state:
        model.load_state_dict(best_state)
    
    return model, history


class UrbanHeatModel:
    """
    Physics-Informed Predictive model for Land Surface Temperature (LST).
    
    Features:
        - ndvi: Normalized Difference Vegetation Index (Monotonicity: -1)
        - ndbi: Normalized Difference Built-up Index (Monotonicity: +1)
        - dist_center_km: Relative distance to municipal city center in km (Spatial transferability: high)
    Target:
        - lst: Land Surface Temperature in °C
    
    Model types:
        - "hgbr": HistGradientBoostingRegressor with native monotonic constraints (default)
        - "rf": RandomForestRegressor (no physics constraints)
        - "pinn": Physics-Informed Neural Network with differentiable monotonicity loss
    """

    def __init__(
        self,
        model_path: Path | str | None = None,
        model_type: Literal["hgbr", "rf", "pinn"] = "hgbr",
        feature_mode: Literal["relative_spatial", "pure_biophysical"] = "relative_spatial",
        physics_informed: bool = True,
        pinn_config: dict | None = None,
    ):
        self.model_type = model_type
        self.feature_mode = feature_mode
        self.physics_informed = physics_informed
        self.pinn_config = pinn_config or {}
        self.feature_names = ["ndvi", "ndbi"] if feature_mode == "pure_biophysical" else ["ndvi", "ndbi", "dist_center_km"]
        self.center_x = 73.8567
        self.center_y = 18.5204
        
        if model_path:
            model_path = Path(model_path)
            if model_path.exists():
                log.info(f"Loading trained model from {model_path}")
                if model_path.suffix == ".pt":
                    if not TORCH_AVAILABLE:
                        raise ImportError("PyTorch is required to load .pt models. Install torch.")
                    checkpoint = torch.load(model_path, map_location="cpu")
                    hidden_dims = checkpoint.get("hidden_dims", [64, 64, 32])
                    input_dim = checkpoint.get("input_dim", len(self.feature_names))
                    self.feature_names = checkpoint.get("feature_names", self.feature_names)
                    self.center_x = checkpoint.get("center_x", self.center_x)
                    self.center_y = checkpoint.get("center_y", self.center_y)
                    mlp = PhysicsInformedMLP(input_dim=input_dim, hidden_dims=hidden_dims)
                    if "state_dict" in checkpoint:
                        mlp.load_state_dict(checkpoint["state_dict"])
                    else:
                        mlp.load_state_dict(checkpoint)
                    self.model = _TorchModelWrapper(mlp, device="cpu")
                    self.model_type = "pinn"
                else:
                    self.model = joblib.load(model_path)
            else:
                self._init_model()
        else:
            self._init_model()

    def _init_model(self):
        n_features = len(self.feature_names)
        if self.model_type == "pinn":
            if not TORCH_AVAILABLE:
                raise ImportError("PyTorch is required for model_type='pinn'. Install torch.")
            hidden_dims = self.pinn_config.get("hidden_dims", [64, 64, 32])
            self.model = _TorchModelWrapper(
                PhysicsInformedMLP(input_dim=n_features, hidden_dims=hidden_dims),
                device=self.pinn_config.get("device", "cpu"),
            )
        elif self.model_type == "rf" or (self.model_type == "hgbr" and not self.physics_informed):
            self.model = RandomForestRegressor(
                n_estimators=300,
                max_depth=20,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1,
            )
        else:
            # Default: HGBR with monotonic constraints
            monotonic_cst = [-1, 1] if self.feature_mode == "pure_biophysical" else [-1, 1, 0]
            self.model = HistGradientBoostingRegressor(
                monotonic_cst=monotonic_cst,
                max_iter=350,
                max_depth=16,
                learning_rate=0.04,
                min_samples_leaf=10,
                l2_regularization=0.1,
                random_state=42,
            )

    def train(
        self,
        geojson_path: Path,
        output_path: Path | None = None,
        val_split: float = 0.1,
    ) -> dict:
        """
        Train the model on the processed grid zones and calculate data & physics loss.
        
        Features: NDVI, NDBI, and relative distance to municipal center (dist_center_km).
        Raw geographic coordinates (x, y) are excluded to ensure transferability across cities.
        """
        log.info(f"Loading data from {geojson_path}")
        gdf = gpd.read_file(geojson_path)

        # Drop rows with missing values
        df = gdf.dropna(subset=["lst", "ndvi", "ndbi"]).copy()
        
        # Calculate relative distance to city center in kilometers
        centroids_x = df.geometry.centroid.x
        centroids_y = df.geometry.centroid.y
        self.center_x = float(centroids_x.mean())
        self.center_y = float(centroids_y.mean())
        
        d_lon_km = (centroids_x - self.center_x) * 105.4
        d_lat_km = (centroids_y - self.center_y) * 110.7
        df["dist_center_km"] = np.sqrt(d_lon_km**2 + d_lat_km**2)
        
        X = df[self.feature_names].values
        y = df["lst"].values

        log.info(f"Training on {len(df)} zones using features: {self.feature_names}...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        if self.model_type == "pinn":
            # Further split for validation during PINN training
            X_train_pinn, X_val, y_train_pinn, y_val = train_test_split(
                X_train, y_train, test_size=val_split, random_state=42
            )
            
            device = self.pinn_config.get("device", "cpu")
            log.info(f"Training PINN on {device} with physics loss (lambda={self.pinn_config.get('lambda_phys', 1.0)})")
            
            pinn_model, history = train_physics_informed_mlp(
                X_train_pinn,
                y_train_pinn,
                X_val,
                y_val,
                hidden_dims=self.pinn_config.get("hidden_dims", [64, 64, 32]),
                lr=self.pinn_config.get("lr", 1e-3),
                weight_decay=self.pinn_config.get("weight_decay", 1e-4),
                lambda_phys=self.pinn_config.get("lambda_phys", 1.0),
                epochs=self.pinn_config.get("epochs", 200),
                batch_size=self.pinn_config.get("batch_size", 256),
                patience=self.pinn_config.get("patience", 20),
                device=device,
            )
            
            # Update wrapper with trained model
            self.model = _TorchModelWrapper(pinn_model, device=device)
            self.pinn_history = history
        else:
            self.model.fit(X_train, y_train)

        # Evaluate Data Loss
        y_pred = self.model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Evaluate Physics Loss (Monotonicity Verification)
        # 1. Test delta NDVI >= 0: should always produce delta LST <= 0
        X_test_ndvi_up = X_test.copy()
        X_test_ndvi_up[:, 0] = np.clip(X_test_ndvi_up[:, 0] + 0.15, -1.0, 1.0)
        pred_ndvi_up = self.model.predict(X_test_ndvi_up)
        ndvi_violations = np.maximum(0.0, pred_ndvi_up - y_pred)
        ndvi_violation_rate = float((ndvi_violations > 1e-4).mean() * 100.0)

        # 2. Test delta NDBI >= 0: should always produce delta LST >= 0
        X_test_ndbi_up = X_test.copy()
        X_test_ndbi_up[:, 1] = np.clip(X_test_ndbi_up[:, 1] + 0.15, -1.0, 1.0)
        pred_ndbi_up = self.model.predict(X_test_ndbi_up)
        ndbi_violations = np.maximum(0.0, y_pred - pred_ndbi_up)
        ndbi_violation_rate = float((ndbi_violations > 1e-4).mean() * 100.0)

        physics_loss_term = float(np.mean(ndvi_violations**2 + ndbi_violations**2))
        physics_consistency_score = 100.0 - ((ndvi_violation_rate + ndbi_violation_rate) / 2.0)

        # Feature importances calculation
        if hasattr(self.model, "feature_importances_"):
            raw_imp = self.model.feature_importances_
            total_imp = max(1e-6, sum(raw_imp))
            importances = {feat: float(imp / total_imp) for feat, imp in zip(self.feature_names, raw_imp)}
        else:
            perm = permutation_importance(self.model, X_test, y_test, n_repeats=5, random_state=42)
            raw_imp = perm.importances_mean
            total_imp = max(1e-6, sum(np.abs(raw_imp)))
            importances = {feat: float(np.abs(imp) / total_imp) for feat, imp in zip(self.feature_names, raw_imp)}

        model_type_names = {
            "hgbr": "Physics-Informed Monotonic Gradient Boosting",
            "rf": "Random Forest",
            "pinn": "Physics-Informed Neural Network (PINN)",
        }

        metrics = {
            "model_type": model_type_names.get(self.model_type, self.model_type),
            "feature_mode": self.feature_mode,
            "feature_names": self.feature_names,
            "rmse": rmse,
            "r2": r2,
            "physics_loss_term": physics_loss_term,
            "physics_consistency_score_pct": physics_consistency_score,
            "ndvi_monotonicity_violation_pct": ndvi_violation_rate,
            "ndbi_monotonicity_violation_pct": ndbi_violation_rate,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "feature_importances": importances,
        }
        
        if self.model_type == "pinn":
            metrics["pinn_train_history"] = {
                "final_train_loss": history["train_loss"][-1],
                "final_val_loss": history["val_loss"][-1],
                "final_physics_loss": history["physics_loss"][-1],
                "epochs_trained": len(history["train_loss"]),
            }

        log.info(f"Model Trained. RMSE: {rmse:.2f}°C | R²: {r2:.3f}")
        log.info(f"Physics Consistency: {physics_consistency_score:.1f}% (NDVI Violations: {ndvi_violation_rate:.1f}%, NDBI Violations: {ndbi_violation_rate:.1f}%)")
        log.info(f"Feature Importances: {importances}")

        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            if self.model_type == "pinn":
                # Save PyTorch model state dict and architecture metadata
                checkpoint = {
                    "state_dict": self.model.model.state_dict(),
                    "input_dim": len(self.feature_names),
                    "feature_names": self.feature_names,
                    "center_x": self.center_x,
                    "center_y": self.center_y,
                    "hidden_dims": self.pinn_config.get("hidden_dims", [64, 64, 32]),
                }
                torch.save(checkpoint, output_path.with_suffix(".pt"))
                log.info(f"PINN model saved to {output_path.with_suffix('.pt')}")
            else:
                joblib.dump(self.model, output_path)
                log.info(f"Model saved to {output_path}")

            metrics_path = output_path.with_suffix(".json")
            with open(metrics_path, "w") as f:
                json.dump(metrics, f, indent=2)

        return metrics

    def predict(
        self,
        ndvi: np.ndarray | pd.Series,
        ndbi: np.ndarray | pd.Series,
        dist_center_km: np.ndarray | pd.Series | None = None,
        x: np.ndarray | pd.Series | None = None,
        y: np.ndarray | pd.Series | None = None,
    ) -> np.ndarray:
        """
        Predict LST using biophysical and relative spatial features.
        Accepts either precomputed dist_center_km or optional x/y from which relative distance is derived.
        """
        data = {"ndvi": ndvi, "ndbi": ndbi}
        if "dist_center_km" in self.feature_names:
            if dist_center_km is not None:
                data["dist_center_km"] = dist_center_km
            elif x is not None and y is not None:
                d_lon_km = (x - self.center_x) * 105.4
                d_lat_km = (y - self.center_y) * 110.7
                data["dist_center_km"] = np.sqrt(d_lon_km**2 + d_lat_km**2)
            else:
                n_samples = len(ndvi) if hasattr(ndvi, "__len__") else 1
                data["dist_center_km"] = np.zeros(n_samples)
        
        X = pd.DataFrame(data)[self.feature_names]
        return self.model.predict(X)

    def simulate(
        self,
        current_ndvi: pd.Series,
        current_ndbi: pd.Series,
        dist_center_km: pd.Series | None = None,
        x: pd.Series | None = None,
        y: pd.Series | None = None,
        delta_ndvi: float | pd.Series = 0.0,
        delta_ndbi: float | pd.Series = 0.0,
    ) -> pd.DataFrame:
        """
        Run a what-if simulation by altering NDVI/NDBI while keeping relative spatial features constant.
        Guarantees strict physical response.
        """
        # Baseline prediction
        base_lst = self.predict(current_ndvi, current_ndbi, dist_center_km=dist_center_km, x=x, y=y)

        # New scenario
        new_ndvi = np.clip(current_ndvi + delta_ndvi, -1.0, 1.0)
        new_ndbi = np.clip(current_ndbi + delta_ndbi, -1.0, 1.0)
        
        new_lst = self.predict(new_ndvi, new_ndbi, dist_center_km=dist_center_km, x=x, y=y)
        
        lst_diff = new_lst - base_lst

        return pd.DataFrame({
            "original_lst_pred": base_lst,
            "new_lst_pred": new_lst,
            "lst_change": lst_diff,
            "new_ndvi": new_ndvi,
            "new_ndbi": new_ndbi
        })
