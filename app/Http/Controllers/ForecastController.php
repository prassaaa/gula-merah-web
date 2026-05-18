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
            'weeks' => ['required', 'integer', 'min:1', 'max:52'],
        ]);

        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();
        $stoks = Stok::with('barang')
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get();

        $stokRows = Stok::where('barang_id', $request->barang_id)
            ->when($request->filled('start_date'), fn ($query) => $query->whereDate('tanggal', '>=', $request->start_date))
            ->when($request->filled('end_date'), fn ($query) => $query->whereDate('tanggal', '<=', $request->end_date))
            ->orderBy('tanggal')
            ->get();

        $weeklyStokData = $stokRows
            ->groupBy(fn ($stok) => $stok->tanggal?->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d'))
            ->values()
            ->map(function ($weeklyRows, $index) {
                $latestStock = $weeklyRows->sortBy('tanggal')->last();
                $weekEnd = $latestStock->tanggal->copy()->endOfWeek(Carbon::SUNDAY);
                $weekStart = $weekEnd->copy()->startOfWeek(Carbon::MONDAY);

                return [
                    'week' => 'Minggu '.($index + 1),
                    'week_start' => $weekStart->format('Y-m-d'),
                    'week_end' => $weekEnd->format('Y-m-d'),
                    'tanggal' => $weekEnd->format('Y-m-d'),
                    'stok_akhir' => (float) $latestStock->stok_akhir,
                ];
            });

        if ($weeklyStokData->count() < 10) {
            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => [
                    'error' => 'Data stok mingguan tidak cukup untuk forecasting (minimal 10 minggu).',
                ],
                'filters' => $request->only(['barang_id', 'start_date', 'end_date', 'weeks']),
            ]);
        }

        try {
            $weeks = (int) $request->weeks;
            $pythonStokData = $weeklyStokData
                ->map(fn ($weeklyStock) => [
                    'tanggal' => $weeklyStock['tanggal'],
                    'stok_akhir' => $weeklyStock['stok_akhir'],
                ])
                ->values()
                ->toArray();

            $result = $this->pythonApi->forecastStock($pythonStokData, $weeks);
            $latestActualStock = (float) $weeklyStokData->last()['stok_akhir'];

            $result['historical'] = $weeklyStokData->values()->toArray();
            $result['weekly_summary'] = collect($result['predictions'] ?? [])
                ->map(function ($prediction, $index) use ($latestActualStock) {
                    $predicted = (float) ($prediction['value'] ?? 0);
                    $difference = round($predicted - $latestActualStock, 2);
                    $needsRestock = $predicted > $latestActualStock;

                    return [
                        'week' => $prediction['week'] ?? 'Minggu '.($index + 1),
                        'week_start' => $prediction['week_start'] ?? null,
                        'week_end' => $prediction['week_end'] ?? null,
                        'actual' => round($latestActualStock, 2),
                        'predicted' => round($predicted, 2),
                        'difference' => $difference,
                        'status' => $needsRestock ? 'perlu_restock' : 'aman',
                        'status_label' => $needsRestock ? 'Kurang '.abs($difference).' kg' : 'Aman',
                    ];
                })
                ->values()
                ->toArray();

            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => $result,
                'filters' => $request->only(['barang_id', 'start_date', 'end_date', 'weeks']),
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
