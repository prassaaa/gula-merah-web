<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $barangId = $this->route('barang')?->id ?? $this->route('barang');

        return [
            'kode_barang' => [
                'required',
                'string',
                'max:50',
                Rule::unique('barangs', 'kode_barang')->ignore($barangId),
            ],
            'nama_barang' => ['required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'harga_per_kg' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_barang.required' => 'Kode barang wajib diisi.',
            'kode_barang.unique' => 'Kode barang sudah digunakan.',
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'harga_per_kg.required' => 'Harga per kg wajib diisi.',
            'harga_per_kg.min' => 'Harga per kg tidak boleh negatif.',
        ];
    }
}
