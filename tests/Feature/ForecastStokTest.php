<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Pelanggan;
use App\Models\Penjualan;
use App\Models\Stok;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ForecastStokTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_forecast_uses_weekly_sales_payload_and_returns_restock_summary(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('admin');

        $barang = Barang::create([
            'kode_barang' => 'GTC',
            'nama_barang' => 'Gula Tebu Ceplik',
            'harga_per_kg' => 14000,
            'satuan' => 'kg',
            'is_active' => true,
        ]);

        $pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'CUS-TEST-001',
            'nama' => 'Pelanggan Test',
            'lokasi' => 'Jombang',
            'jarak_km' => 20,
            'is_active' => true,
        ]);

        $startDate = Carbon::parse('2026-01-05');
        for ($week = 0; $week < 10; $week++) {
            Penjualan::create([
                'no_faktur' => 'INV-PJ-GTC-202601'.str_pad((string) ($week + 1), 2, '0', STR_PAD_LEFT),
                'pelanggan_id' => $pelanggan->id,
                'barang_id' => $barang->id,
                'tanggal' => $startDate->copy()->addWeeks($week)->format('Y-m-d'),
                'jumlah_kg' => 50 + $week,
                'harga_per_kg' => 14000,
                'total_penjualan' => (50 + $week) * 14000,
                'metode_pembayaran' => 'cash',
                'hutang' => 0,
                'pembayaran' => (50 + $week) * 14000,
                'sisa_hutang' => 0,
                'status' => 'lunas',
            ]);
        }

        Penjualan::create([
            'no_faktur' => 'INV-PJ-GTC-20260101-B',
            'pelanggan_id' => $pelanggan->id,
            'barang_id' => $barang->id,
            'tanggal' => $startDate->copy()->addDays(2)->format('Y-m-d'),
            'jumlah_kg' => 25,
            'harga_per_kg' => 14000,
            'total_penjualan' => 25 * 14000,
            'metode_pembayaran' => 'cash',
            'hutang' => 0,
            'pembayaran' => 25 * 14000,
            'sisa_hutang' => 0,
            'status' => 'lunas',
        ]);

        Stok::create([
            'barang_id' => $barang->id,
            'tanggal' => '2026-03-20',
            'stok_awal' => 200,
            'masuk' => 0,
            'keluar' => 0,
            'stok_akhir' => 200,
        ]);

        Http::fake([
            'http://localhost:8000/api/forecast/predict' => Http::response([
                'model_used' => 'ARIMA(1,1,1)',
                'weeks' => 2,
                'predictions' => [
                    [
                        'week' => 'Minggu 1',
                        'week_start' => '2026-03-16',
                        'week_end' => '2026-03-22',
                        'value' => 120,
                        'lower_bound' => 100,
                        'upper_bound' => 130,
                    ],
                    [
                        'week' => 'Minggu 2',
                        'week_start' => '2026-03-23',
                        'week_end' => '2026-03-29',
                        'value' => 108,
                        'lower_bound' => 95,
                        'upper_bound' => 125,
                    ],
                ],
                'metrics' => [
                    'mae' => 1.2,
                    'rmse' => 1.5,
                    'mape' => 2.1,
                    'evaluation_method' => 'chronological_train_test_split_80_20',
                    'train_size' => 8,
                    'test_size' => 2,
                ],
            ]),
        ]);

        $this->actingAs($user)
            ->post(route('forecast.stok.predict'), [
                'barang_id' => $barang->id,
                'weeks' => 2,
            ])
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('forecast/stok')
                ->where('forecast.weeks', 2)
                ->where('forecast.historical.0.jumlah_terjual', 75)
                ->where('forecast.historical.9.jumlah_terjual', 59)
                ->where('forecast.stok_aktual_terakhir', 200)
                ->where('forecast.total_kebutuhan_prediksi', 228)
                ->where('forecast.estimasi_sisa_stok', -28)
                ->where('forecast.weekly_summary.0.actual', null)
                ->where('forecast.weekly_summary.0.predicted', 120)
                ->where('forecast.weekly_summary.0.estimated_remaining_stock', 80)
                ->where('forecast.weekly_summary.0.status', 'aman')
                ->where('forecast.weekly_summary.1.estimated_remaining_stock', -28)
                ->where('forecast.weekly_summary.1.shortage', 28)
                ->where('forecast.weekly_summary.1.status', 'perlu_restock')
                ->where('forecast.weekly_summary.1.status_label', 'Kurang 28 kg')
                ->where('filters.weeks', 2)
            );

        Http::assertSent(fn ($request) => $request->url() === 'http://localhost:8000/api/forecast/predict'
            && $request['weeks'] === 2
            && count($request['data']) === 10
            && $request['data'][0]['tanggal'] === '2026-01-11'
            && $request['data'][0]['jumlah_terjual'] === 75.0
            && $request['data'][9]['jumlah_terjual'] === 59.0
            && ! array_key_exists('stok_akhir', $request['data'][0]));
    }
}
