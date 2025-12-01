<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Distribusi extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'faktur_distribusi',
        'pelanggan_id',
        'barang_id',
        'tanggal',
        'jarak_kirim_km',
        'jumlah_kg',
        'jenis_kendaraan',
        'biaya_bahan_bakar',
        'biaya_tenaga_kerja',
        'biaya_tambahan',
        'total_biaya_distribusi',
        'keterangan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jarak_kirim_km' => 'integer',
            'jumlah_kg' => 'decimal:2',
            'biaya_bahan_bakar' => 'decimal:2',
            'biaya_tenaga_kerja' => 'decimal:2',
            'biaya_tambahan' => 'decimal:2',
            'total_biaya_distribusi' => 'decimal:2',
        ];
    }

    /**
     * Get the pelanggan that owns this distribusi.
     */
    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class);
    }

    /**
     * Get the barang that owns this distribusi.
     */
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
