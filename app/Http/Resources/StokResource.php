<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StokResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barang_id' => $this->barang_id,
            'barang' => $this->relationLoaded('barang') && $this->barang
                ? (new BarangResource($this->barang))->resolve()
                : null,
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'tanggal_formatted' => $this->tanggal?->format('d M Y'),
            'stok_awal' => $this->stok_awal,
            'masuk' => $this->masuk,
            'keluar' => $this->keluar,
            'stok_akhir' => $this->stok_akhir,
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
