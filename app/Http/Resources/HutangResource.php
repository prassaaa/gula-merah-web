<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HutangResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'faktur_penjualan' => $this->faktur_penjualan,
            'penjualan_id' => $this->penjualan_id,
            'penjualan' => $this->whenLoaded('penjualan', function () {
                return [
                    'id' => $this->penjualan->id,
                    'tanggal_penjualan' => $this->penjualan->tanggal?->format('Y-m-d'),
                    'pelanggan_id' => $this->penjualan->pelanggan_id,
                    'barang_id' => $this->penjualan->barang_id,
                    'pelanggan' => $this->penjualan->pelanggan
                        ? (new PelangganResource($this->penjualan->pelanggan))->resolve()
                        : null,
                    'barang' => $this->penjualan->barang
                        ? (new BarangResource($this->penjualan->barang))->resolve()
                        : null,
                    'total_harga' => $this->penjualan->total_penjualan,
                ];
            }),
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'nilai_faktur' => $this->nilai_faktur,
            'dp_bayar' => $this->dp_bayar,
            'sisa_hutang' => $this->sisa_hutang,
            'status' => $this->status,
            'status_label' => $this->status === 'lunas' ? 'Lunas' : 'Belum Lunas',
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
