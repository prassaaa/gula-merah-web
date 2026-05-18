<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PenjualanSeeder extends Seeder
{
    /**
     * CSV columns:
     * 0: id_pelanggan, 1: tanggal_penjualan, 2: no_faktur, 3: nama_pelanggan,
     * 4: lokasi_pelanggan, 5: jenis_gula, 6: jumlah_kg, 7: harga_per_kg,
     * 8: hutang, 9: pembayaran, 10: sisa_hutang, 11: total_penjualan
     */
    public function run(): void
    {
        $csvPath = database_path('data/Salinan Salinan datagula2 - indukpenjualan.csv');

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

            $tanggal = $this->parseDate($data[1]);
            if (! $tanggal) {
                continue;
            }

            $pelanggan = Pelanggan::where('kode_pelanggan', strtoupper($data[3]))->first();
            $barang = Barang::where('kode_barang', $this->mapJenisGula($data[5]))->first();

            if (! $pelanggan || ! $barang) {
                continue;
            }

            Penjualan::updateOrCreate(
                ['no_faktur' => $data[2]],
                [
                    'pelanggan_id' => $pelanggan->id,
                    'barang_id' => $barang->id,
                    'tanggal' => $tanggal,
                    'jumlah_kg' => $this->parseNumber($data[6]),
                    'harga_per_kg' => $this->parseRupiah($data[7]),
                    'total_penjualan' => $this->parseRupiah($data[11]),
                    'metode_pembayaran' => $this->parseRupiah($data[10]) > 0 ? 'hutang' : 'cash',
                    'hutang' => $this->parseRupiah($data[8]),
                    'pembayaran' => $this->parseRupiah($data[9]),
                    'sisa_hutang' => $this->parseRupiah($data[10]),
                ]
            );
        }

        fclose($handle);
    }

    private function parseDate(string $dateStr): ?string
    {
        try {
            $normalized = $this->normalizeMonth(trim($dateStr));

            return Carbon::createFromFormat('d M Y', $normalized)->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }

    private function normalizeMonth(string $dateStr): string
    {
        $months = [
            'Januari' => 'Jan', 'January' => 'Jan', 'Jan' => 'Jan',
            'Februari' => 'Feb', 'February' => 'Feb', 'Feb' => 'Feb',
            'Maret' => 'Mar', 'March' => 'Mar', 'Mar' => 'Mar',
            'April' => 'Apr', 'Apr' => 'Apr',
            'Mei' => 'May', 'May' => 'May',
            'Juni' => 'Jun', 'June' => 'Jun', 'Jun' => 'Jun',
            'Juli' => 'Jul', 'July' => 'Jul', 'Jul' => 'Jul',
            'Agustus' => 'Aug', 'August' => 'Aug', 'Agu' => 'Aug', 'Aug' => 'Aug',
            'September' => 'Sep', 'Sept' => 'Sep', 'Sep' => 'Sep',
            'Oktober' => 'Oct', 'October' => 'Oct', 'Okt' => 'Oct', 'Oct' => 'Oct',
            'November' => 'Nov', 'Nov' => 'Nov',
            'Desember' => 'Dec', 'December' => 'Dec', 'Des' => 'Dec', 'Dec' => 'Dec',
        ];

        return str_ireplace(array_keys($months), array_values($months), $dateStr);
    }

    private function parseNumber(string $value): float
    {
        $cleaned = str_replace(['.', ','], ['', '.'], trim($value));

        return (float) $cleaned;
    }

    private function parseRupiah(string $value): float
    {
        // Remove "Rp", dots, and clean the value
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
}
