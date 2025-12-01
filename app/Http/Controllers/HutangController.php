<?php

namespace App\Http\Controllers;

use App\Http\Requests\HutangRequest;
use App\Http\Resources\HutangResource;
use App\Models\Hutang;
use App\Models\Penjualan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HutangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Hutang::with(['penjualan.pelanggan', 'penjualan.barang']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('faktur_penjualan', 'like', "%{$search}%")
                    ->orWhereHas('penjualan.pelanggan', function ($q2) use ($search) {
                        $q2->where('nama_pelanggan', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('tanggal', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('tanggal', '<=', $request->to_date);
        }

        $hutangs = $query->orderBy('tanggal', 'desc')->paginate(10)->withQueryString();

        // Summary statistics
        $summary = [
            'total_hutang' => Hutang::sum('sisa_hutang'),
            'total_belum_lunas' => Hutang::where('status', 'belum_lunas')->count(),
            'total_lunas' => Hutang::where('status', 'lunas')->count(),
            'nilai_belum_lunas' => Hutang::where('status', 'belum_lunas')->sum('sisa_hutang'),
        ];

        return Inertia::render('transaksi/hutang/index', [
            'hutangs' => HutangResource::collection($hutangs),
            'summary' => $summary,
            'filters' => $request->only(['search', 'status', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get penjualan yang belum ada hutangnya
        $penjualans = Penjualan::with(['pelanggan', 'barang'])
            ->whereDoesntHave('hutangs')
            ->where('sisa_hutang', '>', 0)
            ->orderBy('tanggal_penjualan', 'desc')
            ->get()
            ->map(function ($penjualan) {
                return [
                    'id' => $penjualan->id,
                    'label' => sprintf(
                        '%s - %s - %s (Rp %s)',
                        $penjualan->tanggal_penjualan->format('d/m/Y'),
                        $penjualan->pelanggan?->nama_pelanggan ?? 'N/A',
                        $penjualan->barang?->nama_barang ?? 'N/A',
                        number_format($penjualan->total_harga, 0, ',', '.')
                    ),
                    'nilai_faktur' => $penjualan->total_harga,
                    'dp_bayar' => $penjualan->dp_bayar,
                    'sisa_hutang' => $penjualan->sisa_hutang,
                ];
            });

        return Inertia::render('transaksi/hutang/create', [
            'penjualans' => $penjualans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(HutangRequest $request)
    {
        $data = $request->validated();

        // Generate faktur if not provided
        if (empty($data['faktur_penjualan'])) {
            $data['faktur_penjualan'] = 'HTG-' . date('Ymd') . '-' . str_pad(Hutang::count() + 1, 4, '0', STR_PAD_LEFT);
        }

        Hutang::create($data);

        return redirect()->route('hutang.index')
            ->with('success', 'Hutang berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Hutang $hutang)
    {
        $hutang->load(['penjualan.pelanggan', 'penjualan.barang']);

        return Inertia::render('transaksi/hutang/show', [
            'hutang' => new HutangResource($hutang),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Hutang $hutang)
    {
        $hutang->load(['penjualan.pelanggan', 'penjualan.barang']);

        $penjualans = Penjualan::with(['pelanggan', 'barang'])
            ->where(function ($query) use ($hutang) {
                $query->whereDoesntHave('hutangs')
                    ->orWhere('id', $hutang->penjualan_id);
            })
            ->orderBy('tanggal_penjualan', 'desc')
            ->get()
            ->map(function ($penjualan) {
                return [
                    'id' => $penjualan->id,
                    'label' => sprintf(
                        '%s - %s - %s (Rp %s)',
                        $penjualan->tanggal_penjualan->format('d/m/Y'),
                        $penjualan->pelanggan?->nama_pelanggan ?? 'N/A',
                        $penjualan->barang?->nama_barang ?? 'N/A',
                        number_format($penjualan->total_harga, 0, ',', '.')
                    ),
                    'nilai_faktur' => $penjualan->total_harga,
                    'dp_bayar' => $penjualan->dp_bayar,
                    'sisa_hutang' => $penjualan->sisa_hutang,
                ];
            });

        return Inertia::render('transaksi/hutang/edit', [
            'hutang' => new HutangResource($hutang),
            'penjualans' => $penjualans,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(HutangRequest $request, Hutang $hutang)
    {
        $hutang->update($request->validated());

        return redirect()->route('hutang.index')
            ->with('success', 'Hutang berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hutang $hutang)
    {
        $hutang->delete();

        return redirect()->route('hutang.index')
            ->with('success', 'Hutang berhasil dihapus.');
    }

    /**
     * Record payment (pembayaran).
     */
    public function bayar(Request $request, Hutang $hutang)
    {
        $request->validate([
            'jumlah_bayar' => ['required', 'numeric', 'min:1', 'max:' . $hutang->sisa_hutang],
        ], [
            'jumlah_bayar.required' => 'Jumlah bayar harus diisi.',
            'jumlah_bayar.min' => 'Jumlah bayar minimal Rp 1.',
            'jumlah_bayar.max' => 'Jumlah bayar tidak boleh melebihi sisa hutang.',
        ]);

        $jumlahBayar = $request->jumlah_bayar;
        $newDpBayar = $hutang->dp_bayar + $jumlahBayar;
        $newSisaHutang = $hutang->nilai_faktur - $newDpBayar;
        $newStatus = $newSisaHutang <= 0 ? 'lunas' : 'belum_lunas';

        $hutang->update([
            'dp_bayar' => $newDpBayar,
            'sisa_hutang' => max(0, $newSisaHutang),
            'status' => $newStatus,
        ]);

        // Update related penjualan if exists
        if ($hutang->penjualan) {
            $hutang->penjualan->update([
                'dp_bayar' => $newDpBayar,
                'sisa_hutang' => max(0, $newSisaHutang),
                'status' => $newStatus,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Pembayaran berhasil dicatat. ' . ($newStatus === 'lunas' ? 'Hutang LUNAS!' : ''));
    }
}
