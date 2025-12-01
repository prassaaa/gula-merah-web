<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode_pelanggan',
        'nama',
        'lokasi',
        'alamat',
        'telepon',
        'email',
        'jarak_km',
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
            'jarak_km' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all penjualan records for this pelanggan.
     */
    public function penjualans(): HasMany
    {
        return $this->hasMany(Penjualan::class);
    }

    /**
     * Get all distribusi records for this pelanggan.
     */
    public function distribusis(): HasMany
    {
        return $this->hasMany(Distribusi::class);
    }
}
