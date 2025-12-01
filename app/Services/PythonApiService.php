<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;

class PythonApiService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.python_api.url', 'http://localhost:8000');
    }

    /**
     * Forecast stock using ARIMA model
     */
    public function forecastStock(array $stokData, int $periods): array
    {
        $response = Http::timeout(60)
            ->post("{$this->baseUrl}/api/forecast/predict", [
                'data' => $stokData,
                'periods' => $periods,
            ]);

        if ($response->failed()) {
            throw new RequestException($response);
        }

        return $response->json();
    }

    /**
     * Predict distribution cost using XGBoost model
     */
    public function predictDistributionCost(array $features): array
    {
        $response = Http::timeout(30)
            ->post("{$this->baseUrl}/api/distribution/predict", [
                'features' => $features,
            ]);

        if ($response->failed()) {
            throw new RequestException($response);
        }

        return $response->json();
    }

    /**
     * Train XGBoost model with distribution data
     */
    public function trainDistributionModel(array $trainingData): array
    {
        $response = Http::timeout(120)
            ->post("{$this->baseUrl}/api/distribution/train", [
                'data' => $trainingData,
            ]);

        if ($response->failed()) {
            throw new RequestException($response);
        }

        return $response->json();
    }

    /**
     * Check if Python API is healthy
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}

