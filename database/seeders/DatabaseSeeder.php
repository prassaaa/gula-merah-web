<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user with new fields
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => 'password',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

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
    }
}
