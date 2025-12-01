import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, Truck, ArrowRight, Package, CalendarDays } from 'lucide-react';

interface KaryawanStats {
    penjualanHariIni: number;
    totalPenjualanHariIni: number;
    distribusiHariIni: number;
    penjualanBulanIni: number;
    totalPenjualanBulanIni: number;
}

interface RecentSale {
    id: number;
    no_faktur: string;
    pelanggan: string;
    barang: string;
    jumlah_kg: number;
    total: number;
    tanggal: string;
}

interface StockLevel {
    barang_id: number;
    nama_barang: string;
    stok_akhir: number;
}

interface RecentDistribusi {
    id: number;
    faktur: string;
    pelanggan: string;
    barang: string;
    jumlah_kg: number;
    tanggal: string;
}

interface Props {
    stats: KaryawanStats;
    recentSales: RecentSale[];
    stockLevels: StockLevel[];
    recentDistribusi: RecentDistribusi[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function KaryawanDashboard({ stats, recentSales, stockLevels, recentDistribusi }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Karyawan" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Karyawan</h1>
                    <p className="text-muted-foreground">Ringkasan aktivitas harian dan operasional</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                Penjualan Hari Ini
                            </CardTitle>
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats?.penjualanHariIni || 0}
                            </div>
                            <p className="text-xs text-blue-600/70">transaksi</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                                Total Penjualan Hari Ini
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats?.totalPenjualanHariIni || 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Distribusi Hari Ini</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.distribusiHariIni || 0}</div>
                            <p className="text-xs text-muted-foreground">pengiriman</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Penjualan Bulan Ini</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats?.totalPenjualanBulanIni || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.penjualanBulanIni || 0} transaksi
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Button size="lg" className="h-20" asChild>
                        <Link href="/penjualan/create">
                            <ShoppingCart className="mr-2 h-6 w-6" />
                            Tambah Penjualan
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-20" asChild>
                        <Link href="/distribusi/create">
                            <Truck className="mr-2 h-6 w-6" />
                            Tambah Distribusi
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-20" asChild>
                        <Link href="/stok/create">
                            <Package className="mr-2 h-6 w-6" />
                            Input Stok
                        </Link>
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Sales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Penjualan Terbaru</CardTitle>
                            <CardDescription>10 transaksi terakhir</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {!recentSales || recentSales.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">
                                        Belum ada penjualan
                                    </p>
                                ) : (
                                    recentSales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{sale.pelanggan}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.barang} - {sale.jumlah_kg} kg
                                                </p>
                                                <p className="text-xs text-muted-foreground">{sale.tanggal}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(sale.total)}</p>
                                                <p className="text-xs text-muted-foreground">{sale.no_faktur}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/penjualan">
                                        Lihat Semua Penjualan
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Levels */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stok Barang</CardTitle>
                            <CardDescription>Kondisi stok saat ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {!stockLevels || stockLevels.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">Belum ada data stok</p>
                                ) : (
                                    stockLevels.map((stock) => (
                                        <div key={stock.barang_id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{stock.nama_barang}</span>
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        stock.stok_akhir < 100
                                                            ? 'text-red-600'
                                                            : stock.stok_akhir < 500
                                                              ? 'text-yellow-600'
                                                              : 'text-green-600'
                                                    }`}
                                                >
                                                    {stock.stok_akhir?.toLocaleString('id-ID')} kg
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        stock.stok_akhir < 100
                                                            ? 'bg-red-500'
                                                            : stock.stok_akhir < 500
                                                              ? 'bg-yellow-500'
                                                              : 'bg-green-500'
                                                    }`}
                                                    style={{
                                                        width: `${Math.min((stock.stok_akhir / 1000) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            {stock.stok_akhir < 100 && (
                                                <p className="text-xs text-red-600">⚠️ Stok rendah!</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/stok">
                                        Kelola Stok
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Distribusi */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Terbaru</CardTitle>
                        <CardDescription>5 pengiriman terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                            {!recentDistribusi || recentDistribusi.length === 0 ? (
                                <p className="col-span-full py-4 text-center text-muted-foreground">
                                    Belum ada distribusi
                                </p>
                            ) : (
                                recentDistribusi.map((dist) => (
                                    <Card key={dist.id} className="border-dashed">
                                        <CardContent className="p-4">
                                            <p className="font-medium">{dist.pelanggan}</p>
                                            <p className="text-sm text-muted-foreground">{dist.barang}</p>
                                            <p className="text-sm">{dist.jumlah_kg} kg</p>
                                            <p className="text-xs text-muted-foreground">{dist.tanggal}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
