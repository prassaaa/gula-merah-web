import { NavFooter } from '@/components/nav-footer';
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
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Box,
    CreditCard,
    Folder,
    LayoutGrid,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    UserCheck,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from './app-logo';

const navGroups: NavGroup[] = [
    {
        title: 'Menu Utama',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Master Data',
        items: [
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
            {
                title: 'Karyawan',
                href: '/karyawan',
                icon: UserCheck,
            },
        ],
    },
    {
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
    },
    {
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
    },
];

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
