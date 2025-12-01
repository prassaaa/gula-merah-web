<?php

use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DistribusiController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\HutangController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PelangganHutangController;
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
    // Dashboard - All authenticated users
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ==========================================
    // ADMIN & KARYAWAN ROUTES
    // ==========================================
    Route::middleware(['role:admin,karyawan'])->group(function () {
        // Master Data - View only for karyawan
        Route::get('barang', [BarangController::class, 'index'])->name('barang.index');
        Route::get('barang/{barang}', [BarangController::class, 'show'])->name('barang.show');
        Route::get('pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');
        Route::get('pelanggan/{pelanggan}', [PelangganController::class, 'show'])->name('pelanggan.show');

        // Transaksi - Full access for both admin and karyawan
        Route::resource('stok', StokController::class);
        Route::resource('penjualan', PenjualanController::class);
        Route::resource('distribusi', DistribusiController::class);

        // Hutang - View and payment
        Route::get('hutang', [HutangController::class, 'index'])->name('hutang.index');
        Route::get('hutang/{hutang}', [HutangController::class, 'show'])->name('hutang.show');
        Route::post('hutang/{hutang}/bayar', [HutangController::class, 'bayar'])->name('hutang.bayar');
    });

    // ==========================================
    // ADMIN ONLY ROUTES
    // ==========================================
    Route::middleware(['role:admin'])->group(function () {
        // Master Data - Full CRUD
        Route::get('barang/create', [BarangController::class, 'create'])->name('barang.create');
        Route::post('barang', [BarangController::class, 'store'])->name('barang.store');
        Route::get('barang/{barang}/edit', [BarangController::class, 'edit'])->name('barang.edit');
        Route::put('barang/{barang}', [BarangController::class, 'update'])->name('barang.update');
        Route::delete('barang/{barang}', [BarangController::class, 'destroy'])->name('barang.destroy');

        Route::get('pelanggan/create', [PelangganController::class, 'create'])->name('pelanggan.create');
        Route::post('pelanggan', [PelangganController::class, 'store'])->name('pelanggan.store');
        Route::get('pelanggan/{pelanggan}/edit', [PelangganController::class, 'edit'])->name('pelanggan.edit');
        Route::put('pelanggan/{pelanggan}', [PelangganController::class, 'update'])->name('pelanggan.update');
        Route::delete('pelanggan/{pelanggan}', [PelangganController::class, 'destroy'])->name('pelanggan.destroy');

        // Karyawan - Full CRUD (Admin only)
        Route::resource('karyawan', KaryawanController::class);
        Route::patch('karyawan/{karyawan}/toggle-status', [KaryawanController::class, 'toggleStatus'])->name('karyawan.toggle-status');

        // Hutang - Full CRUD
        Route::get('hutang/create', [HutangController::class, 'create'])->name('hutang.create');
        Route::post('hutang', [HutangController::class, 'store'])->name('hutang.store');
        Route::get('hutang/{hutang}/edit', [HutangController::class, 'edit'])->name('hutang.edit');
        Route::put('hutang/{hutang}', [HutangController::class, 'update'])->name('hutang.update');
        Route::delete('hutang/{hutang}', [HutangController::class, 'destroy'])->name('hutang.destroy');

        // Forecasting - Admin only
        Route::prefix('forecast')->name('forecast.')->group(function () {
            Route::get('stok', [ForecastController::class, 'stokIndex'])->name('stok');
            Route::post('stok/predict', [ForecastController::class, 'stokPredict'])->name('stok.predict');
            Route::get('distribusi', [ForecastController::class, 'distribusiIndex'])->name('distribusi');
            Route::post('distribusi/predict', [ForecastController::class, 'distribusiPredict'])->name('distribusi.predict');
            Route::post('distribusi/train', [ForecastController::class, 'distribusiTrain'])->name('distribusi.train');

            // Fallback GET routes - redirect to main pages
            Route::get('stok/predict', fn() => redirect()->route('forecast.stok'));
            Route::get('distribusi/predict', fn() => redirect()->route('forecast.distribusi'));
            Route::get('distribusi/train', fn() => redirect()->route('forecast.distribusi'));
        });
    });

    // ==========================================
    // PELANGGAN ROUTES (View own data only)
    // ==========================================
    Route::middleware(['role:pelanggan'])->prefix('my')->name('my.')->group(function () {
        Route::get('hutang', [PelangganHutangController::class, 'index'])->name('hutang.index');
        Route::get('hutang/{hutang}', [PelangganHutangController::class, 'show'])->name('hutang.show');
        Route::get('penjualan', [PelangganHutangController::class, 'penjualanIndex'])->name('penjualan.index');
    });
});

require __DIR__.'/settings.php';
