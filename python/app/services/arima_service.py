"""
ARIMA service for stock demand forecasting
"""

import numpy as np
import pandas as pd
from datetime import timedelta
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.schemas.forecast import KebutuhanStokData, ForecastResult


class ARIMAService:
    """Service for stock demand forecasting using ARIMA model"""

    def __init__(self, order: tuple[int, int, int] = (1, 1, 1)):
        """
        Initialize ARIMA service

        Args:
            order: ARIMA order (p, d, q)
        """
        self.order = order
        self.model = None
        self.fitted_model = None
        self.series = None  # Store the series for later use

    def prepare_data(self, data: list[KebutuhanStokData]) -> pd.Series:
        """
        Prepare time series data from weekly sales demand data

        Args:
            data: List of weekly demand data points

        Returns:
            Pandas Series with datetime index
        """
        df = pd.DataFrame([d.model_dump() for d in data])
        df["tanggal"] = pd.to_datetime(df["tanggal"])
        df = df.sort_values("tanggal")
        df.set_index("tanggal", inplace=True)

        return df["jumlah_terjual"].astype(float)

    def fit(self, data: list[KebutuhanStokData]) -> dict:
        """
        Fit ARIMA model to historical data

        Args:
            data: Historical weekly demand data

        Returns:
            Dictionary with model metrics
        """
        self.series = self.prepare_data(data)
        train_size = max(1, int(len(self.series) * 0.8))

        if train_size >= len(self.series):
            train_size = len(self.series) - 1

        train_series = self.series.iloc[:train_size]
        test_series = self.series.iloc[train_size:]

        # Evaluate with chronological out-of-sample predictions.
        evaluation_model = ARIMA(train_series, order=self.order)
        evaluation_fit = evaluation_model.fit()
        evaluation_predictions = evaluation_fit.forecast(steps=len(test_series))
        prediction_values = np.maximum(evaluation_predictions.to_numpy(dtype=float), 0)
        actual_values = test_series.to_numpy(dtype=float)

        mae = mean_absolute_error(actual_values, prediction_values)
        rmse = np.sqrt(mean_squared_error(actual_values, prediction_values))
        non_zero_mask = actual_values != 0
        mape = (
            np.mean(
                np.abs(
                    (actual_values[non_zero_mask] - prediction_values[non_zero_mask])
                    / actual_values[non_zero_mask]
                )
            )
            * 100
            if non_zero_mask.any()
            else None
        )

        # Refit on the full historical data before forecasting future demand.
        self.model = ARIMA(self.series, order=self.order)
        self.fitted_model = self.model.fit()

        return {
            "mape": round(float(mape), 2) if mape is not None else None,
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "aic": round(self.fitted_model.aic, 2),
            "bic": round(self.fitted_model.bic, 2),
            "evaluation_method": "chronological_train_test_split_80_20",
            "train_size": int(len(train_series)),
            "test_size": int(len(test_series)),
            "evaluation_samples": [
                {
                    "actual": round(float(actual), 2),
                    "predicted": round(float(predicted), 2),
                }
                for actual, predicted in zip(actual_values, prediction_values)
            ],
        }

    def forecast(self, weeks: int) -> list[ForecastResult]:
        """
        Generate forecast for future weeks

        Args:
            weeks: Number of weeks to forecast

        Returns:
            List of forecast results
        """
        if self.fitted_model is None or self.series is None:
            raise ValueError("Model must be fitted before forecasting")

        # Get forecast with confidence intervals
        forecast_result = self.fitted_model.get_forecast(steps=weeks)
        predictions = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05)

        # Get last date from the series index
        last_date = self.series.index[-1]

        results = []
        for i in range(weeks):
            week_end = last_date + timedelta(days=7 * (i + 1))
            week_start = week_end - timedelta(days=6)
            results.append(
                ForecastResult(
                    week=f"Minggu {i + 1}",
                    week_start=week_start.strftime("%Y-%m-%d"),
                    week_end=week_end.strftime("%Y-%m-%d"),
                    value=round(max(0, predictions.iloc[i]), 2),
                    lower_bound=round(max(0, conf_int.iloc[i, 0]), 2),
                    upper_bound=round(max(0, conf_int.iloc[i, 1]), 2),
                )
            )

        return results


# Singleton instance
arima_service = ARIMAService()
