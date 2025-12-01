<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // Dashboard
            'view-dashboard',
            'view-dashboard-stats',
            'view-dashboard-charts',

            // Master Data - Barang
            'view-barang',
            'create-barang',
            'edit-barang',
            'delete-barang',

            // Master Data - Pelanggan
            'view-pelanggan',
            'create-pelanggan',
            'edit-pelanggan',
            'delete-pelanggan',

            // Master Data - Karyawan
            'view-karyawan',
            'create-karyawan',
            'edit-karyawan',
            'delete-karyawan',

            // Transaksi - Stok
            'view-stok',
            'create-stok',
            'edit-stok',
            'delete-stok',

            // Transaksi - Penjualan
            'view-penjualan',
            'create-penjualan',
            'edit-penjualan',
            'delete-penjualan',

            // Transaksi - Distribusi
            'view-distribusi',
            'create-distribusi',
            'edit-distribusi',
            'delete-distribusi',

            // Transaksi - Hutang
            'view-hutang',
            'view-own-hutang',  // Pelanggan hanya lihat hutang sendiri
            'create-hutang',
            'edit-hutang',
            'delete-hutang',
            'bayar-hutang',

            // Forecasting
            'view-forecast',
            'run-forecast-stok',
            'run-forecast-distribusi',
            'train-model',

            // User Management
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'assign-roles',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign permissions

        // Admin - Full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Karyawan - Limited access based on operations
        $karyawanRole = Role::create(['name' => 'karyawan']);
        $karyawanRole->givePermissionTo([
            'view-dashboard',
            'view-dashboard-stats',

            // View master data (no create/edit/delete)
            'view-barang',
            'view-pelanggan',

            // Stok operations
            'view-stok',
            'create-stok',
            'edit-stok',

            // Penjualan operations
            'view-penjualan',
            'create-penjualan',
            'edit-penjualan',

            // Distribusi operations
            'view-distribusi',
            'create-distribusi',
            'edit-distribusi',

            // Hutang - view and payment
            'view-hutang',
            'bayar-hutang',
        ]);

        // Pelanggan - Very limited access (view own data only)
        $pelangganRole = Role::create(['name' => 'pelanggan']);
        $pelangganRole->givePermissionTo([
            'view-dashboard',
            'view-own-hutang',  // Only own hutang
            'view-penjualan',   // Only own penjualan (will be filtered in controller)
        ]);

        $this->command->info('Roles and Permissions seeded successfully!');
        $this->command->table(
            ['Role', 'Permissions Count'],
            [
                ['admin', $adminRole->permissions->count()],
                ['karyawan', $karyawanRole->permissions->count()],
                ['pelanggan', $pelangganRole->permissions->count()],
            ]
        );
    }
}
