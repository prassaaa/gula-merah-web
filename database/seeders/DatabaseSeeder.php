<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Karyawan;
use App\Models\Pelanggan;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Roles and Permissions first
        $this->call(RolePermissionSeeder::class);

        // Create Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Seed business data
        $this->call([
            KaryawanSeeder::class,
            BarangSeeder::class,
            PelangganSeeder::class,
            StokSeeder::class,
            PenjualanSeeder::class,
            DistribusiSeeder::class,
            HutangSeeder::class,
        ]);

        // Create sample Karyawan user with account
        $karyawanUser = User::firstOrCreate(
            ['email' => 'karyawan@example.com'],
            [
                'name' => 'Staff Gudang',
                'username' => 'staff',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $karyawanUser->assignRole('karyawan');
        
        // Link to existing karyawan
        $karyawan = Karyawan::first();
        if ($karyawan) {
            $karyawan->update(['user_id' => $karyawanUser->id]);
        }

        // Create sample Pelanggan user with account
        $pelangganUser = User::firstOrCreate(
            ['email' => 'pelanggan@example.com'],
            [
                'name' => 'Pelanggan Demo',
                'username' => 'pelanggan',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $pelangganUser->assignRole('pelanggan');
        
        // Link to existing pelanggan
        $pelanggan = Pelanggan::first();
        if ($pelanggan) {
            $pelanggan->update(['user_id' => $pelangganUser->id]);
        }

        $this->command->info('');
        $this->command->info('=== Sample Users Created ===');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@example.com', 'password'],
                ['Karyawan', 'karyawan@example.com', 'password'],
                ['Pelanggan', 'pelanggan@example.com', 'password'],
            ]
        );
    }
}
