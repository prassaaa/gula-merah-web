<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Penjualan extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'no_faktur',
        'pelanggan_id',
        'barang_id',
        'tanggal',
        'jumlah_kg',
        'harga_per_kg',
        'total_penjualan',
        'hutang',
        'pembayaran',
        'sisa_hutang',
        'status',
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
            'jumlah_kg' => 'decimal:2',
            'harga_per_kg' => 'decimal:2',
            'total_penjualan' => 'decimal:2',
            'hutang' => 'decimal:2',
            'pembayaran' => 'decimal:2',
            'sisa_hutang' => 'decimal:2',
        ];
    }

    /**
     * Get the pelanggan that owns this penjualan.
     */
    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class);
    }

    /**
     * Get the barang that owns this penjualan.
     */
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    /**
     * Get all hutang records for this penjualan.
     */
    public function hutangs(): HasMany
    {
        return $this->hasMany(Hutang::class);
    }
}
