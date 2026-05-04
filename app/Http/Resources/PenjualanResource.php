<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PenjualanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'no_faktur' => $this->no_faktur,
            'pelanggan_id' => $this->pelanggan_id,
            'pelanggan' => $this->relationLoaded('pelanggan') && $this->pelanggan
                ? (new PelangganResource($this->pelanggan))->resolve()
                : null,
            'barang_id' => $this->barang_id,
            'barang' => $this->relationLoaded('barang') && $this->barang
                ? (new BarangResource($this->barang))->resolve()
                : null,
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'tanggal_formatted' => $this->tanggal?->format('d M Y'),
            'jumlah_kg' => $this->jumlah_kg,
            'harga_per_kg' => $this->harga_per_kg,
            'harga_per_kg_formatted' => 'Rp '.number_format($this->harga_per_kg, 0, ',', '.'),
            'total_penjualan' => $this->total_penjualan,
            'total_penjualan_formatted' => 'Rp '.number_format($this->total_penjualan, 0, ',', '.'),
            'metode_pembayaran' => $this->metode_pembayaran ?? ($this->sisa_hutang > 0 ? 'hutang' : 'cash'),
            'metode_pembayaran_label' => ($this->metode_pembayaran ?? ($this->sisa_hutang > 0 ? 'hutang' : 'cash')) === 'cash' ? 'Cash' : 'Hutang',
            'hutang' => $this->hutang,
            'hutang_formatted' => 'Rp '.number_format($this->hutang, 0, ',', '.'),
            'pembayaran' => $this->pembayaran,
            'pembayaran_formatted' => 'Rp '.number_format($this->pembayaran, 0, ',', '.'),
            'sisa_hutang' => $this->sisa_hutang,
            'sisa_hutang_formatted' => 'Rp '.number_format($this->sisa_hutang, 0, ',', '.'),
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
