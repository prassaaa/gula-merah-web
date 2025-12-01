<?php

namespace App\Http\Controllers;

use App\Http\Requests\BarangRequest;
use App\Http\Resources\BarangResource;
use App\Models\Barang;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BarangController extends Controller
{
    public function index(): Response
    {
        $barangs = Barang::query()
            ->orderBy('nama_barang')
            ->paginate(10);

        return Inertia::render('master/barang/index', [
            'barangs' => BarangResource::collection($barangs),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/barang/create');
    }

    public function store(BarangRequest $request): RedirectResponse
    {
        Barang::create($request->validated());

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil ditambahkan.');
    }

    public function show(Barang $barang): Response
    {
        return Inertia::render('master/barang/show', [
            'barang' => (new BarangResource($barang))->resolve(),
        ]);
    }

    public function edit(Barang $barang): Response
    {
        return Inertia::render('master/barang/edit', [
            'barang' => (new BarangResource($barang))->resolve(),
        ]);
    }

    public function update(BarangRequest $request, Barang $barang): RedirectResponse
    {
        $barang->update($request->validated());

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(Barang $barang): RedirectResponse
    {
        $barang->delete();

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil dihapus.');
    }
}
