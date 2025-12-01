<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hutang extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'faktur_penjualan',
        'penjualan_id',
        'tanggal',
        'nilai_faktur',
        'dp_bayar',
        'sisa_hutang',
        'status',
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
            'nilai_faktur' => 'decimal:2',
            'dp_bayar' => 'decimal:2',
            'sisa_hutang' => 'decimal:2',
        ];
    }

    /**
     * Get the penjualan that owns this hutang.
     */
    public function penjualan(): BelongsTo
    {
        return $this->belongsTo(Penjualan::class);
    }
}
