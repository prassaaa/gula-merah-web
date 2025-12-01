"""
Router for Distribution Cost Prediction (XGBoost)
"""

from fastapi import APIRouter, HTTPException

from app.schemas.distribution import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    TrainRequest,
    TrainResponse,
)
from app.services.xgboost_service import xgboost_service

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_cost(request: PredictionRequest):
    """
    Predict distribution cost for a single delivery

    Args:
        request: PredictionRequest with delivery features

    Returns:
        PredictionResponse with cost breakdown
    """
    try:
        cost_breakdown, confidence = xgboost_service.predict(request.features)

        return PredictionResponse(
            input_features=request.features,
            prediction=cost_breakdown,
            confidence_score=confidence,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_cost_batch(request: BatchPredictionRequest):
    """
    Predict distribution costs for multiple deliveries

    Args:
        request: BatchPredictionRequest with list of delivery features

    Returns:
        BatchPredictionResponse with all predictions
    """
    try:
        predictions = []
        for features in request.items:
            cost_breakdown, confidence = xgboost_service.predict(features)
            predictions.append(
                PredictionResponse(
                    input_features=features,
                    prediction=cost_breakdown,
                    confidence_score=confidence,
                )
            )

        return BatchPredictionResponse(
            predictions=predictions,
            model_version="1.0.0",
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Train XGBoost model with historical distribution data

    Args:
        request: TrainRequest with training data

    Returns:
        TrainResponse with training status and metrics
    """
    if len(request.data) < 50:
        raise HTTPException(
            status_code=400,
            detail="Minimum 50 data points required for training"
        )

    try:
        metrics = xgboost_service.train(request.data)

        return TrainResponse(
            status="success",
            message="Model trained successfully",
            metrics=metrics,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@router.get("/info")
async def distribution_info():
    """Get information about the distribution cost prediction model"""
    return {
        "model": "XGBoost",
        "description": "Gradient Boosting for distribution cost prediction",
        "features": ["jarak_kirim_km", "jumlah_kg", "jenis_kendaraan"],
        "vehicle_types": ["pick_up", "truk_sedang", "truk_besar"],
    }

