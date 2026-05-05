<?php

namespace App\Services;

use App\Models\Hutang;
use App\Models\Penjualan;

class HutangLedgerService
{
    public function syncFromPenjualan(Penjualan $penjualan): void
    {
        if ($penjualan->metode_pembayaran === 'cash') {
            $penjualan->hutangs()->delete();
            $this->recalculateForPelanggan((int) $penjualan->pelanggan_id);

            return;
        }

        Hutang::updateOrCreate(
            ['penjualan_id' => $penjualan->id],
            [
                'faktur_penjualan' => $penjualan->no_faktur,
                'tanggal' => $penjualan->tanggal,
                'nilai_faktur' => $penjualan->total_penjualan,
                'dp_bayar' => $penjualan->pembayaran,
                'sisa_hutang' => 0,
                'status' => 'belum_lunas',
            ]
        );

        $this->recalculateForPelanggan((int) $penjualan->pelanggan_id);
    }

    public function recalculateForPelanggan(int $pelangganId): void
    {
        $balance = 0.0;

        Hutang::with('penjualan')
            ->whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $pelangganId))
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get()
            ->each(function (Hutang $hutang) use (&$balance) {
                $balance += (float) $hutang->nilai_faktur - (float) $hutang->dp_bayar;
                $balance = max(0, $balance);
                $status = $balance <= 0 ? 'lunas' : 'belum_lunas';

                $hutang->forceFill([
                    'sisa_hutang' => $balance,
                    'status' => $status,
                ])->save();

                if ($hutang->penjualan) {
                    $hutang->penjualan->forceFill([
                        'hutang' => $hutang->nilai_faktur,
                        'pembayaran' => $hutang->dp_bayar,
                        'sisa_hutang' => $balance,
                        'status' => $status,
                        'metode_pembayaran' => 'hutang',
                    ])->save();
                }
            });
    }

    public function currentBalanceForPelanggan(int $pelangganId): float
    {
        $latest = Hutang::whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $pelangganId))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->first();

        return (float) ($latest?->sisa_hutang ?? 0);
    }
}
