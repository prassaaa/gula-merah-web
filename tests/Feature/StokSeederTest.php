<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Stok;
use Database\Seeders\BarangSeeder;
use Database\Seeders\StokSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StokSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_revisi_csv_is_imported_for_all_products_until_latest_date(): void
    {
        $this->seed(BarangSeeder::class);
        $this->seed(StokSeeder::class);

        $this->assertSame(2624, Stok::count());

        $gulaTebu = Barang::where('kode_barang', 'GT')->firstOrFail();
        $latestStok = Stok::where('barang_id', $gulaTebu->id)
            ->whereDate('tanggal', '2026-05-09')
            ->firstOrFail();

        $this->assertSame(6080.0, (float) $latestStok->stok_akhir);
    }
}
