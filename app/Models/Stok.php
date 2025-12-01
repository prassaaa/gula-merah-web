<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stok extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'barang_id',
        'tanggal',
        'stok_awal',
        'masuk',
        'keluar',
        'stok_akhir',
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
            'stok_awal' => 'decimal:2',
            'masuk' => 'decimal:2',
            'keluar' => 'decimal:2',
            'stok_akhir' => 'decimal:2',
        ];
    }

    /**
     * Get the barang that owns this stok.
     */
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
