<?php

namespace App\Http\Controllers;

use App\Http\Requests\HutangRequest;
use App\Http\Resources\HutangResource;
use App\Models\Hutang;
use App\Models\Penjualan;
use App\Services\HutangLedgerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HutangController extends Controller
{
    public function __construct(
        private HutangLedgerService $hutangLedger
    ) {}

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
                        $q2->where('nama', 'like', "%{$search}%");
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

        $filteredHutangs = (clone $query)->get();
        $currentBalances = $filteredHutangs
            ->groupBy(fn ($hutang) => $hutang->penjualan?->pelanggan?->id ?? 'tanpa-pelanggan')
            ->map(function ($items) {
                $latest = $items
                    ->sortByDesc(fn ($hutang) => $hutang->tanggal?->format('Y-m-d').'-'.str_pad((string) $hutang->id, 10, '0', STR_PAD_LEFT))
                    ->first();

                return [
                    'pelanggan' => $latest->penjualan?->pelanggan?->nama ?? 'Tanpa Pelanggan',
                    'total_sisa_hutang' => (float) $latest->sisa_hutang,
                    'jumlah_transaksi' => $items->count(),
                ];
            })
            ->sortByDesc('total_sisa_hutang')
            ->values();

        $hutangs = $query->orderBy('tanggal', 'desc')->paginate(10)->withQueryString();

        // Summary statistics
        $summary = [
            'total_hutang' => $currentBalances->sum('total_sisa_hutang'),
            'total_belum_lunas' => $currentBalances->where('total_sisa_hutang', '>', 0)->count(),
            'total_lunas' => $currentBalances->where('total_sisa_hutang', '<=', 0)->count(),
            'nilai_belum_lunas' => $currentBalances->where('total_sisa_hutang', '>', 0)->sum('total_sisa_hutang'),
        ];

        return Inertia::render('transaksi/hutang/index', [
            'hutangs' => HutangResource::collection($hutangs),
            'summary' => $summary,
            'pelangganSummaries' => $currentBalances->where('total_sisa_hutang', '>', 0)->values(),
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
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($penjualan) {
                return [
                    'id' => $penjualan->id,
                    'faktur_penjualan' => $penjualan->no_faktur,
                    'label' => sprintf(
                        '%s - %s - %s (Rp %s)',
                        $penjualan->tanggal?->format('d/m/Y') ?? '-',
                        $penjualan->pelanggan?->nama ?? 'N/A',
                        $penjualan->barang?->nama_barang ?? 'N/A',
                        number_format($penjualan->total_penjualan, 0, ',', '.')
                    ),
                    'nilai_faktur' => $penjualan->total_penjualan,
                    'dp_bayar' => $penjualan->pembayaran,
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
            $penjualan = Penjualan::findOrFail($data['penjualan_id']);
            $data['faktur_penjualan'] = $penjualan->no_faktur;
        }

        $hutang = Hutang::create($data);
        $hutang->load('penjualan');
        $this->hutangLedger->recalculateForPelanggan((int) $hutang->penjualan->pelanggan_id);

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
            'hutang' => (new HutangResource($hutang))->resolve(),
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
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($penjualan) {
                return [
                    'id' => $penjualan->id,
                    'faktur_penjualan' => $penjualan->no_faktur,
                    'label' => sprintf(
                        '%s - %s - %s (Rp %s)',
                        $penjualan->tanggal?->format('d/m/Y') ?? '-',
                        $penjualan->pelanggan?->nama ?? 'N/A',
                        $penjualan->barang?->nama_barang ?? 'N/A',
                        number_format($penjualan->total_penjualan, 0, ',', '.')
                    ),
                    'nilai_faktur' => $penjualan->total_penjualan,
                    'dp_bayar' => $penjualan->pembayaran,
                    'sisa_hutang' => $penjualan->sisa_hutang,
                ];
            });

        return Inertia::render('transaksi/hutang/edit', [
            'hutang' => (new HutangResource($hutang))->resolve(),
            'penjualans' => $penjualans,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(HutangRequest $request, Hutang $hutang)
    {
        $data = $request->validated();
        $oldPelangganId = $hutang->penjualan?->pelanggan_id;
        $data['sisa_hutang'] = 0;
        $data['status'] = 'belum_lunas';

        $hutang->update($data);
        $hutang->load('penjualan');

        if ($hutang->penjualan) {
            $hutang->penjualan->update([
                'no_faktur' => $data['faktur_penjualan'],
                'total_penjualan' => $data['nilai_faktur'],
                'hutang' => $data['nilai_faktur'],
                'pembayaran' => $data['dp_bayar'],
                'metode_pembayaran' => 'hutang',
            ]);
        }

        if ($oldPelangganId) {
            $this->hutangLedger->recalculateForPelanggan((int) $oldPelangganId);
        }
        if ($hutang->penjualan && $hutang->penjualan->pelanggan_id !== $oldPelangganId) {
            $this->hutangLedger->recalculateForPelanggan((int) $hutang->penjualan->pelanggan_id);
        }

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
        $hutang->load('penjualan');
        $currentBalance = $this->hutangLedger->currentBalanceForPelanggan((int) $hutang->penjualan->pelanggan_id);

        $request->validate([
            'jumlah_bayar' => ['required', 'numeric', 'min:1', 'max:'.$currentBalance],
        ], [
            'jumlah_bayar.required' => 'Jumlah bayar harus diisi.',
            'jumlah_bayar.min' => 'Jumlah bayar minimal Rp 1.',
            'jumlah_bayar.max' => 'Jumlah bayar tidak boleh melebihi sisa hutang.',
        ]);

        $jumlahBayar = $request->jumlah_bayar;
        $latestHutang = Hutang::whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $hutang->penjualan->pelanggan_id))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->firstOrFail();

        $newDpBayar = (float) $latestHutang->dp_bayar + (float) $jumlahBayar;

        $latestHutang->update([
            'dp_bayar' => $newDpBayar,
        ]);

        $this->hutangLedger->recalculateForPelanggan((int) $hutang->penjualan->pelanggan_id);
        $newStatus = $this->hutangLedger->currentBalanceForPelanggan((int) $hutang->penjualan->pelanggan_id) <= 0 ? 'lunas' : 'belum_lunas';

        return redirect()->back()
            ->with('success', 'Pembayaran berhasil dicatat. '.($newStatus === 'lunas' ? 'Hutang LUNAS!' : ''));
    }
}
