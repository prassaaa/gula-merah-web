<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Stok;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StokSeeder extends Seeder
{
    /**
     * CSV columns mapping:
     * 0: tanggal_penjualan
     * 1-4: Gula Tebu (Stok Awal, Masuk, Keluar, Stok Akhir)
     * 5-8: Gula Kelapa (Stok Awal, Masuk, Keluar, Stok Akhir)
     * 9-12: Gula Tebu Ceplik (Stok Awal, Masuk, Keluar, Stok Akhir)
     * 13-16: Gula Tebu Tanggung (Stok Awal, Masuk, Keluar, Stok Akhir)
     */
    public function run(): void
    {
        $csvPath = database_path('data/stok.csv');

        if (! file_exists($csvPath)) {
            $this->command->warn("File {$csvPath} tidak ditemukan.");

            return;
        }

        $barangMapping = [
            'GT' => ['start' => 1],   // Gula Tebu: columns 1-4
            'GK' => ['start' => 5],   // Gula Kelapa: columns 5-8
            'GTC' => ['start' => 9],  // Gula Tebu Ceplik: columns 9-12
            'GTT' => ['start' => 13], // Gula Tebu Tanggung: columns 13-16
        ];

        $handle = fopen($csvPath, 'r');
        $rowNumber = 0;

        while (($data = fgetcsv($handle)) !== false) {
            $rowNumber++;

            // Skip header rows (first 2 rows)
            if ($rowNumber <= 2) {
                continue;
            }

            $tanggal = $this->parseDate($data[0]);
            if (! $tanggal) {
                continue;
            }

            foreach ($barangMapping as $kodeBarang => $config) {
                $barang = Barang::where('kode_barang', $kodeBarang)->first();
                if (! $barang) {
                    continue;
                }

                $startCol = $config['start'];
                $stokAwal = $this->parseNumber($data[$startCol] ?? '0');
                $masuk = $this->parseNumber($data[$startCol + 1] ?? '0');
                $keluar = $this->parseNumber($data[$startCol + 2] ?? '0');
                $stokAkhir = $this->parseNumber($data[$startCol + 3] ?? '0');

                Stok::updateOrCreate(
                    [
                        'barang_id' => $barang->id,
                        'tanggal' => $tanggal,
                    ],
                    [
                        'stok_awal' => $stokAwal,
                        'masuk' => $masuk,
                        'keluar' => $keluar,
                        'stok_akhir' => $stokAkhir,
                    ]
                );
            }
        }

        fclose($handle);
    }

    private function parseDate(string $dateStr): ?string
    {
        try {
            // Format: "14 Jul 2024"
            return Carbon::createFromFormat('d M Y', trim($dateStr))->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseNumber(string $value): float
    {
        // Remove dots (thousand separator) and replace comma with dot
        $cleaned = str_replace(['.', ','], ['', '.'], trim($value));

        return (float) $cleaned;
    }
}
