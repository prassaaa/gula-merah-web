import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    Users,
    ShoppingCart,
    Truck,
    TrendingUp,
    ArrowRight,
    CreditCard,
    UserCheck,
    AlertTriangle,
} from 'lucide-react';

interface AdminStats {
    totalBarang: number;
    totalPelanggan: number;
    totalKaryawan: number;
    totalPenjualanBulanIni: number;
    jumlahTransaksiBulanIni: number;
    totalDistribusiBulanIni: number;
    jumlahDistribusiBulanIni: number;
    totalHutangBelumLunas: number;
    jumlahHutangBelumLunas: number;
}

interface RecentSale {
    id: number;
    no_faktur: string;
    pelanggan: string;
    barang: string;
    total: number;
    tanggal: string;
}

interface StockLevel {
    barang_id: number;
    nama_barang: string;
    stok_akhir: number;
}

interface TopDebtor {
    id: number;
    pelanggan: string;
    sisa_hutang: number;
    tanggal: string;
}

interface Props {
    stats: AdminStats;
    recentSales: RecentSale[];
    stockLevels: StockLevel[];
    topDebtors: TopDebtor[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function AdminDashboard({ stats, recentSales, stockLevels, topDebtors }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                    <p className="text-muted-foreground">
                        Overview lengkap sistem manajemen Gula Merah
                    </p>
                </div>

                {/* Stats Cards - Row 1 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalBarang || 0}</div>
                            <p className="text-xs text-muted-foreground">Jenis produk aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalPelanggan || 0}</div>
                            <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalKaryawan || 0}</div>
                            <p className="text-xs text-muted-foreground">Karyawan aktif</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                                Hutang Belum Lunas
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(stats?.totalHutangBelumLunas || 0)}
                            </div>
                            <p className="text-xs text-red-600/70">
                                {stats?.jumlahHutangBelumLunas || 0} transaksi
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards - Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
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
                                {stats?.jumlahTransaksiBulanIni || 0} transaksi
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
                                {formatCurrency(stats?.totalDistribusiBulanIni || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.jumlahDistribusiBulanIni || 0} pengiriman
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Sales */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Penjualan Terbaru</CardTitle>
                            <CardDescription>{recentSales?.length || 0} transaksi terakhir</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {!recentSales || recentSales.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">
                                        Belum ada data penjualan
                                    </p>
                                ) : (
                                    recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{sale.pelanggan}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {sale.no_faktur} - {sale.tanggal}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">{formatCurrency(sale.total)}</div>
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
                                {!stockLevels || stockLevels.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">Belum ada data stok</p>
                                ) : (
                                    stockLevels.map((stock) => (
                                        <div key={stock.barang_id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{stock.nama_barang}</span>
                                                <span className="text-sm text-muted-foreground">
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
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Debtors & Forecasting */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Debtors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Hutang Terbesar
                            </CardTitle>
                            <CardDescription>Pelanggan dengan hutang terbesar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {!topDebtors || topDebtors.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">
                                        Tidak ada hutang belum lunas
                                    </p>
                                ) : (
                                    topDebtors.map((debtor) => (
                                        <div key={debtor.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{debtor.pelanggan}</p>
                                                <p className="text-xs text-muted-foreground">{debtor.tanggal}</p>
                                            </div>
                                            <span className="font-semibold text-red-600">
                                                {formatCurrency(debtor.sisa_hutang)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/hutang">
                                        Kelola Hutang
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forecasting */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                AI Forecasting
                            </CardTitle>
                            <CardDescription>Prediksi stok dan biaya distribusi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <Card className="border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Prediksi Stok (ARIMA)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" asChild>
                                            <Link href="/forecast/stok">
                                                Mulai Prediksi
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card className="border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Prediksi Biaya Distribusi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" asChild>
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
            </div>
        </AppLayout>
    );
}
