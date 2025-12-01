<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Hutang;
use App\Models\Karyawan;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use App\Models\Stok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Route to appropriate dashboard based on role
        if ($user->hasRole('admin')) {
            return $this->adminDashboard();
        } elseif ($user->hasRole('karyawan')) {
            return $this->karyawanDashboard();
        } elseif ($user->hasRole('pelanggan')) {
            return $this->pelangganDashboard($user);
        }

        // Default fallback
        return $this->adminDashboard();
    }

    /**
     * Dashboard untuk Admin - Full statistics
     */
    private function adminDashboard(): Response
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Summary statistics
        $stats = [
            'totalBarang' => Barang::where('is_active', true)->count(),
            'totalPelanggan' => Pelanggan::where('is_active', true)->count(),
            'totalKaryawan' => Karyawan::where('is_active', true)->count(),
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
            'totalHutangBelumLunas' => Hutang::where('status', 'belum_lunas')->sum('sisa_hutang'),
            'jumlahHutangBelumLunas' => Hutang::where('status', 'belum_lunas')->count(),
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

        // Top debtors
        $topDebtors = Hutang::with(['penjualan.pelanggan'])
            ->where('status', 'belum_lunas')
            ->orderByDesc('sisa_hutang')
            ->limit(5)
            ->get()
            ->map(fn($h) => [
                'id' => $h->id,
                'pelanggan' => $h->penjualan?->pelanggan?->nama ?? '-',
                'sisa_hutang' => $h->sisa_hutang,
                'tanggal' => $h->tanggal?->format('d M Y'),
            ]);

        return Inertia::render('dashboard/admin', [
            'stats' => $stats,
            'recentSales' => $recentSales,
            'monthlySales' => $monthlySales,
            'stockLevels' => $stockLevels,
            'distributionByVehicle' => $distributionByVehicle,
            'topDebtors' => $topDebtors,
        ]);
    }

    /**
     * Dashboard untuk Karyawan - Operational view
     */
    private function karyawanDashboard(): Response
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $today = now()->toDateString();

        $stats = [
            'penjualanHariIni' => Penjualan::whereDate('tanggal', $today)->count(),
            'totalPenjualanHariIni' => Penjualan::whereDate('tanggal', $today)->sum('total_penjualan'),
            'distribusiHariIni' => Distribusi::whereDate('tanggal', $today)->count(),
            'penjualanBulanIni' => Penjualan::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->count(),
            'totalPenjualanBulanIni' => Penjualan::whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->sum('total_penjualan'),
        ];

        // Recent sales today
        $recentSales = Penjualan::with(['pelanggan', 'barang'])
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'no_faktur' => $p->no_faktur,
                'pelanggan' => $p->pelanggan?->nama ?? '-',
                'barang' => $p->barang?->nama_barang ?? '-',
                'jumlah_kg' => $p->jumlah_kg,
                'total' => $p->total_penjualan,
                'tanggal' => $p->tanggal?->format('d M Y'),
            ]);

        // Stock levels
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

        // Pending distributions
        $recentDistribusi = Distribusi::with(['pelanggan', 'barang'])
            ->orderByDesc('tanggal')
            ->limit(5)
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'faktur' => $d->faktur_distribusi,
                'pelanggan' => $d->pelanggan?->nama ?? '-',
                'barang' => $d->barang?->nama_barang ?? '-',
                'jumlah_kg' => $d->jumlah_kg,
                'tanggal' => $d->tanggal?->format('d M Y'),
            ]);

        return Inertia::render('dashboard/karyawan', [
            'stats' => $stats,
            'recentSales' => $recentSales,
            'stockLevels' => $stockLevels,
            'recentDistribusi' => $recentDistribusi,
        ]);
    }

    /**
     * Dashboard untuk Pelanggan - Personal view
     */
    private function pelangganDashboard($user): Response
    {
        $pelanggan = $user->pelanggan;

        if (!$pelanggan) {
            return Inertia::render('dashboard/pelanggan', [
                'stats' => null,
                'recentPurchases' => [],
                'hutangSummary' => null,
                'pelanggan' => null,
                'notLinked' => true,
            ]);
        }

        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Personal statistics
        $stats = [
            'totalPembelian' => Penjualan::where('pelanggan_id', $pelanggan->id)->count(),
            'totalNilaiPembelian' => Penjualan::where('pelanggan_id', $pelanggan->id)->sum('total_penjualan'),
            'pembelianBulanIni' => Penjualan::where('pelanggan_id', $pelanggan->id)
                ->whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->count(),
            'nilaiPembelianBulanIni' => Penjualan::where('pelanggan_id', $pelanggan->id)
                ->whereMonth('tanggal', $currentMonth)
                ->whereYear('tanggal', $currentYear)
                ->sum('total_penjualan'),
        ];

        // Hutang summary
        $hutangSummary = [
            'totalHutang' => Hutang::whereHas('penjualan', fn($q) => $q->where('pelanggan_id', $pelanggan->id))
                ->where('status', 'belum_lunas')
                ->sum('sisa_hutang'),
            'jumlahHutang' => Hutang::whereHas('penjualan', fn($q) => $q->where('pelanggan_id', $pelanggan->id))
                ->where('status', 'belum_lunas')
                ->count(),
            'totalLunas' => Hutang::whereHas('penjualan', fn($q) => $q->where('pelanggan_id', $pelanggan->id))
                ->where('status', 'lunas')
                ->count(),
        ];

        // Recent purchases
        $recentPurchases = Penjualan::with(['barang'])
            ->where('pelanggan_id', $pelanggan->id)
            ->orderByDesc('tanggal')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'no_faktur' => $p->no_faktur,
                'barang' => $p->barang?->nama_barang ?? '-',
                'jumlah_kg' => $p->jumlah_kg,
                'total' => $p->total_penjualan,
                'tanggal' => $p->tanggal?->format('d M Y'),
            ]);

        // Recent hutang
        $recentHutang = Hutang::with(['penjualan.barang'])
            ->whereHas('penjualan', fn($q) => $q->where('pelanggan_id', $pelanggan->id))
            ->where('status', 'belum_lunas')
            ->orderByDesc('tanggal')
            ->limit(5)
            ->get()
            ->map(fn($h) => [
                'id' => $h->id,
                'faktur' => $h->faktur_penjualan,
                'barang' => $h->penjualan?->barang?->nama_barang ?? '-',
                'sisa_hutang' => $h->sisa_hutang,
                'tanggal' => $h->tanggal?->format('d M Y'),
            ]);

        return Inertia::render('dashboard/pelanggan', [
            'stats' => $stats,
            'recentPurchases' => $recentPurchases,
            'hutangSummary' => $hutangSummary,
            'recentHutang' => $recentHutang,
            'pelanggan' => $pelanggan,
            'notLinked' => false,
        ]);
    }
}
