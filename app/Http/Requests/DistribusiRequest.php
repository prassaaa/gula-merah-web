<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DistribusiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $distribusiId = $this->route('distribusi')?->id ?? $this->route('distribusi');

        return [
            'faktur_distribusi' => [
                'required',
                'string',
                'max:50',
                Rule::unique('distribusis', 'faktur_distribusi')->ignore($distribusiId),
            ],
            'pelanggan_id' => ['required', 'exists:pelanggans,id'],
            'barang_id' => ['required', 'exists:barangs,id'],
            'tanggal' => ['required', 'date'],
            'jarak_kirim_km' => ['required', 'numeric', 'min:0'],
            'jumlah_kg' => ['required', 'numeric', 'min:0'],
            'jenis_kendaraan' => ['required', Rule::in(['pick_up', 'truk_sedang', 'truk_besar'])],
            'biaya_bahan_bakar' => ['nullable', 'numeric', 'min:0'],
            'biaya_tenaga_kerja' => ['nullable', 'numeric', 'min:0'],
            'biaya_tambahan' => ['nullable', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'faktur_distribusi.required' => 'Faktur distribusi wajib diisi.',
            'faktur_distribusi.unique' => 'Faktur distribusi sudah digunakan.',
            'pelanggan_id.required' => 'Pelanggan wajib dipilih.',
            'barang_id.required' => 'Barang wajib dipilih.',
            'tanggal.required' => 'Tanggal wajib diisi.',
            'jarak_kirim_km.required' => 'Jarak kirim wajib diisi.',
            'jumlah_kg.required' => 'Jumlah (kg) wajib diisi.',
            'jenis_kendaraan.required' => 'Jenis kendaraan wajib dipilih.',
            'jenis_kendaraan.in' => 'Jenis kendaraan tidak valid.',
        ];
    }
}
