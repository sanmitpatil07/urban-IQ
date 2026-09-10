"""
Machine Learning module for Urban Heat DSS.

Trains a regression model to predict LST based on NDVI and NDBI.
This enables the "What-If" simulations (e.g. "What if we increase NDVI by 0.1?").
"""

import json
import joblib
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from urban_heat.config import CityConfig
from urban_heat.utils import log, processed_dir


class UrbanHeatModel:
    """
    Predictive model for Land Surface Temperature.
    
    Features: ndvi, ndbi
    Target: lst
    """

    def __init__(self, model_path: Path | None = None):
        if model_path and model_path.exists():
            log.info(f"Loading trained model from {model_path}")
            self.model = joblib.load(model_path)
        else:
            # Using a larger Random Forest to capture complex spatial non-linearities
            self.model = RandomForestRegressor(
                n_estimators=300,  # Increased from 100 for better accuracy
                max_depth=20,      # Deeper trees
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )

    def train(self, geojson_path: Path, output_path: Path | None = None) -> dict:
        """
        Train the model on the processed grid zones.
        """
        log.info(f"Loading data from {geojson_path}")
        gdf = gpd.read_file(geojson_path)

        # Drop rows with missing values
        df = gdf.dropna(subset=["lst", "ndvi", "ndbi"]).copy()
        
        # Add spatial features (centroid coordinates) to capture local spatial patterns
        df["x"] = df.geometry.centroid.x
        df["y"] = df.geometry.centroid.y
        
        X = df[["ndvi", "ndbi", "x", "y"]]
        y = df["lst"]

        log.info(f"Training on {len(df)} zones with spatial features...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        metrics = {
            "rmse": float(rmse),
            "r2": float(r2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "feature_importances": {
                "ndvi": float(self.model.feature_importances_[0]),
                "ndbi": float(self.model.feature_importances_[1]),
                "x": float(self.model.feature_importances_[2]),
                "y": float(self.model.feature_importances_[3]),
            }
        }

        
        log.info(f"Model trained. RMSE: {rmse:.2f}°C | R²: {r2:.3f}")
        log.info(f"Feature Importances - NDVI: {metrics['feature_importances']['ndvi']:.3f}, NDBI: {metrics['feature_importances']['ndbi']:.3f}")

        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(self.model, output_path)
            log.info(f"Model saved to {output_path}")

            # Also save metrics
            metrics_path = output_path.with_suffix(".json")
            with open(metrics_path, "w") as f:
                json.dump(metrics, f, indent=2)

        return metrics

    def predict(self, ndvi: np.ndarray | pd.Series, ndbi: np.ndarray | pd.Series, x: np.ndarray | pd.Series, y: np.ndarray | pd.Series) -> np.ndarray:
        """
        Predict LST for given NDVI, NDBI, and spatial coordinates.
        """
        X = pd.DataFrame({"ndvi": ndvi, "ndbi": ndbi, "x": x, "y": y})
        return self.model.predict(X)

    def simulate(self, current_ndvi: pd.Series, current_ndbi: pd.Series, x: pd.Series, y: pd.Series,
                 delta_ndvi: float | pd.Series = 0.0, delta_ndbi: float | pd.Series = 0.0) -> pd.DataFrame:
        """
        Run a what-if simulation by altering NDVI/NDBI while keeping spatial coordinates constant.
        """
        # Baseline prediction
        base_lst = self.predict(current_ndvi, current_ndbi, x, y)

        # New scenario
        new_ndvi = np.clip(current_ndvi + delta_ndvi, -1, 1)
        new_ndbi = np.clip(current_ndbi + delta_ndbi, -1, 1)
        
        new_lst = self.predict(new_ndvi, new_ndbi, x, y)
        
        lst_diff = new_lst - base_lst

        return pd.DataFrame({
            "original_lst_pred": base_lst,
            "new_lst_pred": new_lst,
            "lst_change": lst_diff,
            "new_ndvi": new_ndvi,
            "new_ndbi": new_ndbi
        })
