<?php

namespace App\Http\Controllers;

use App\Http\Requests\PenjualanRequest;
use App\Http\Resources\BarangResource;
use App\Http\Resources\PelangganResource;
use App\Http\Resources\PenjualanResource;
use App\Models\Barang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use Illuminate\Http\RedirectResponse;
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
        $data['total_penjualan'] = $data['jumlah_kg'] * $data['harga_per_kg'];
        $data['hutang'] = $data['hutang'] ?? $data['total_penjualan'];
        $data['pembayaran'] = $data['pembayaran'] ?? 0;
        $data['sisa_hutang'] = $data['hutang'] - $data['pembayaran'];

        Penjualan::create($data);

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
        $data['total_penjualan'] = $data['jumlah_kg'] * $data['harga_per_kg'];
        $data['hutang'] = $data['hutang'] ?? $data['total_penjualan'];
        $data['pembayaran'] = $data['pembayaran'] ?? 0;
        $data['sisa_hutang'] = $data['hutang'] - $data['pembayaran'];

        $penjualan->update($data);

        return redirect()->route('penjualan.index')
            ->with('success', 'Data penjualan berhasil diperbarui.');
    }

    public function destroy(Penjualan $penjualan): RedirectResponse
    {
        $penjualan->delete();

        return redirect()->route('penjualan.index')
            ->with('success', 'Data penjualan berhasil dihapus.');
    }
}
