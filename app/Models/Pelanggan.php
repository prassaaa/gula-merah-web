<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
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
     * Get the user account associated with this pelanggan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if pelanggan has a user account.
     */
    public function hasAccount(): bool
    {
        return $this->user_id !== null;
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

    /**
     * Get all hutang for this pelanggan through penjualan.
     */
    public function hutangs()
    {
        return $this->hasManyThrough(Hutang::class, Penjualan::class);
    }
}
