<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarangResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_barang' => $this->kode_barang,
            'nama_barang' => $this->nama_barang,
            'deskripsi' => $this->deskripsi,
            'harga_per_kg' => $this->harga_per_kg,
            'harga_per_kg_formatted' => 'Rp ' . number_format($this->harga_per_kg, 0, ',', '.'),
            'satuan' => $this->satuan,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
