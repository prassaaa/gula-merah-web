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
        Schema::create('hutangs', function (Blueprint $table) {
            $table->id();
            $table->string('faktur_penjualan', 50);
            $table->foreignId('penjualan_id')->constrained('penjualans')->cascadeOnDelete();
            $table->date('tanggal');
            $table->decimal('nilai_faktur', 15, 2)->default(0);
            $table->decimal('dp_bayar', 15, 2)->default(0);
            $table->decimal('sisa_hutang', 15, 2)->default(0);
            $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas');
            $table->timestamps();

            $table->index(['penjualan_id', 'tanggal']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hutangs');
    }
};
