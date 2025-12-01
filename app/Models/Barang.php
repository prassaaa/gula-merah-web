<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'deskripsi',
        'harga_per_kg',
        'satuan',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'harga_per_kg' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all stok records for this barang.
     */
    public function stoks(): HasMany
    {
        return $this->hasMany(Stok::class);
    }

    /**
     * Get all penjualan records for this barang.
     */
    public function penjualans(): HasMany
    {
        return $this->hasMany(Penjualan::class);
    }

    /**
     * Get all distribusi records for this barang.
     */
    public function distribusis(): HasMany
    {
        return $this->hasMany(Distribusi::class);
    }
}
