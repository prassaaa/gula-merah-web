"""
Pydantic schemas for Distribution Cost Prediction (XGBoost)
"""

from pydantic import BaseModel, Field


class DistribusiFeatures(BaseModel):
    """Features for distribution cost prediction"""
    jarak_kirim_km: int = Field(..., ge=0, description="Delivery distance in km")
    jumlah_kg: float = Field(..., ge=0, description="Weight in kg")
    jenis_kendaraan: str = Field(..., description="Vehicle type: pick_up, truk_sedang, truk_besar")


class PredictionRequest(BaseModel):
    """Request schema for distribution cost prediction"""
    features: DistribusiFeatures


class BatchPredictionRequest(BaseModel):
    """Request schema for batch distribution cost prediction"""
    items: list[DistribusiFeatures]


class CostBreakdown(BaseModel):
    """Predicted cost breakdown"""
    biaya_bahan_bakar: float
    biaya_tenaga_kerja: float
    biaya_tambahan: float
    total_biaya: float


class PredictionResponse(BaseModel):
    """Response schema for single prediction"""
    input_features: DistribusiFeatures
    prediction: CostBreakdown
    confidence_score: float = Field(ge=0, le=1, description="Model confidence")


class BatchPredictionResponse(BaseModel):
    """Response schema for batch prediction"""
    predictions: list[PredictionResponse]
    model_version: str = "1.0.0"


class TrainingDataItem(BaseModel):
    """Single training data item"""
    jarak_kirim_km: int
    jumlah_kg: float
    jenis_kendaraan: str
    biaya_bahan_bakar: float
    biaya_tenaga_kerja: float
    biaya_tambahan: float
    total_biaya_distribusi: float


class TrainRequest(BaseModel):
    """Request schema for model training"""
    data: list[TrainingDataItem]


class TrainResponse(BaseModel):
    """Response schema for model training"""
    status: str
    message: str
    metrics: dict = Field(default_factory=dict, description="Training metrics (MAE, RMSE, R2)")

