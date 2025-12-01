<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistribusiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'faktur_distribusi' => $this->faktur_distribusi,
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
            'jarak_kirim_km' => $this->jarak_kirim_km,
            'jumlah_kg' => $this->jumlah_kg,
            'jenis_kendaraan' => $this->jenis_kendaraan,
            'jenis_kendaraan_label' => $this->getJenisKendaraanLabel(),
            'biaya_bahan_bakar' => $this->biaya_bahan_bakar,
            'biaya_bahan_bakar_formatted' => 'Rp ' . number_format($this->biaya_bahan_bakar, 0, ',', '.'),
            'biaya_tenaga_kerja' => $this->biaya_tenaga_kerja,
            'biaya_tenaga_kerja_formatted' => 'Rp ' . number_format($this->biaya_tenaga_kerja, 0, ',', '.'),
            'biaya_tambahan' => $this->biaya_tambahan,
            'biaya_tambahan_formatted' => 'Rp ' . number_format($this->biaya_tambahan, 0, ',', '.'),
            'total_biaya_distribusi' => $this->total_biaya_distribusi,
            'total_biaya_formatted' => 'Rp ' . number_format($this->total_biaya_distribusi, 0, ',', '.'),
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function getJenisKendaraanLabel(): string
    {
        return match ($this->jenis_kendaraan) {
            'pick_up' => 'Pick Up',
            'truk_sedang' => 'Truk Sedang',
            'truk_besar' => 'Truk Besar',
            default => $this->jenis_kendaraan,
        };
    }
}
