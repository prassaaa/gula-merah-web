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
        Schema::create('distribusis', function (Blueprint $table) {
            $table->id();
            $table->string('faktur_distribusi', 50)->unique();
            $table->foreignId('pelanggan_id')->constrained('pelanggans')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barangs')->cascadeOnDelete();
            $table->date('tanggal');
            $table->integer('jarak_kirim_km')->default(0);
            $table->decimal('jumlah_kg', 15, 2)->default(0);
            $table->enum('jenis_kendaraan', ['pick_up', 'truk_sedang', 'truk_besar'])->default('pick_up');
            $table->decimal('biaya_bahan_bakar', 15, 2)->default(0);
            $table->decimal('biaya_tenaga_kerja', 15, 2)->default(0);
            $table->decimal('biaya_tambahan', 15, 2)->default(0);
            $table->decimal('total_biaya_distribusi', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Index for XGBoost training data queries
            $table->index(['pelanggan_id', 'tanggal']);
            $table->index(['jenis_kendaraan', 'jarak_kirim_km']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribusis');
    }
};
