<?php

namespace Tests\Feature;

use App\Models\Barang;
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

    public function test_stock_forecast_uses_weekly_payload_and_returns_restock_summary(): void
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

        $startDate = Carbon::parse('2026-01-05');
        for ($week = 0; $week < 10; $week++) {
            Stok::create([
                'barang_id' => $barang->id,
                'tanggal' => $startDate->copy()->addWeeks($week)->format('Y-m-d'),
                'stok_awal' => 100 + $week,
                'masuk' => 0,
                'keluar' => 0,
                'stok_akhir' => 100 + $week,
            ]);
        }

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
                ->where('forecast.historical.9.stok_akhir', 109)
                ->where('forecast.weekly_summary.0.actual', 109)
                ->where('forecast.weekly_summary.0.predicted', 120)
                ->where('forecast.weekly_summary.0.difference', 11)
                ->where('forecast.weekly_summary.0.status', 'perlu_restock')
                ->where('forecast.weekly_summary.0.status_label', 'Kurang 11 kg')
                ->where('forecast.weekly_summary.1.status', 'aman')
                ->where('filters.weeks', 2)
            );

        Http::assertSent(fn ($request) => $request->url() === 'http://localhost:8000/api/forecast/predict'
            && $request['weeks'] === 2
            && count($request['data']) === 10
            && $request['data'][0]['tanggal'] === '2026-01-11'
            && $request['data'][9]['stok_akhir'] === 109.0);
    }
}
