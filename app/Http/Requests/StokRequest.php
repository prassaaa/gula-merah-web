<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barang_id' => ['required', 'exists:barangs,id'],
            'tanggal' => ['required', 'date'],
            'stok_awal' => ['required', 'numeric', 'min:0'],
            'masuk' => ['required', 'numeric', 'min:0'],
            'keluar' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'barang_id.required' => 'Barang wajib dipilih.',
            'barang_id.exists' => 'Barang tidak ditemukan.',
            'tanggal.required' => 'Tanggal wajib diisi.',
            'stok_awal.required' => 'Stok awal wajib diisi.',
            'masuk.required' => 'Jumlah masuk wajib diisi.',
            'keluar.required' => 'Jumlah keluar wajib diisi.',
        ];
    }
}
