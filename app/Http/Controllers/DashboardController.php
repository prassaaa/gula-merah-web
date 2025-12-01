<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use App\Models\Stok;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Summary statistics
        $stats = [
            'totalBarang' => Barang::where('is_active', true)->count(),
            'totalPelanggan' => Pelanggan::where('is_active', true)->count(),
            'totalPenjualanBulanIni' => Penjualan::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->sum('total_penjualan'),
            'jumlahTransaksiBulanIni' => Penjualan::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->count(),
            'totalDistribusiBulanIni' => Distribusi::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->sum('total_biaya_distribusi'),
            'jumlahDistribusiBulanIni' => Distribusi::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->count(),
        ];

        // Recent sales (last 5 transactions)
        $recentSales = Penjualan::with(['pelanggan', 'barang'])
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'no_faktur' => $p->no_faktur,
                'pelanggan' => $p->pelanggan?->nama ?? '-',
                'barang' => $p->barang?->nama_barang ?? '-',
                'total' => $p->total_penjualan,
                'tanggal' => $p->tanggal?->format('d M Y'),
            ]);

        // Monthly sales chart data (last 6 months)
        $monthlySales = Penjualan::select(
            DB::raw('YEAR(tanggal) as year'),
            DB::raw('MONTH(tanggal) as month'),
            DB::raw('SUM(total_penjualan) as total')
        )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get()
            ->reverse()
            ->values()
            ->map(fn($item) => [
                'month' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                'total' => (int) $item->total,
            ]);

        // Stock levels by product (latest stock per barang)
        $stockLevels = Stok::select('barang_id', DB::raw('MAX(id) as latest_id'))
            ->groupBy('barang_id')
            ->get()
            ->map(function ($item) {
                $latestStok = Stok::with('barang')->find($item->latest_id);
                return [
                    'barang_id' => $latestStok->barang_id,
                    'nama_barang' => $latestStok->barang?->nama_barang ?? '-',
                    'stok_akhir' => $latestStok->stok_akhir,
                ];
            });

        // Distribution cost by vehicle type
        $distributionByVehicle = Distribusi::select(
            'jenis_kendaraan',
            DB::raw('SUM(total_biaya_distribusi) as total'),
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('jenis_kendaraan')
            ->get()
            ->map(fn($d) => [
                'jenis_kendaraan' => $d->jenis_kendaraan,
                'total' => (int) $d->total,
                'count' => (int) $d->count,
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentSales' => $recentSales,
            'monthlySales' => $monthlySales,
            'stockLevels' => $stockLevels,
            'distributionByVehicle' => $distributionByVehicle,
        ]);
    }
}
