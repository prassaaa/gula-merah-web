<?php

namespace App\Http\Controllers;

use App\Http\Requests\PelangganRequest;
use App\Http\Resources\PelangganResource;
use App\Models\Pelanggan;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PelangganController extends Controller
{
    public function index(): Response
    {
        $pelanggans = Pelanggan::query()
            ->orderBy('nama')
            ->paginate(10);

        return Inertia::render('master/pelanggan/index', [
            'pelanggans' => PelangganResource::collection($pelanggans),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master/pelanggan/create');
    }

    public function store(PelangganRequest $request): RedirectResponse
    {
        Pelanggan::create($request->validated());

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function show(Pelanggan $pelanggan): Response
    {
        return Inertia::render('master/pelanggan/show', [
            'pelanggan' => (new PelangganResource($pelanggan))->resolve(),
        ]);
    }

    public function edit(Pelanggan $pelanggan): Response
    {
        return Inertia::render('master/pelanggan/edit', [
            'pelanggan' => (new PelangganResource($pelanggan))->resolve(),
        ]);
    }

    public function update(PelangganRequest $request, Pelanggan $pelanggan): RedirectResponse
    {
        $pelanggan->update($request->validated());

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(Pelanggan $pelanggan): RedirectResponse
    {
        $pelanggan->delete();

        return redirect()->route('pelanggan.index')
            ->with('success', 'Pelanggan berhasil dihapus.');
    }
}
