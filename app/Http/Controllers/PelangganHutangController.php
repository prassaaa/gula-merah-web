<?php

namespace App\Http\Controllers;

use App\Models\Hutang;
use App\Models\Penjualan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PelangganHutangController extends Controller
{
    /**
     * Display a listing of the authenticated pelanggan's hutang.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $pelanggan = $user->pelanggan;

        if (!$pelanggan) {
            return redirect()->route('dashboard')
                ->with('error', 'Akun Anda tidak terhubung dengan data pelanggan.');
        }

        $query = Hutang::with(['penjualan.pelanggan', 'penjualan.barang'])
            ->whereHas('penjualan', function ($q) use ($pelanggan) {
                $q->where('pelanggan_id', $pelanggan->id);
            });

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('penjualan.barang', function ($q) use ($search) {
                    $q->where('nama_barang', 'like', "%{$search}%");
                })
                ->orWhere('faktur_penjualan', 'like', "%{$search}%");
            });
        }

        $hutangs = $query->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Statistics
        $totalHutang = Hutang::whereHas('penjualan', function ($q) use ($pelanggan) {
                $q->where('pelanggan_id', $pelanggan->id);
            })
            ->where('status', 'belum_lunas')
            ->sum('sisa_hutang');

        $totalLunas = Hutang::whereHas('penjualan', function ($q) use ($pelanggan) {
                $q->where('pelanggan_id', $pelanggan->id);
            })
            ->where('status', 'lunas')
            ->count();

        return Inertia::render('pelanggan/hutang/index', [
            'hutangs' => $hutangs,
            'filters' => $request->only(['search', 'status']),
            'statistics' => [
                'total_hutang' => $totalHutang,
                'total_lunas' => $totalLunas,
            ],
            'pelanggan' => $pelanggan,
        ]);
    }

    /**
     * Display the specified hutang.
     */
    public function show(Request $request, Hutang $hutang)
    {
        $user = $request->user();
        $pelanggan = $user->pelanggan;

        // Verify ownership through penjualan relationship
        $hutang->load(['penjualan.pelanggan', 'penjualan.barang']);

        if (!$pelanggan || !$hutang->penjualan || $hutang->penjualan->pelanggan_id !== $pelanggan->id) {
            abort(403, 'Anda tidak memiliki akses ke data ini.');
        }

        return Inertia::render('pelanggan/hutang/show', [
            'hutang' => $hutang,
        ]);
    }

    /**
     * Display a listing of the authenticated pelanggan's penjualan.
     */
    public function penjualanIndex(Request $request)
    {
        $user = $request->user();
        $pelanggan = $user->pelanggan;

        if (!$pelanggan) {
            return redirect()->route('dashboard')
                ->with('error', 'Akun Anda tidak terhubung dengan data pelanggan.');
        }

        $query = Penjualan::with(['pelanggan', 'barang'])
            ->where('pelanggan_id', $pelanggan->id);

        // Filter by date range
        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tanggal_penjualan', '>=', $request->dari_tanggal);
        }
        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tanggal_penjualan', '<=', $request->sampai_tanggal);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('barang', function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%");
            });
        }

        $penjualans = $query->orderBy('tanggal_penjualan', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Statistics
        $totalPembelian = Penjualan::where('pelanggan_id', $pelanggan->id)->count();
        $totalNilai = Penjualan::where('pelanggan_id', $pelanggan->id)->sum('total_harga');

        return Inertia::render('pelanggan/penjualan/index', [
            'penjualans' => $penjualans,
            'filters' => $request->only(['search', 'dari_tanggal', 'sampai_tanggal']),
            'statistics' => [
                'total_pembelian' => $totalPembelian,
                'total_nilai' => $totalNilai,
            ],
            'pelanggan' => $pelanggan,
        ]);
    }
}
