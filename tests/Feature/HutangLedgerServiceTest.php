<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Hutang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use App\Services\HutangLedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HutangLedgerServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dp_more_than_new_invoice_reduces_previous_running_balance(): void
    {
        [$pelanggan, $barang] = $this->makeMasterData();

        $oldPenjualan = Penjualan::create([
            'no_faktur' => 'INV-PJ-GT-20250331-001',
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => '2025-03-31',
            'jumlah_kg' => 4000,
            'harga_per_kg' => 11800,
            'total_penjualan' => 47200000,
            'metode_pembayaran' => 'hutang',
            'hutang' => 47200000,
            'pembayaran' => 47200000,
            'sisa_hutang' => 7214000,
            'status' => 'belum_lunas',
        ]);

        Hutang::create([
            'faktur_penjualan' => $oldPenjualan->no_faktur,
            'penjualan_id' => $oldPenjualan->id,
            'tanggal' => $oldPenjualan->tanggal,
            'nilai_faktur' => 47200000,
            'dp_bayar' => 47200000,
            'sisa_hutang' => 7214000,
            'status' => 'belum_lunas',
        ]);

        $newPenjualan = Penjualan::create([
            'no_faktur' => 'INV-PJ-GT-20260505-001',
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => '2026-05-05',
            'jumlah_kg' => 1000,
            'harga_per_kg' => 12000,
            'total_penjualan' => 12000000,
            'metode_pembayaran' => 'hutang',
            'hutang' => 12000000,
            'pembayaran' => 13000000,
            'sisa_hutang' => 0,
            'status' => 'lunas',
        ]);

        $service = app(HutangLedgerService::class);
        $service->syncFromPenjualan($newPenjualan);

        $this->assertSame(6214000.0, $service->currentBalanceForPelanggan($pelanggan->id));
        $this->assertDatabaseHas('hutangs', [
            'penjualan_id' => $newPenjualan->id,
            'nilai_faktur' => 12000000,
            'dp_bayar' => 13000000,
            'sisa_hutang' => 6214000,
            'status' => 'belum_lunas',
        ]);
    }

    public function test_deleting_new_sale_returns_balance_to_previous_running_balance(): void
    {
        [$pelanggan, $barang] = $this->makeMasterData();

        $oldPenjualan = Penjualan::create([
            'no_faktur' => 'INV-PJ-GT-20250331-001',
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => '2025-03-31',
            'jumlah_kg' => 4000,
            'harga_per_kg' => 11800,
            'total_penjualan' => 47200000,
            'metode_pembayaran' => 'hutang',
            'hutang' => 47200000,
            'pembayaran' => 47200000,
            'sisa_hutang' => 7214000,
            'status' => 'belum_lunas',
        ]);

        Hutang::create([
            'faktur_penjualan' => $oldPenjualan->no_faktur,
            'penjualan_id' => $oldPenjualan->id,
            'tanggal' => $oldPenjualan->tanggal,
            'nilai_faktur' => 47200000,
            'dp_bayar' => 47200000,
            'sisa_hutang' => 7214000,
            'status' => 'belum_lunas',
        ]);

        $newPenjualan = Penjualan::create([
            'no_faktur' => 'INV-PJ-GT-20260505-001',
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => '2026-05-05',
            'jumlah_kg' => 1000,
            'harga_per_kg' => 12000,
            'total_penjualan' => 12000000,
            'metode_pembayaran' => 'hutang',
            'hutang' => 12000000,
            'pembayaran' => 13000000,
            'sisa_hutang' => 0,
            'status' => 'lunas',
        ]);

        $service = app(HutangLedgerService::class);
        $service->syncFromPenjualan($newPenjualan);

        $newPenjualan->delete();
        $service->recalculateForPelanggan($pelanggan->id);

        $this->assertSame(7214000.0, $service->currentBalanceForPelanggan($pelanggan->id));
    }

    private function makeMasterData(): array
    {
        $pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'CUS-DANNY-002',
            'nama' => 'Danny',
            'lokasi' => 'Jombang',
            'jarak_km' => 20,
            'is_active' => true,
        ]);

        $barang = Barang::create([
            'kode_barang' => 'GT',
            'nama_barang' => 'Gula Tebu',
            'harga_per_kg' => 12000,
            'satuan' => 'kg',
            'is_active' => true,
        ]);

        return [$pelanggan, $barang];
    }
}
