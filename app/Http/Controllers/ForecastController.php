<?php

namespace App\Http\Controllers;

use App\Http\Resources\BarangResource;
use App\Http\Resources\DistribusiResource;
use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Stok;
use App\Services\PythonApiService;
use Carbon\Carbon;
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
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'forecast_until' => ['nullable', 'date'],
            'periods' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();
        $stoks = Stok::with('barang')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        // Get historical stock data for ARIMA
        $stokData = Stok::where('barang_id', $request->barang_id)
            ->when($request->filled('start_date'), fn ($query) => $query->whereDate('tanggal', '>=', $request->start_date))
            ->when($request->filled('end_date'), fn ($query) => $query->whereDate('tanggal', '<=', $request->end_date))
            ->orderBy('tanggal')
            ->get()
            ->map(fn ($s) => [
                'tanggal' => $s->tanggal?->format('Y-m-d'),
                'stok_akhir' => (float) $s->stok_akhir,
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
            $lastDate = $stokData->last()['tanggal'];
            if ($request->filled('forecast_until') && Carbon::parse($request->forecast_until)->lte(Carbon::parse($lastDate))) {
                return Inertia::render('forecast/stok', [
                    'barangs' => BarangResource::collection($barangs)->resolve(),
                    'stoks' => $stoks,
                    'forecast' => [
                        'error' => 'Tanggal akhir prediksi harus setelah tanggal terakhir data histori.',
                    ],
                    'filters' => $request->only(['barang_id', 'start_date', 'end_date', 'forecast_until', 'periods']),
                ]);
            }

            $periods = $request->filled('forecast_until')
                ? (int) Carbon::parse($lastDate)->diffInDays(Carbon::parse($request->forecast_until))
                : (int) ($request->periods ?? 7);

            $result = $this->pythonApi->forecastStock($stokData->toArray(), $periods);
            $result['historical'] = $stokData->values()->toArray();

            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => $result,
                'filters' => $request->only(['barang_id', 'start_date', 'end_date', 'forecast_until', 'periods']),
            ]);
        } catch (\Exception $e) {
            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => [
                    'error' => 'Gagal melakukan forecasting: '.$e->getMessage(),
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
                    'error' => 'Gagal melakukan prediksi: '.$e->getMessage(),
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
        $distribusiData = Distribusi::all()->map(fn ($d) => [
            'jarak_kirim_km' => (int) $d->jarak_kirim_km,
            'jumlah_kg' => (float) $d->jumlah_kg,
            'jenis_kendaraan' => $d->jenis_kendaraan,
            'biaya_bahan_bakar' => (float) ($d->biaya_bahan_bakar ?? 0),
            'biaya_tenaga_kerja' => (float) ($d->biaya_tenaga_kerja ?? 0),
            'biaya_tambahan' => (float) ($d->biaya_tambahan ?? 0),
            'total_biaya_distribusi' => (float) $d->total_biaya_distribusi,
        ]);

        if ($distribusiData->count() < 50) {
            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => [
                    'error' => 'Data distribusi tidak cukup untuk training (minimal 50 data).',
                ],
            ]);
        }

        try {
            $result = $this->pythonApi->trainDistributionModel($distribusiData->toArray());

            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'training' => $result,
                'modelTrained' => true,
            ])->with('success', 'Model berhasil di-training!');
        } catch (\Exception $e) {
            return Inertia::render('forecast/distribusi', [
                'distribusis' => DistribusiResource::collection($distribusis)->resolve(),
                'prediction' => [
                    'error' => 'Gagal melakukan training: '.$e->getMessage(),
                ],
            ]);
        }
    }
}
