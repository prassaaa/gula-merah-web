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
        // 1. Tambah field ke users: username (role menggunakan Spatie Permission)
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('name');
        });

        // 2. Tambah field ke barangs: kategori
        Schema::table('barangs', function (Blueprint $table) {
            $table->string('kategori', 50)->nullable()->after('nama_barang');
        });

        // 3. Tambah field ke penjualans: status
        Schema::table('penjualans', function (Blueprint $table) {
            $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas')->after('sisa_hutang');
        });

        // 4. Tambah field ke distribusis: faktur_penjualan, bahan_bakar_liter
        Schema::table('distribusis', function (Blueprint $table) {
            $table->string('faktur_penjualan', 50)->nullable()->after('faktur_distribusi');
            $table->decimal('bahan_bakar_liter', 10, 2)->default(0)->after('jenis_kendaraan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });

        Schema::table('barangs', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });

        Schema::table('penjualans', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('distribusis', function (Blueprint $table) {
            $table->dropColumn(['faktur_penjualan', 'bahan_bakar_liter']);
        });
    }
};
