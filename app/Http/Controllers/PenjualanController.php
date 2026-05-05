<?php

namespace App\Http\Controllers;

use App\Http\Requests\PenjualanRequest;
use App\Http\Resources\BarangResource;
use App\Http\Resources\PelangganResource;
use App\Http\Resources\PenjualanResource;
use App\Models\Barang;
use App\Models\Hutang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PenjualanController extends Controller
{
    public function index(): Response
    {
        $penjualans = Penjualan::query()
            ->with(['pelanggan', 'barang'])
            ->orderByDesc('tanggal')
            ->paginate(15);

        return Inertia::render('transaksi/penjualan/index', [
            'penjualans' => PenjualanResource::collection($penjualans),
        ]);
    }

    public function create(): Response
    {
        $pelanggans = Pelanggan::where('is_active', true)->orderBy('nama')->get();
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/penjualan/create', [
            'pelanggans' => PelangganResource::collection($pelanggans)->resolve(),
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function store(PenjualanRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $data = $this->preparePenjualanData($data);
            $penjualan = Penjualan::create($data);

            $this->syncHutang($penjualan);
        });

        return redirect()->route('penjualan.index')
            ->with('success', 'Data penjualan berhasil ditambahkan.');
    }

    public function show(Penjualan $penjualan): Response
    {
        $penjualan->load(['pelanggan', 'barang']);

        return Inertia::render('transaksi/penjualan/show', [
            'penjualan' => (new PenjualanResource($penjualan))->resolve(),
        ]);
    }

    public function edit(Penjualan $penjualan): Response
    {
        $pelanggans = Pelanggan::where('is_active', true)->orderBy('nama')->get();
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/penjualan/edit', [
            'penjualan' => (new PenjualanResource($penjualan))->resolve(),
            'pelanggans' => PelangganResource::collection($pelanggans)->resolve(),
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function update(PenjualanRequest $request, Penjualan $penjualan): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $penjualan) {
            $penjualan->update($this->preparePenjualanData($data, $penjualan));
            $this->syncHutang($penjualan->fresh());
        });

        return redirect()->route('penjualan.index')
            ->with('success', 'Data penjualan berhasil diperbarui.');
    }

    public function destroy(Penjualan $penjualan): RedirectResponse
    {
        $penjualan->delete();

        return redirect()->route('penjualan.index')
            ->with('success', 'Data penjualan berhasil dihapus.');
    }

    private function preparePenjualanData(array $data, ?Penjualan $penjualan = null): array
    {
        $data['total_penjualan'] = (float) $data['jumlah_kg'] * (float) $data['harga_per_kg'];
        $data['metode_pembayaran'] = $data['metode_pembayaran'] ?? 'hutang';

        if ($penjualan === null || empty($data['no_faktur'])) {
            $data['no_faktur'] = $this->generateNoFaktur((int) $data['barang_id'], $data['tanggal'], $penjualan?->id);
        }

        if ($data['metode_pembayaran'] === 'cash') {
            $data['hutang'] = 0;
            $data['pembayaran'] = $data['total_penjualan'];
            $data['sisa_hutang'] = 0;
            $data['status'] = 'lunas';

            return $data;
        }

        $data['hutang'] = $data['total_penjualan'];
        $data['pembayaran'] = min((float) ($data['pembayaran'] ?? 0), $data['total_penjualan']);
        $data['sisa_hutang'] = max(0, $data['hutang'] - $data['pembayaran']);
        $data['status'] = $data['sisa_hutang'] <= 0 ? 'lunas' : 'belum_lunas';

        return $data;
    }

    private function generateNoFaktur(int $barangId, string $tanggal, ?int $ignorePenjualanId = null): string
    {
        $barang = Barang::findOrFail($barangId);
        $datePart = date('Ymd', strtotime($tanggal));
        $prefix = "INV-PJ-{$barang->kode_barang}-{$datePart}";

        $lastSequence = Penjualan::where('no_faktur', 'like', "{$prefix}-%")
            ->when($ignorePenjualanId, fn ($query) => $query->where('id', '!=', $ignorePenjualanId))
            ->pluck('no_faktur')
            ->map(fn ($faktur) => (int) str_replace("{$prefix}-", '', $faktur))
            ->max() ?? 0;

        return $prefix.'-'.str_pad($lastSequence + 1, 3, '0', STR_PAD_LEFT);
    }

    private function syncHutang(Penjualan $penjualan): void
    {
        if ($penjualan->metode_pembayaran === 'cash') {
            $penjualan->hutangs()->delete();

            return;
        }

        Hutang::updateOrCreate(
            ['penjualan_id' => $penjualan->id],
            [
                'faktur_penjualan' => $penjualan->no_faktur,
                'tanggal' => $penjualan->tanggal,
                'nilai_faktur' => $penjualan->total_penjualan,
                'dp_bayar' => $penjualan->pembayaran,
                'sisa_hutang' => $penjualan->sisa_hutang,
                'status' => $penjualan->status,
            ]
        );
    }
}
