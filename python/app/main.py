"""
FastAPI Application for Gula Merah AI Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import forecast, distribution

app = FastAPI(
    title="Gula Merah AI Service",
    description="Stock Forecasting (ARIMA) and Distribution Cost Prediction (XGBoost)",
    version="1.0.0",
)

# CORS middleware for Laravel communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:8080", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(forecast.router, prefix="/api/forecast", tags=["Stock Forecast"])
app.include_router(distribution.router, prefix="/api/distribution", tags=["Distribution Cost"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Gula Merah AI Service",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {"status": "healthy"}

