"""
Pydantic schemas for stock demand forecasting (ARIMA)
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class KebutuhanStokData(BaseModel):
    """Single weekly stock demand data point for ARIMA"""
    tanggal: date
    jumlah_terjual: float

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
    data: list[KebutuhanStokData] = Field(..., description="Historical weekly sales demand data")
    weeks: int = Field(default=7, ge=1, le=52, description="Number of weeks to forecast")


class ForecastResult(BaseModel):
    """Single forecast result"""
    week: str
    week_start: str
    week_end: str
    value: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    """Response schema for stock forecast"""
    model_used: str = "ARIMA"
    weeks: int
    predictions: list[ForecastResult]
    metrics: Optional[dict] = Field(default=None, description="Model performance metrics")
