<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PenjualanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $penjualanId = $this->route('penjualan')?->id ?? $this->route('penjualan');

        return [
            'no_faktur' => [
                'required',
                'string',
                'max:50',
                Rule::unique('penjualans', 'no_faktur')->ignore($penjualanId),
            ],
            'pelanggan_id' => ['required', 'exists:pelanggans,id'],
            'barang_id' => ['required', 'exists:barangs,id'],
            'tanggal' => ['required', 'date'],
            'jumlah_kg' => ['required', 'numeric', 'min:0'],
            'harga_per_kg' => ['required', 'numeric', 'min:0'],
            'hutang' => ['nullable', 'numeric', 'min:0'],
            'pembayaran' => ['nullable', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_faktur.required' => 'Nomor faktur wajib diisi.',
            'no_faktur.unique' => 'Nomor faktur sudah digunakan.',
            'pelanggan_id.required' => 'Pelanggan wajib dipilih.',
            'barang_id.required' => 'Barang wajib dipilih.',
            'tanggal.required' => 'Tanggal wajib diisi.',
            'jumlah_kg.required' => 'Jumlah (kg) wajib diisi.',
            'harga_per_kg.required' => 'Harga per kg wajib diisi.',
        ];
    }
}
