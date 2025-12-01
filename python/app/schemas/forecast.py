"""
Pydantic schemas for Stock Forecasting (ARIMA)
"""

from datetime import date, datetime
from typing import Optional, Union
from pydantic import BaseModel, Field, field_validator


class StokData(BaseModel):
    """Single stock data point - simplified for ARIMA"""
    tanggal: date
    stok_akhir: float

    @field_validator('tanggal', mode='before')
    @classmethod
    def parse_tanggal(cls, v):
        """Parse tanggal from various formats"""
        if isinstance(v, date):
            return v
        if isinstance(v, datetime):
            return v.date()
        if isinstance(v, str):
            # Handle ISO format with timezone
            if 'T' in v:
                return datetime.fromisoformat(v.replace('Z', '+00:00')).date()
            return date.fromisoformat(v)
        return v


class ForecastRequest(BaseModel):
    """Request schema for stock forecast"""
    data: list[StokData] = Field(..., description="Historical stock data")
    periods: int = Field(default=7, ge=1, le=365, description="Number of days to forecast")


class ForecastResult(BaseModel):
    """Single forecast result"""
    date: str
    value: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    """Response schema for stock forecast"""
    model_used: str = "ARIMA"
    periods: int
    predictions: list[ForecastResult]
    metrics: Optional[dict] = Field(default=None, description="Model performance metrics")

