<?php

namespace Database\Seeders;

use App\Models\Barang;
use Illuminate\Database\Seeder;

class BarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangs = [
            [
                'kode_barang' => 'GT',
                'nama_barang' => 'Gula Tebu',
                'deskripsi' => 'Gula merah dari tebu',
                'harga_per_kg' => 12000,
                'satuan' => 'kg',
                'is_active' => true,
            ],
            [
                'kode_barang' => 'GK',
                'nama_barang' => 'Gula Kelapa',
                'deskripsi' => 'Gula merah dari kelapa',
                'harga_per_kg' => 19000,
                'satuan' => 'kg',
                'is_active' => true,
            ],
            [
                'kode_barang' => 'GTC',
                'nama_barang' => 'Gula Tebu Ceplik',
                'deskripsi' => 'Gula merah tebu ceplik (ukuran kecil)',
                'harga_per_kg' => 14000,
                'satuan' => 'kg',
                'is_active' => true,
            ],
            [
                'kode_barang' => 'GTT',
                'nama_barang' => 'Gula Tebu Tanggung',
                'deskripsi' => 'Gula merah tebu ukuran tanggung',
                'harga_per_kg' => 13900,
                'satuan' => 'kg',
                'is_active' => true,
            ],
        ];

        foreach ($barangs as $barang) {
            Barang::firstOrCreate(
                ['kode_barang' => $barang['kode_barang']],
                $barang
            );
        }
    }
}
