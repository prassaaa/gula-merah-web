<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Hutang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dashboard'))->assertOk();
    }

    public function test_admin_dashboard_uses_latest_hutang_balance_per_pelanggan(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $barang = $this->createBarang();
        $sun = $this->createPelanggan('PEL-SUN', 'Sun');
        $slamet = $this->createPelanggan('PEL-SLAMET', 'Slamet');

        $this->createPenjualanWithHutang($sun, $barang, 'INV-SUN-OLD', '2026-04-20', 62_775_000);
        $this->createPenjualanWithHutang($sun, $barang, 'INV-SUN-LATEST', '2026-04-30', 44_775_000);
        $this->createPenjualanWithHutang($slamet, $barang, 'INV-SLAMET-LATEST', '2026-04-30', 78_140_000);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/admin')
                ->where('stats.totalHutangBelumLunas', 122_915_000)
                ->where('stats.jumlahHutangBelumLunas', 2)
                ->where('topDebtors.0.pelanggan', 'Slamet')
                ->where('topDebtors.0.sisa_hutang', 78_140_000)
                ->where('topDebtors.1.pelanggan', 'Sun')
                ->where('topDebtors.1.sisa_hutang', 44_775_000)
            );
    }

    public function test_pelanggan_dashboard_uses_latest_hutang_balance(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('pelanggan');

        $barang = $this->createBarang();
        $sun = $this->createPelanggan('PEL-SUN', 'Sun', $user->id);

        $this->createPenjualanWithHutang($sun, $barang, 'INV-SUN-OLD', '2026-04-20', 62_775_000);
        $this->createPenjualanWithHutang($sun, $barang, 'INV-SUN-LATEST', '2026-04-30', 44_775_000);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/pelanggan')
                ->where('hutangSummary.totalHutang', 44_775_000)
                ->where('hutangSummary.jumlahHutang', 1)
            );
    }

    private function createBarang(): Barang
    {
        return Barang::create([
            'kode_barang' => 'GTC',
            'nama_barang' => 'Gula Tebu Ceplik',
            'harga_per_kg' => 14_000,
            'satuan' => 'kg',
            'is_active' => true,
        ]);
    }

    private function createPelanggan(string $kode, string $nama, ?int $userId = null): Pelanggan
    {
        return Pelanggan::create([
            'user_id' => $userId,
            'kode_pelanggan' => $kode,
            'nama' => $nama,
            'lokasi' => 'Lumajang',
            'alamat' => 'Lumajang',
            'jarak_km' => 10,
            'is_active' => true,
        ]);
    }

    private function createPenjualanWithHutang(
        Pelanggan $pelanggan,
        Barang $barang,
        string $faktur,
        string $tanggal,
        int $sisaHutang
    ): void {
        $penjualan = Penjualan::create([
            'no_faktur' => $faktur,
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => $tanggal,
            'jumlah_kg' => 100,
            'harga_per_kg' => 14_000,
            'total_penjualan' => $sisaHutang,
            'metode_pembayaran' => 'hutang',
            'hutang' => $sisaHutang,
            'pembayaran' => 0,
            'sisa_hutang' => $sisaHutang,
            'status' => 'belum_lunas',
        ]);

        Hutang::create([
            'faktur_penjualan' => $faktur,
            'penjualan_id' => $penjualan->id,
            'tanggal' => $tanggal,
            'nilai_faktur' => $sisaHutang,
            'dp_bayar' => 0,
            'sisa_hutang' => $sisaHutang,
            'status' => 'belum_lunas',
        ]);
    }
}
