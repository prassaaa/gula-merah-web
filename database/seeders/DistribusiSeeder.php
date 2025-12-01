<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Distribusi;
use App\Models\Pelanggan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DistribusiSeeder extends Seeder
{
    /**
     * CSV columns:
     * 0: faktur_distribusi, 1: id_pelanggan, 2: tanggal, 3: nama_pelanggan,
     * 4: lokasi_pelanggan, 5: jenis_gula, 6: jarak_kirim_km, 7: jumlah_kg,
     * 8: jenis_kendaraan, 9: biaya_bahan_bakar, 10: biaya_tenaga_kerja,
     * 11: biaya_tambahan, 12: total_biaya_distribusi
     */
    public function run(): void
    {
        $csvPath = database_path('data/distribusi.csv');

        if (! file_exists($csvPath)) {
            $this->command->warn("File {$csvPath} tidak ditemukan.");

            return;
        }

        $handle = fopen($csvPath, 'r');
        $isHeader = true;

        while (($data = fgetcsv($handle)) !== false) {
            if ($isHeader) {
                $isHeader = false;

                continue;
            }

            $tanggal = $this->parseDate($data[2]);
            if (! $tanggal) {
                continue;
            }

            $pelanggan = Pelanggan::where('kode_pelanggan', strtoupper($data[3]))->first();
            $barang = Barang::where('kode_barang', $this->mapJenisGula($data[5]))->first();

            if (! $pelanggan || ! $barang) {
                continue;
            }

            Distribusi::updateOrCreate(
                ['faktur_distribusi' => $data[0]],
                [
                    'pelanggan_id' => $pelanggan->id,
                    'barang_id' => $barang->id,
                    'tanggal' => $tanggal,
                    'jarak_kirim_km' => (int) $data[6],
                    'jumlah_kg' => $this->parseNumber($data[7]),
                    'jenis_kendaraan' => $this->mapJenisKendaraan($data[8]),
                    'biaya_bahan_bakar' => $this->parseRupiah($data[9]),
                    'biaya_tenaga_kerja' => $this->parseRupiah($data[10]),
                    'biaya_tambahan' => $this->parseRupiah($data[11]),
                    'total_biaya_distribusi' => $this->parseRupiah($data[12]),
                ]
            );
        }

        fclose($handle);
    }

    private function parseDate(string $dateStr): ?string
    {
        try {
            // Format: "14 Juli 2024"
            $months = [
                'Januari' => 'January', 'Februari' => 'February', 'Maret' => 'March',
                'April' => 'April', 'Mei' => 'May', 'Juni' => 'June',
                'Juli' => 'July', 'Agustus' => 'August', 'September' => 'September',
                'Oktober' => 'October', 'November' => 'November', 'Desember' => 'December',
            ];
            $dateStr = str_replace(array_keys($months), array_values($months), trim($dateStr));

            return Carbon::createFromFormat('d F Y', $dateStr)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseNumber(string $value): float
    {
        $cleaned = str_replace(['.', ','], ['', '.'], trim($value));

        return (float) $cleaned;
    }

    private function parseRupiah(string $value): float
    {
        $cleaned = str_replace(['Rp', '.', ','], ['', '', '.'], trim($value));

        return (float) $cleaned;
    }

    private function mapJenisGula(string $jenis): string
    {
        return match (strtolower(trim($jenis))) {
            'gula tebu' => 'GT',
            'gula kelapa' => 'GK',
            'gula tebu ceplik' => 'GTC',
            'gula tebu tanggung' => 'GTT',
            default => 'GT',
        };
    }

    private function mapJenisKendaraan(string $jenis): string
    {
        return match (strtolower(trim($jenis))) {
            'pick up', 'pickup' => 'pick_up',
            'truk sedang' => 'truk_sedang',
            'truk besar' => 'truk_besar',
            default => 'pick_up',
        };
    }
}
