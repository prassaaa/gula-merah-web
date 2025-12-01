import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type DashboardStats,
    type RecentSale,
    type MonthlySale,
    type StockLevel,
    type DistributionByVehicle,
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Package, Users, ShoppingCart, Truck, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    stats: DashboardStats;
    recentSales: RecentSale[];
    monthlySales: MonthlySale[];
    stockLevels: StockLevel[];
    distributionByVehicle: DistributionByVehicle[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({
    stats,
    recentSales,
    stockLevels,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Selamat datang di Sistem Manajemen Gula Merah
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalBarang}</div>
                            <p className="text-xs text-muted-foreground">Jenis produk aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPelanggan}</div>
                            <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Penjualan Bulan Ini</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Rp {stats.totalPenjualanBulanIni?.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.jumlahTransaksiBulanIni} transaksi
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Distribusi Bulan Ini</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Rp {stats.totalDistribusiBulanIni?.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.jumlahDistribusiBulanIni} pengiriman
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Sales */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Penjualan Terbaru</CardTitle>
                            <CardDescription>
                                {recentSales?.length || 0} transaksi terakhir
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentSales?.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">
                                        Belum ada data penjualan
                                    </p>
                                ) : (
                                    recentSales?.map((sale) => (
                                        <div key={sale.id} className="flex items-center">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {sale.pelanggan}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {sale.no_faktur} - {sale.tanggal}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                Rp {sale.total?.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/penjualan">
                                        Lihat Semua
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Levels */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Level Stok</CardTitle>
                            <CardDescription>Stok barang saat ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stockLevels?.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">
                                        Belum ada data stok
                                    </p>
                                ) : (
                                    stockLevels?.map((stock) => (
                                        <div key={stock.barang_id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {stock.nama_barang}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {stock.stok_akhir} kg
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
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Forecasting
                        </CardTitle>
                        <CardDescription>
                            Prediksi stok dan biaya distribusi menggunakan AI
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-lg">Prediksi Stok (ARIMA)</CardTitle>
                                    <CardDescription>
                                        Prediksi kebutuhan stok menggunakan time-series analysis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/forecast/stok">
                                            Mulai Prediksi
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-lg">Prediksi Biaya Distribusi</CardTitle>
                                    <CardDescription>
                                        Estimasi biaya distribusi menggunakan XGBoost ML
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/forecast/distribusi">
                                            Mulai Prediksi
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
