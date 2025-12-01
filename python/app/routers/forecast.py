"""
Router for Stock Forecasting (ARIMA)
"""

from fastapi import APIRouter, HTTPException

from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.services.arima_service import ARIMAService

router = APIRouter()


@router.post("/predict", response_model=ForecastResponse)
async def predict_stock(request: ForecastRequest):
    """
    Predict stock levels using ARIMA model

    Args:
        request: ForecastRequest with historical data and prediction periods

    Returns:
        ForecastResponse with predictions and metrics
    """
    if len(request.data) < 10:
        raise HTTPException(
            status_code=400,
            detail="Minimum 10 data points required for forecasting"
        )

    try:
        # Create new ARIMA service instance for this request
        service = ARIMAService(order=(1, 1, 1))

        # Fit model and get metrics
        metrics = service.fit(request.data)

        # Generate forecast
        predictions = service.forecast(request.periods)

        return ForecastResponse(
            model_used="ARIMA(1,1,1)",
            periods=request.periods,
            predictions=predictions,
            metrics=metrics,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")


@router.get("/info")
async def forecast_info():
    """Get information about the forecasting model"""
    return {
        "model": "ARIMA",
        "description": "AutoRegressive Integrated Moving Average for time series forecasting",
        "default_order": "(1, 1, 1)",
        "minimum_data_points": 10,
        "max_forecast_periods": 365,
    }

