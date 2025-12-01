<?php

namespace App\Http\Controllers;

use App\Http\Requests\StokRequest;
use App\Http\Resources\BarangResource;
use App\Http\Resources\StokResource;
use App\Models\Barang;
use App\Models\Stok;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StokController extends Controller
{
    public function index(): Response
    {
        $stoks = Stok::query()
            ->with('barang')
            ->orderByDesc('tanggal')
            ->paginate(15);

        return Inertia::render('transaksi/stok/index', [
            'stoks' => StokResource::collection($stoks),
        ]);
    }

    public function create(): Response
    {
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/stok/create', [
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function store(StokRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['stok_akhir'] = ($data['stok_awal'] ?? 0) + ($data['masuk'] ?? 0) - ($data['keluar'] ?? 0);

        Stok::create($data);

        return redirect()->route('stok.index')
            ->with('success', 'Data stok berhasil ditambahkan.');
    }

    public function show(Stok $stok): Response
    {
        $stok->load('barang');

        return Inertia::render('transaksi/stok/show', [
            'stok' => (new StokResource($stok))->resolve(),
        ]);
    }

    public function edit(Stok $stok): Response
    {
        $barangs = Barang::where('is_active', true)->orderBy('nama_barang')->get();

        return Inertia::render('transaksi/stok/edit', [
            'stok' => (new StokResource($stok))->resolve(),
            'barangs' => BarangResource::collection($barangs)->resolve(),
        ]);
    }

    public function update(StokRequest $request, Stok $stok): RedirectResponse
    {
        $data = $request->validated();
        $data['stok_akhir'] = ($data['stok_awal'] ?? 0) + ($data['masuk'] ?? 0) - ($data['keluar'] ?? 0);

        $stok->update($data);

        return redirect()->route('stok.index')
            ->with('success', 'Data stok berhasil diperbarui.');
    }

    public function destroy(Stok $stok): RedirectResponse
    {
        $stok->delete();

        return redirect()->route('stok.index')
            ->with('success', 'Data stok berhasil dihapus.');
    }
}
