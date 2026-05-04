<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('penjualans', function (Blueprint $table) {
            $table->enum('metode_pembayaran', ['cash', 'hutang'])
                ->default('hutang')
                ->after('total_penjualan');
        });

        DB::table('penjualans')
            ->where('sisa_hutang', '<=', 0)
            ->update(['metode_pembayaran' => 'cash']);

        DB::table('penjualans')
            ->where('sisa_hutang', '>', 0)
            ->update(['metode_pembayaran' => 'hutang']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penjualans', function (Blueprint $table) {
            $table->dropColumn('metode_pembayaran');
        });
    }
};
