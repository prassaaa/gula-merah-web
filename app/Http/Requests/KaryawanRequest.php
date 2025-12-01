<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KaryawanRequest extends FormRequest
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
            'nama_karyawan' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:100'],
            'kontak' => ['nullable', 'string', 'max:50'],
            'alamat' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nama_karyawan.required' => 'Nama karyawan harus diisi.',
            'nama_karyawan.max' => 'Nama karyawan maksimal 255 karakter.',
            'jabatan.required' => 'Jabatan harus diisi.',
            'jabatan.max' => 'Jabatan maksimal 100 karakter.',
        ];
    }
}
