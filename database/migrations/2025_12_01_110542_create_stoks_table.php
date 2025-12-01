<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stoks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barangs')->cascadeOnDelete();
            $table->date('tanggal');
            $table->decimal('stok_awal', 15, 2)->default(0);
            $table->decimal('masuk', 15, 2)->default(0);
            $table->decimal('keluar', 15, 2)->default(0);
            $table->decimal('stok_akhir', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Index for faster queries on time-series data (ARIMA)
            $table->index(['barang_id', 'tanggal']);
            $table->unique(['barang_id', 'tanggal']); // One record per product per day
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stoks');
    }
};
