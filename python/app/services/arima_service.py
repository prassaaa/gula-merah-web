"""
ARIMA Service for Stock Forecasting
"""

import numpy as np
import pandas as pd
from datetime import timedelta
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.schemas.forecast import StokData, ForecastResult


class ARIMAService:
    """Service for stock forecasting using ARIMA model"""

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

    def prepare_data(self, data: list[StokData]) -> pd.Series:
        """
        Prepare time series data from stock data

        Args:
            data: List of stock data points

        Returns:
            Pandas Series with datetime index
        """
        df = pd.DataFrame([d.model_dump() for d in data])
        df["tanggal"] = pd.to_datetime(df["tanggal"])
        df = df.sort_values("tanggal")
        df.set_index("tanggal", inplace=True)

        # Use stok_akhir as the target variable
        return df["stok_akhir"]

    def fit(self, data: list[StokData]) -> dict:
        """
        Fit ARIMA model to historical data

        Args:
            data: Historical stock data

        Returns:
            Dictionary with model metrics
        """
        self.series = self.prepare_data(data)

        # Fit ARIMA model
        self.model = ARIMA(self.series, order=self.order)
        self.fitted_model = self.model.fit()

        # Calculate metrics using in-sample predictions
        predictions = self.fitted_model.fittedvalues
        actuals = self.series[predictions.index]

        mae = mean_absolute_error(actuals, predictions)
        rmse = np.sqrt(mean_squared_error(actuals, predictions))

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "aic": round(self.fitted_model.aic, 2),
            "bic": round(self.fitted_model.bic, 2),
        }

    def forecast(self, periods: int) -> list[ForecastResult]:
        """
        Generate forecast for future periods

        Args:
            periods: Number of periods to forecast

        Returns:
            List of forecast results
        """
        if self.fitted_model is None or self.series is None:
            raise ValueError("Model must be fitted before forecasting")

        # Get forecast with confidence intervals
        forecast_result = self.fitted_model.get_forecast(steps=periods)
        predictions = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05)

        # Get last date from the series index
        last_date = self.series.index[-1]

        results = []
        for i in range(periods):
            forecast_date = last_date + timedelta(days=i + 1)
            results.append(
                ForecastResult(
                    date=forecast_date.strftime("%Y-%m-%d"),
                    value=round(max(0, predictions.iloc[i]), 2),
                    lower_bound=round(max(0, conf_int.iloc[i, 0]), 2),
                    upper_bound=round(max(0, conf_int.iloc[i, 1]), 2),
                )
            )

        return results


# Singleton instance
arima_service = ARIMAService()

