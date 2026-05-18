<?php

namespace Tests\Feature;

use App\Models\Distribusi;
use App\Models\Penjualan;
use Database\Seeders\BarangSeeder;
use Database\Seeders\DistribusiSeeder;
use Database\Seeders\PelangganSeeder;
use Database\Seeders\PenjualanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_and_distribution_seeders_import_new_salinan_data(): void
    {
        $this->seed([
            BarangSeeder::class,
            PelangganSeeder::class,
            PenjualanSeeder::class,
            DistribusiSeeder::class,
        ]);

        $this->assertSame(656, Penjualan::count());
        $this->assertSame(656, Distribusi::count());

        $this->assertDatabaseHas('penjualans', [
            'no_faktur' => 'INV-PJ-GTC-20260501-001',
            'tanggal' => '2026-05-01 00:00:00',
            'jumlah_kg' => 1000,
        ]);

        $this->assertDatabaseHas('distribusis', [
            'faktur_distribusi' => 'INV-KR-GTC-20260501-001',
            'tanggal' => '2026-05-01 00:00:00',
            'jumlah_kg' => 1000,
        ]);
    }
}
