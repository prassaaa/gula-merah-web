<?php

namespace App\Services;

use App\Models\Hutang;
use App\Models\Penjualan;
use Illuminate\Support\Collection;

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
                'nilai_faktur' => $this->invoiceAmount($penjualan),
                'dp_bayar' => $penjualan->pembayaran,
                'sisa_hutang' => 0,
                'status' => 'belum_lunas',
            ]
        );

        $this->recalculateForPelanggan((int) $penjualan->pelanggan_id);
    }

    public function recalculateForPelanggan(int $pelangganId): void
    {
        $hutangs = Hutang::with('penjualan')
            ->whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $pelangganId))
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get();

        $balance = $this->openingBalance($hutangs);

        $hutangs->each(function (Hutang $hutang) use (&$balance) {
            $nilaiFaktur = $this->effectiveNilaiFaktur($hutang);
            $balance += $nilaiFaktur - (float) $hutang->dp_bayar;
            $balance = max(0, $balance);
            $status = $balance <= 0 ? 'lunas' : 'belum_lunas';

            $hutang->forceFill([
                'nilai_faktur' => $nilaiFaktur,
                'sisa_hutang' => $balance,
                'status' => $status,
            ])->save();

            if ($hutang->penjualan) {
                $hutang->penjualan->forceFill([
                    'hutang' => $nilaiFaktur,
                    'pembayaran' => $hutang->dp_bayar,
                    'sisa_hutang' => $balance,
                    'status' => $status,
                    'metode_pembayaran' => 'hutang',
                ])->save();
            }
        });
    }

    public function recalculateAll(): void
    {
        Hutang::with('penjualan')
            ->get()
            ->pluck('penjualan.pelanggan_id')
            ->filter()
            ->unique()
            ->each(fn ($pelangganId) => $this->recalculateForPelanggan((int) $pelangganId));
    }

    public function currentBalanceForPelanggan(int $pelangganId): float
    {
        $latest = Hutang::whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $pelangganId))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->first();

        return (float) ($latest?->sisa_hutang ?? 0);
    }

    private function effectiveNilaiFaktur(Hutang $hutang): float
    {
        if ($hutang->penjualan) {
            return $this->invoiceAmount($hutang->penjualan);
        }

        $nilaiFaktur = (float) $hutang->nilai_faktur;

        if ($nilaiFaktur > 0) {
            return $nilaiFaktur;
        }

        return (float) ($hutang->penjualan?->total_penjualan ?? 0);
    }

    private function openingBalance(Collection $hutangs): float
    {
        $firstHutang = $hutangs->first();

        if (! $firstHutang) {
            return 0.0;
        }

        $firstDelta = $this->effectiveNilaiFaktur($firstHutang) - (float) $firstHutang->dp_bayar;

        return max(0, (float) $firstHutang->sisa_hutang - $firstDelta);
    }

    private function invoiceAmount(Penjualan $penjualan): float
    {
        $calculated = (float) $penjualan->jumlah_kg * (float) $penjualan->harga_per_kg;

        if ($calculated > 0) {
            return $calculated;
        }

        $hutang = (float) $penjualan->hutang;

        if ($hutang > 0) {
            return $hutang;
        }

        return (float) $penjualan->total_penjualan;
    }
}
