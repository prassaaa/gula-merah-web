<?php

namespace Database\Seeders;

use App\Models\Karyawan;
use Illuminate\Database\Seeder;

class KaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $karyawans = [
            [
                'nama_karyawan' => 'Ahmad Sopir',
                'jabatan' => 'sopir',
                'kontak' => '081234567890',
                'alamat' => 'Jl. Raya Kediri No. 1',
                'is_active' => true,
            ],
            [
                'nama_karyawan' => 'Budi Admin',
                'jabatan' => 'admin gudang',
                'kontak' => '081234567891',
                'alamat' => 'Jl. Raya Kediri No. 2',
                'is_active' => true,
            ],
            [
                'nama_karyawan' => 'Siti Kasir',
                'jabatan' => 'kasir',
                'kontak' => '081234567892',
                'alamat' => 'Jl. Raya Kediri No. 3',
                'is_active' => true,
            ],
        ];

        foreach ($karyawans as $karyawan) {
            Karyawan::firstOrCreate(
                ['nama_karyawan' => $karyawan['nama_karyawan']],
                $karyawan
            );
        }
    }
}
