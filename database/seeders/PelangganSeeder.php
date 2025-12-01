<?php

namespace Database\Seeders;

use App\Models\Pelanggan;
use Illuminate\Database\Seeder;

class PelangganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('data/alamat.csv');

        if (! file_exists($csvPath)) {
            $this->command->warn("File {$csvPath} tidak ditemukan. Menggunakan data default.");
            $this->seedDefault();

            return;
        }

        $handle = fopen($csvPath, 'r');
        while (($data = fgetcsv($handle)) !== false) {
            Pelanggan::firstOrCreate(
                ['kode_pelanggan' => strtoupper($data[0])],
                [
                    'nama' => ucfirst($data[0]),
                    'lokasi' => $data[1],
                    'alamat' => $data[2],
                    'jarak_km' => $this->getJarakByLokasi($data[1]),
                    'is_active' => true,
                ]
            );
        }
        fclose($handle);
    }

    private function seedDefault(): void
    {
        $pelanggans = [
            ['kode_pelanggan' => 'SUN', 'nama' => 'Sun', 'lokasi' => 'lumajang', 'jarak_km' => 45],
            ['kode_pelanggan' => 'DANNY', 'nama' => 'Danny', 'lokasi' => 'jombang', 'jarak_km' => 110],
            ['kode_pelanggan' => 'MULIK', 'nama' => 'Mulik', 'lokasi' => 'lumajang', 'jarak_km' => 45],
            ['kode_pelanggan' => 'MAHFUD', 'nama' => 'Mahfud', 'lokasi' => 'malang', 'jarak_km' => 30],
            ['kode_pelanggan' => 'JUMROTIN', 'nama' => 'Jumrotin', 'lokasi' => 'jombang', 'jarak_km' => 110],
            ['kode_pelanggan' => 'RIYANTO', 'nama' => 'Riyanto', 'lokasi' => 'jombang', 'jarak_km' => 110],
            ['kode_pelanggan' => 'AGUS', 'nama' => 'Agus', 'lokasi' => 'pare', 'jarak_km' => 90],
            ['kode_pelanggan' => 'SITI', 'nama' => 'Siti', 'lokasi' => 'surabaya', 'jarak_km' => 180],
            ['kode_pelanggan' => 'YAYANG', 'nama' => 'Yayang', 'lokasi' => 'pare', 'jarak_km' => 90],
            ['kode_pelanggan' => 'SLAMET', 'nama' => 'Slamet', 'lokasi' => 'lumajang', 'jarak_km' => 45],
            ['kode_pelanggan' => 'BINASIKIN', 'nama' => 'Binasikin', 'lokasi' => 'surabaya', 'jarak_km' => 180],
        ];

        foreach ($pelanggans as $pelanggan) {
            Pelanggan::firstOrCreate(
                ['kode_pelanggan' => $pelanggan['kode_pelanggan']],
                array_merge($pelanggan, ['is_active' => true])
            );
        }
    }

    private function getJarakByLokasi(string $lokasi): int
    {
        return match (strtolower($lokasi)) {
            'lumajang' => 45,
            'jombang' => 110,
            'malang' => 30,
            'pare' => 90,
            'surabaya' => 180,
            default => 50,
        };
    }
}
