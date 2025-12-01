<?php

namespace App\Http\Controllers;

use App\Http\Requests\DistribusiRequest;
use App\Http\Resources\BarangResource;
use App\Http\Resources\DistribusiResource;
use App\Http\Resources\PelangganResource;
use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Pelanggan;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DistribusiController extends Controller
{
    public function index(): Response
    {
        $distribusis = Distribusi::query()
            ->with(['pelanggan', 'barang'])
            ->orderByDesc('tanggal')
            ->paginate(15);

        return Inertia::render('transaksi/distribusi/index', [
            'distribusis' => DistribusiResource::collection($distribusis),
        ]);
    }

    public function create(): Response
    {
        $pelanggans = Pelanggan::where('is_active', true)->orderBy('nama')->get();
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/distribusi/create', [
            'pelanggans' => PelangganResource::collection($pelanggans)->resolve(),
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function store(DistribusiRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['biaya_bahan_bakar'] = $data['biaya_bahan_bakar'] ?? 0;
        $data['biaya_tenaga_kerja'] = $data['biaya_tenaga_kerja'] ?? 0;
        $data['biaya_tambahan'] = $data['biaya_tambahan'] ?? 0;
        $data['total_biaya_distribusi'] = $data['biaya_bahan_bakar'] + $data['biaya_tenaga_kerja'] + $data['biaya_tambahan'];

        Distribusi::create($data);

        return redirect()->route('distribusi.index')
            ->with('success', 'Data distribusi berhasil ditambahkan.');
    }

    public function show(Distribusi $distribusi): Response
    {
        $distribusi->load(['pelanggan', 'barang']);

        return Inertia::render('transaksi/distribusi/show', [
            'distribusi' => (new DistribusiResource($distribusi))->resolve(),
        ]);
    }

    public function edit(Distribusi $distribusi): Response
    {
        $pelanggans = Pelanggan::where('is_active', true)->orderBy('nama')->get();
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/distribusi/edit', [
            'distribusi' => (new DistribusiResource($distribusi))->resolve(),
            'pelanggans' => PelangganResource::collection($pelanggans)->resolve(),
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function update(DistribusiRequest $request, Distribusi $distribusi): RedirectResponse
    {
        $data = $request->validated();
        $data['biaya_bahan_bakar'] = $data['biaya_bahan_bakar'] ?? 0;
        $data['biaya_tenaga_kerja'] = $data['biaya_tenaga_kerja'] ?? 0;
        $data['biaya_tambahan'] = $data['biaya_tambahan'] ?? 0;
        $data['total_biaya_distribusi'] = $data['biaya_bahan_bakar'] + $data['biaya_tenaga_kerja'] + $data['biaya_tambahan'];

        $distribusi->update($data);

        return redirect()->route('distribusi.index')
            ->with('success', 'Data distribusi berhasil diperbarui.');
    }

    public function destroy(Distribusi $distribusi): RedirectResponse
    {
        $distribusi->delete();

        return redirect()->route('distribusi.index')
            ->with('success', 'Data distribusi berhasil dihapus.');
    }
}
