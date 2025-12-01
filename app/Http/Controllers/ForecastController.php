<?php

namespace App\Http\Controllers;

use App\Http\Resources\BarangResource;
use App\Http\Resources\DistribusiResource;
use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Stok;
use App\Services\PythonApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForecastController extends Controller
{
    public function __construct(
        private PythonApiService $pythonApi
    ) {}

    public function stokIndex(): Response
    {
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();
        $stoks = Stok::with('barang')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        return Inertia::render('forecast/stok', [
            'barangs' => BarangResource::collection($barangs)->resolve(),
            'stoks' => $stoks,
        ]);
    }

    public function stokPredict(Request $request): Response
    {
        $request->validate([
            'barang_id' => ['required', 'exists:barangs,id'],
            'periods' => ['required', 'integer', 'min:1', 'max:30'],
        ]);

        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();
        $stoks = Stok::with('barang')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        // Get historical stock data for ARIMA
        $stokData = Stok::where('barang_id', $request->barang_id)
            ->orderBy('tanggal')
            ->get()
            ->map(fn($s) => [
                'tanggal' => $s->tanggal,
                'stok_akhir' => $s->stok_akhir,
            ]);

        if ($stokData->count() < 10) {
            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => [
                    'error' => 'Data stok tidak cukup untuk forecasting (minimal 10 data).',
                ],
            ]);
        }

        try {
            $result = $this->pythonApi->forecastStock($stokData->toArray(), (int) $request->periods);

            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => $result,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => [
                    'error' => 'Gagal melakukan forecasting: ' . $e->getMessage(),
                ],
            ]);
        }
    }

    public function distribusiIndex(): Response
    {
        $distribusis = Distribusi::with('pelanggan')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        return Inertia::render('forecast/distribusi', [
            'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
        ]);
    }

    public function distribusiPredict(Request $request): Response
    {
        $request->validate([
            'jarak_kirim_km' => ['required', 'numeric', 'min:0'],
            'jumlah_kg' => ['required', 'numeric', 'min:0'],
            'jenis_kendaraan' => ['required', 'in:pick_up,truk_sedang,truk_besar'],
        ]);

        $distribusis = Distribusi::with('pelanggan')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        try {
            $result = $this->pythonApi->predictDistributionCost([
                'jarak_kirim_km' => (float) $request->jarak_kirim_km,
                'jumlah_kg' => (float) $request->jumlah_kg,
                'jenis_kendaraan' => $request->jenis_kendaraan,
            ]);

            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => $result,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => [
                    'error' => 'Gagal melakukan prediksi: ' . $e->getMessage(),
                ],
            ]);
        }
    }

    public function distribusiTrain(Request $request): Response
    {
        $distribusis = Distribusi::with('pelanggan')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        // Get all distribution data for training
        $distribusiData = Distribusi::all()->map(fn($d) => [
            'jarak_kirim_km' => (int) $d->jarak_kirim_km,
            'jumlah_kg' => (float) $d->jumlah_kg,
            'jenis_kendaraan' => $d->jenis_kendaraan,
            'biaya_bahan_bakar' => (float) ($d->biaya_bahan_bakar ?? 0),
            'biaya_tenaga_kerja' => (float) ($d->biaya_tenaga_kerja ?? 0),
            'biaya_tambahan' => (float) ($d->biaya_tambahan ?? 0),
            'total_biaya_distribusi' => (float) $d->total_biaya_distribusi,
        ]);

        if ($distribusiData->count() < 10) {
            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => [
                    'error' => 'Data distribusi tidak cukup untuk training (minimal 10 data).',
                ],
            ]);
        }

        try {
            $result = $this->pythonApi->trainDistributionModel($distribusiData->toArray());

            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'modelTrained' => true,
            ])->with('success', 'Model berhasil di-training!');
        } catch (\Exception $e) {
            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => [
                    'error' => 'Gagal melakukan training: ' . $e->getMessage(),
                ],
            ]);
        }
    }
}
