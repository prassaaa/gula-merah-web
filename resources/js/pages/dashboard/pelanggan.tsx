import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Pelanggan } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, CreditCard, ArrowRight, AlertTriangle, CheckCircle, User } from 'lucide-react';

interface PelangganStats {
    totalPembelian: number;
    totalNilaiPembelian: number;
    pembelianBulanIni: number;
    nilaiPembelianBulanIni: number;
}

interface HutangSummary {
    totalHutang: number;
    jumlahHutang: number;
    totalLunas: number;
}

interface RecentPurchase {
    id: number;
    no_faktur: string;
    barang: string;
    jumlah_kg: number;
    total: number;
    tanggal: string;
}

interface RecentHutang {
    id: number;
    faktur: string;
    barang: string;
    sisa_hutang: number;
    tanggal: string;
}

interface Props {
    stats: PelangganStats | null;
    recentPurchases: RecentPurchase[];
    hutangSummary: HutangSummary | null;
    recentHutang: RecentHutang[];
    pelanggan: Pelanggan | null;
    notLinked: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function PelangganDashboard({
    stats,
    recentPurchases,
    hutangSummary,
    recentHutang,
    pelanggan,
    notLinked,
}: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    // Show warning if account not linked to pelanggan
    if (notLinked) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Pelanggan" />

                <div className="flex flex-col gap-4 p-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Pelanggan</h1>
                        <p className="text-muted-foreground">Selamat datang di portal pelanggan</p>
                    </div>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Akun Belum Terhubung</AlertTitle>
                        <AlertDescription>
                            Akun Anda belum terhubung dengan data pelanggan. Silakan hubungi admin untuk
                            menghubungkan akun Anda dengan data pelanggan yang sesuai.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Setelah akun Anda terhubung, Anda dapat melihat:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                                <li>Riwayat pembelian Anda</li>
                                <li>Status hutang Anda</li>
                                <li>Ringkasan transaksi bulanan</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pelanggan" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Selamat Datang, {pelanggan?.nama}</h1>
                    <p className="text-muted-foreground">Portal pelanggan Gula Merah</p>
                </div>

                {/* Hutang Alert */}
                {hutangSummary && hutangSummary.totalHutang > 0 && (
                    <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950">
                        <CreditCard className="h-4 w-4" />
                        <AlertTitle>Anda Memiliki Hutang</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                Total hutang belum lunas: <strong>{formatCurrency(hutangSummary.totalHutang)}</strong>{' '}
                                ({hutangSummary.jumlahHutang} transaksi)
                            </span>
                            <Button size="sm" variant="destructive" asChild>
                                <Link href="/my/hutang">Lihat Detail</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalPembelian || 0}</div>
                            <p className="text-xs text-muted-foreground">transaksi sepanjang waktu</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Nilai Pembelian</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats?.totalNilaiPembelian || 0)}
                            </div>
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
                                {formatCurrency(hutangSummary?.totalHutang || 0)}
                            </div>
                            <p className="text-xs text-red-600/70">
                                {hutangSummary?.jumlahHutang || 0} transaksi
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                                Hutang Lunas
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {hutangSummary?.totalLunas || 0}
                            </div>
                            <p className="text-xs text-green-600/70">transaksi sudah lunas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* This Month Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pembelian Bulan Ini</CardTitle>
                        <CardDescription>Ringkasan transaksi bulan berjalan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4 text-center">
                                <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
                                <p className="text-3xl font-bold">{stats?.pembelianBulanIni || 0}</p>
                            </div>
                            <div className="rounded-lg border p-4 text-center">
                                <p className="text-sm text-muted-foreground">Total Nilai</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(stats?.nilaiPembelianBulanIni || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Purchases */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pembelian Terakhir</CardTitle>
                            <CardDescription>5 transaksi terakhir Anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {!recentPurchases || recentPurchases.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">
                                        Belum ada riwayat pembelian
                                    </p>
                                ) : (
                                    recentPurchases.map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{purchase.barang}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {purchase.jumlah_kg} kg • {purchase.tanggal}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(purchase.total)}</p>
                                                <p className="text-xs text-muted-foreground">{purchase.no_faktur}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/my/penjualan">
                                        Lihat Semua Pembelian
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Hutang */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-red-500" />
                                Hutang Belum Lunas
                            </CardTitle>
                            <CardDescription>Daftar hutang yang perlu dibayar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {!recentHutang || recentHutang.length === 0 ? (
                                    <div className="py-4 text-center">
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                                        <p className="mt-2 font-medium text-green-600">Tidak ada hutang!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Semua transaksi Anda sudah lunas
                                        </p>
                                    </div>
                                ) : (
                                    recentHutang.map((hutang) => (
                                        <div
                                            key={hutang.id}
                                            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{hutang.barang}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {hutang.faktur} • {hutang.tanggal}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-red-600">
                                                {formatCurrency(hutang.sisa_hutang)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            {recentHutang && recentHutang.length > 0 && (
                                <div className="mt-4">
                                    <Button variant="destructive" className="w-full" asChild>
                                        <Link href="/my/hutang">
                                            Lihat Semua Hutang
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Pelanggan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Kode Pelanggan</p>
                                <p className="font-medium">{pelanggan?.kode_pelanggan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Lokasi</p>
                                <p className="font-medium">{pelanggan?.lokasi || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Telepon</p>
                                <p className="font-medium">{pelanggan?.telepon || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
