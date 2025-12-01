<?php

namespace Database\Seeders;

use App\Models\Hutang;
use App\Models\Penjualan;
use Illuminate\Database\Seeder;

class HutangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Hutang di-generate dari data penjualan yang memiliki sisa_hutang > 0
     */
    public function run(): void
    {
        // Ambil semua penjualan yang memiliki sisa hutang
        $penjualans = Penjualan::where('sisa_hutang', '>', 0)->get();

        foreach ($penjualans as $penjualan) {
            Hutang::firstOrCreate(
                ['penjualan_id' => $penjualan->id],
                [
                    'faktur_penjualan' => $penjualan->no_faktur,
                    'tanggal' => $penjualan->tanggal,
                    'nilai_faktur' => $penjualan->total_penjualan,
                    'dp_bayar' => $penjualan->pembayaran,
                    'sisa_hutang' => $penjualan->sisa_hutang,
                    'status' => $penjualan->sisa_hutang > 0 ? 'belum_lunas' : 'lunas',
                ]
            );
        }
    }
}
