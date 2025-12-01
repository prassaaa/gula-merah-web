import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    LayoutGrid,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    UserCheck,
    Users,
    Warehouse,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const roles = auth.roles || [];

    const isAdmin = roles.includes('admin');
    const isKaryawan = roles.includes('karyawan');
    const isPelanggan = roles.includes('pelanggan');

    const navGroups = useMemo<NavGroup[]>(() => {
        const groups: NavGroup[] = [];

        // Menu Utama - All users can see dashboard
        groups.push({
            title: 'Menu Utama',
            items: [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        });

        // Master Data - Admin gets full access, Karyawan gets view access
        if (isAdmin || isKaryawan) {
            const masterDataItems = [
                {
                    title: 'Barang',
                    href: '/barang',
                    icon: Package,
                },
                {
                    title: 'Pelanggan',
                    href: '/pelanggan',
                    icon: Users,
                },
            ];

            // Only admin can see Karyawan menu
            if (isAdmin) {
                masterDataItems.push({
                    title: 'Karyawan',
                    href: '/karyawan',
                    icon: UserCheck,
                });
            }

            groups.push({
                title: 'Master Data',
                items: masterDataItems,
            });
        }

        // Transaksi - Admin and Karyawan
        if (isAdmin || isKaryawan) {
            groups.push({
                title: 'Transaksi',
                items: [
                    {
                        title: 'Stok',
                        href: '/stok',
                        icon: Warehouse,
                    },
                    {
                        title: 'Penjualan',
                        href: '/penjualan',
                        icon: ShoppingCart,
                    },
                    {
                        title: 'Distribusi',
                        href: '/distribusi',
                        icon: Truck,
                    },
                    {
                        title: 'Hutang',
                        href: '/hutang',
                        icon: CreditCard,
                    },
                ],
            });
        }

        // Forecasting - Admin only
        if (isAdmin) {
            groups.push({
                title: 'Forecasting',
                items: [
                    {
                        title: 'Prediksi Stok (ARIMA)',
                        href: '/forecast/stok',
                        icon: TrendingUp,
                    },
                    {
                        title: 'Prediksi Biaya Distribusi',
                        href: '/forecast/distribusi',
                        icon: BarChart3,
                    },
                ],
            });
        }

        // Pelanggan Menu - Only for pelanggan role
        if (isPelanggan) {
            groups.push({
                title: 'Data Saya',
                items: [
                    {
                        title: 'Hutang Saya',
                        href: '/my/hutang',
                        icon: CreditCard,
                    },
                    {
                        title: 'Riwayat Pembelian',
                        href: '/my/penjualan',
                        icon: ShoppingCart,
                    },
                ],
            });
        }

        return groups;
    }, [isAdmin, isKaryawan, isPelanggan]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <NavMain key={group.title} items={group.items} label={group.title} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
