<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PelangganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pelangganId = $this->route('pelanggan')?->id ?? $this->route('pelanggan');

        return [
            'kode_pelanggan' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pelanggans', 'kode_pelanggan')->ignore($pelangganId),
            ],
            'nama' => ['required', 'string', 'max:100'],
            'lokasi' => ['required', 'string', 'max:100'],
            'alamat' => ['nullable', 'string'],
            'telepon' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],
            'jarak_km' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_pelanggan.required' => 'Kode pelanggan wajib diisi.',
            'kode_pelanggan.unique' => 'Kode pelanggan sudah digunakan.',
            'nama.required' => 'Nama pelanggan wajib diisi.',
            'lokasi.required' => 'Lokasi wajib diisi.',
            'jarak_km.required' => 'Jarak (km) wajib diisi.',
            'jarak_km.min' => 'Jarak tidak boleh negatif.',
        ];
    }
}
