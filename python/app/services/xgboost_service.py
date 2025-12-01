"""
XGBoost Service for Distribution Cost Prediction
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb

from app.schemas.distribution import (
    DistribusiFeatures,
    TrainingDataItem,
    CostBreakdown,
)


class XGBoostService:
    """Service for distribution cost prediction using XGBoost"""

    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.model_path = Path(__file__).parent.parent / "models" / "xgboost_model.joblib"
        self.encoder_path = Path(__file__).parent.parent / "models" / "label_encoder.joblib"
        self._load_model()

    def _load_model(self):
        """Load saved model if exists"""
        if self.model_path.exists() and self.encoder_path.exists():
            self.model = joblib.load(self.model_path)
            self.label_encoder = joblib.load(self.encoder_path)

    def _save_model(self):
        """Save model to disk"""
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.label_encoder, self.encoder_path)

    def _prepare_features(self, features: DistribusiFeatures) -> np.ndarray:
        """Prepare features for prediction"""
        jenis_encoded = self.label_encoder.transform([features.jenis_kendaraan])[0]
        return np.array([[features.jarak_kirim_km, features.jumlah_kg, jenis_encoded]])

    def train(self, data: list[TrainingDataItem]) -> dict:
        """
        Train XGBoost model with historical distribution data

        Args:
            data: List of training data items

        Returns:
            Dictionary with training metrics
        """
        df = pd.DataFrame([d.model_dump() for d in data])

        # Encode categorical variable
        self.label_encoder.fit(df["jenis_kendaraan"])
        df["jenis_encoded"] = self.label_encoder.transform(df["jenis_kendaraan"])

        # Prepare features and target
        X = df[["jarak_kirim_km", "jumlah_kg", "jenis_encoded"]]
        y = df["total_biaya_distribusi"]

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train model
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
        )
        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        metrics = {
            "mae": round(mean_absolute_error(y_test, y_pred), 2),
            "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
            "r2_score": round(r2_score(y_test, y_pred), 4),
        }

        # Save model
        self._save_model()

        return metrics

    def predict(self, features: DistribusiFeatures) -> tuple[CostBreakdown, float]:
        """
        Predict distribution cost

        Args:
            features: Input features

        Returns:
            Tuple of (CostBreakdown, confidence_score)
        """
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")

        X = self._prepare_features(features)
        total_biaya = float(self.model.predict(X)[0])

        # Estimate breakdown based on historical ratios
        biaya_bbm = total_biaya * 0.5
        biaya_tk = total_biaya * 0.4
        biaya_tambahan = total_biaya * 0.1

        return (
            CostBreakdown(
                biaya_bahan_bakar=round(biaya_bbm, 2),
                biaya_tenaga_kerja=round(biaya_tk, 2),
                biaya_tambahan=round(biaya_tambahan, 2),
                total_biaya=round(total_biaya, 2),
            ),
            0.85,  # Confidence score placeholder
        )


# Singleton instance
xgboost_service = XGBoostService()

