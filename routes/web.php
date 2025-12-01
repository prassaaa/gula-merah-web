<?php

use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DistribusiController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PenjualanController;
use App\Http\Controllers\StokController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Master Data
    Route::resource('barang', BarangController::class);
    Route::resource('pelanggan', PelangganController::class);

    // Transaksi
    Route::resource('stok', StokController::class);
    Route::resource('penjualan', PenjualanController::class);
    Route::resource('distribusi', DistribusiController::class);

    // Forecasting
    Route::prefix('forecast')->name('forecast.')->group(function () {
        Route::get('stok', [ForecastController::class, 'stokIndex'])->name('stok');
        Route::post('stok/predict', [ForecastController::class, 'stokPredict'])->name('stok.predict');
        Route::get('distribusi', [ForecastController::class, 'distribusiIndex'])->name('distribusi');
        Route::post('distribusi/predict', [ForecastController::class, 'distribusiPredict'])->name('distribusi.predict');
        Route::post('distribusi/train', [ForecastController::class, 'distribusiTrain'])->name('distribusi.train');
    });
});

require __DIR__.'/settings.php';
