<?php

namespace App\Http\Controllers;

use App\Http\Resources\BarangResource;
use App\Http\Resources\DistribusiResource;
use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Penjualan;
use App\Models\Stok;
use App\Services\PythonApiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

        $weeklyDemandData = $this->weeklyDemandData($request);
        $latestStock = $this->latestStockForBarang((int) $request->barang_id);
        $latestStockValue = (float) ($latestStock?->stok_akhir ?? 0);

        if ($weeklyDemandData->count() < 10) {
            return Inertia::render('forecast/stok', [
                'barangs' => BarangResource::collection($barangs)->resolve(),
                'stoks' => $stoks,
                'forecast' => [
                    'error' => 'Data penjualan mingguan tidak cukup untuk forecasting kebutuhan stok (minimal 10 minggu).',
                ],
                'filters' => $request->only(['barang_id', 'start_date', 'end_date', 'weeks']),
            ]);
        }

        try {
            $weeks = (int) $request->weeks;
            $pythonDemandData = $weeklyDemandData
                ->map(fn ($weeklyDemand) => [
                    'tanggal' => $weeklyDemand['tanggal'],
                    'jumlah_terjual' => $weeklyDemand['jumlah_terjual'],
                ])
                ->values()
                ->toArray();

            $result = $this->pythonApi->forecastStock($pythonDemandData, $weeks);
            $totalPredictedDemand = collect($result['predictions'] ?? [])->sum(fn ($prediction) => (float) ($prediction['value'] ?? 0));

            $result['historical'] = $weeklyDemandData->values()->toArray();
            $result['stok_aktual_terakhir'] = round($latestStockValue, 2);
            $result['total_kebutuhan_prediksi'] = round($totalPredictedDemand, 2);
            $result['estimasi_sisa_stok'] = round($latestStockValue - $totalPredictedDemand, 2);

            $cumulativePredictedDemand = 0.0;
            $result['weekly_summary'] = collect($result['predictions'] ?? [])
                ->map(function ($prediction, $index) use ($latestStockValue, &$cumulativePredictedDemand) {
                    $predicted = (float) ($prediction['value'] ?? 0);
                    $cumulativePredictedDemand += $predicted;
                    $estimatedRemainingStock = round($latestStockValue - $cumulativePredictedDemand, 2);
                    $shortage = round(max(0, -$estimatedRemainingStock), 2);
                    $needsRestock = $shortage > 0;

                    return [
                        'week' => $prediction['week'] ?? 'Minggu '.($index + 1),
                        'week_start' => $prediction['week_start'] ?? null,
                        'week_end' => $prediction['week_end'] ?? null,
                        'actual' => null,
                        'predicted' => round($predicted, 2),
                        'difference' => $estimatedRemainingStock,
                        'cumulative_predicted' => round($cumulativePredictedDemand, 2),
                        'estimated_remaining_stock' => $estimatedRemainingStock,
                        'shortage' => $shortage,
                        'status' => $needsRestock ? 'perlu_restock' : 'aman',
                        'status_label' => $needsRestock ? 'Kurang '.$shortage.' kg' : 'Sisa '.$estimatedRemainingStock.' kg',
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

    private function weeklyDemandData(Request $request): Collection
    {
        $penjualanRows = Penjualan::where('barang_id', $request->barang_id)
            ->when($request->filled('start_date'), fn ($query) => $query->whereDate('tanggal', '>=', $request->start_date))
            ->when($request->filled('end_date'), fn ($query) => $query->whereDate('tanggal', '<=', $request->end_date))
            ->orderBy('tanggal')
            ->get();

        if ($penjualanRows->isEmpty()) {
            return collect();
        }

        $groupedByWeek = $penjualanRows->groupBy(
            fn ($penjualan) => $penjualan->tanggal?->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d')
        );
        $weekKeys = $groupedByWeek->keys()->sort()->values();
        $weekEnd = Carbon::parse($weekKeys->first());
        $lastWeekEnd = Carbon::parse($weekKeys->last());
        $weeklyDemand = collect();
        $index = 1;

        while ($weekEnd->lessThanOrEqualTo($lastWeekEnd)) {
            $weekKey = $weekEnd->format('Y-m-d');
            $weeklyRows = $groupedByWeek->get($weekKey, collect());
            $weekStart = $weekEnd->copy()->startOfWeek(Carbon::MONDAY);

            $weeklyDemand->push([
                'week' => 'Minggu '.$index,
                'week_start' => $weekStart->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'tanggal' => $weekEnd->format('Y-m-d'),
                'jumlah_terjual' => (float) $weeklyRows->sum(fn ($penjualan) => (float) $penjualan->jumlah_kg),
            ]);

            $weekEnd->addWeek();
            $index++;
        }

        return $weeklyDemand;
    }

    private function latestStockForBarang(int $barangId): ?Stok
    {
        return Stok::where('barang_id', $barangId)
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->first();
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
