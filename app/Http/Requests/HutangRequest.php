<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HutangRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'faktur_penjualan' => ['required', 'string', 'max:50'],
            'penjualan_id' => ['required', 'exists:penjualans,id'],
            'tanggal' => ['required', 'date'],
            'nilai_faktur' => ['required', 'numeric', 'min:0'],
            'dp_bayar' => ['required', 'numeric', 'min:0'],
            'sisa_hutang' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:belum_lunas,lunas'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'faktur_penjualan.required' => 'Nomor faktur harus diisi.',
            'penjualan_id.required' => 'Penjualan harus dipilih.',
            'penjualan_id.exists' => 'Penjualan tidak ditemukan.',
            'tanggal.required' => 'Tanggal harus diisi.',
            'nilai_faktur.required' => 'Nilai faktur harus diisi.',
            'nilai_faktur.min' => 'Nilai faktur tidak boleh negatif.',
            'dp_bayar.required' => 'DP bayar harus diisi.',
            'dp_bayar.min' => 'DP bayar tidak boleh negatif.',
            'sisa_hutang.required' => 'Sisa hutang harus diisi.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status harus belum_lunas atau lunas.',
        ];
    }
}
