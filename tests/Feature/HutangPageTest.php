<?php

namespace Tests\Feature;

use App\Models\Hutang;
use App\Models\Pelanggan;
use App\Models\User;
use Database\Seeders\BarangSeeder;
use Database\Seeders\HutangSeeder;
use Database\Seeders\PelangganSeeder;
use Database\Seeders\PenjualanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HutangPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_hutang_page_preserves_latest_sun_balance_from_imported_dataset(): void
    {
        $this->seed([
            RolePermissionSeeder::class,
            BarangSeeder::class,
            PelangganSeeder::class,
            PenjualanSeeder::class,
            HutangSeeder::class,
        ]);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $sun = Pelanggan::where('nama', 'Sun')->firstOrFail();
        $this->assertSame(44775000.0, $this->latestHutangBalance($sun));

        $this->actingAs($admin)
            ->get(route('hutang.index', ['search' => 'sun']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transaksi/hutang/index')
                ->where('hutangs.data.0.faktur_penjualan', 'INV-PJ-GT-20260430-001')
                ->where('hutangs.data.0.nilai_faktur', '44000000.00')
                ->where('hutangs.data.0.dp_bayar', '60000000.00')
                ->where('hutangs.data.0.sisa_hutang', '44775000.00')
                ->where('summary.total_hutang', 44775000)
            );

        $this->assertSame(44775000.0, $this->latestHutangBalance($sun->refresh()));
        $this->assertDatabaseHas('penjualans', [
            'no_faktur' => 'INV-PJ-GT-20240718-001',
            'hutang' => 30000000,
            'sisa_hutang' => 86472500,
        ]);
    }

    private function latestHutangBalance(Pelanggan $pelanggan): float
    {
        $latest = Hutang::whereHas('penjualan', fn ($query) => $query->where('pelanggan_id', $pelanggan->id))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->first();

        return (float) ($latest?->sisa_hutang ?? 0);
    }
}
