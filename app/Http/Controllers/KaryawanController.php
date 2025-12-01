<?php

namespace App\Http\Controllers;

use App\Http\Requests\KaryawanRequest;
use App\Http\Resources\KaryawanResource;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KaryawanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Karyawan::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_karyawan', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%")
                    ->orWhere('kontak', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by jabatan
        if ($request->has('jabatan') && $request->jabatan) {
            $query->where('jabatan', $request->jabatan);
        }

        $karyawans = $query->orderBy('nama_karyawan')->paginate(10)->withQueryString();

        // Get unique jabatan for filter dropdown
        $jabatanList = Karyawan::distinct()->pluck('jabatan')->filter()->values();

        return Inertia::render('master/karyawan/index', [
            'karyawans' => KaryawanResource::collection($karyawans),
            'jabatanList' => $jabatanList,
            'filters' => $request->only(['search', 'status', 'jabatan']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('master/karyawan/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KaryawanRequest $request)
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        Karyawan::create($data);

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Karyawan $karyawan)
    {
        return Inertia::render('master/karyawan/show', [
            'karyawan' => new KaryawanResource($karyawan),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Karyawan $karyawan)
    {
        return Inertia::render('master/karyawan/edit', [
            'karyawan' => new KaryawanResource($karyawan),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KaryawanRequest $request, Karyawan $karyawan)
    {
        $karyawan->update($request->validated());

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Karyawan $karyawan)
    {
        $karyawan->delete();

        return redirect()->route('karyawan.index')
            ->with('success', 'Karyawan berhasil dihapus.');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(Karyawan $karyawan)
    {
        $karyawan->update(['is_active' => !$karyawan->is_active]);

        return redirect()->back()
            ->with('success', 'Status karyawan berhasil diubah.');
    }
}
