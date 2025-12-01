import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Hutang } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Package, User } from 'lucide-react';

interface Props {
    hutang: Hutang;
}

export default function MyHutangShow({ hutang }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hutang Saya', href: '/my/hutang' },
        { title: `Detail #${hutang.faktur_penjualan}`, href: `/my/hutang/${hutang.id}` },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Hutang #${hutang.faktur_penjualan}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Detail Hutang</h1>
                        <p className="text-muted-foreground">No. Faktur: {hutang.faktur_penjualan}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/my/hutang">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Informasi Hutang
                            </CardTitle>
                            <CardDescription>Detail informasi hutang Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-sm">Tanggal</p>
                                    <p className="font-medium">{formatDate(hutang.tanggal)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <Package className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-sm">Barang</p>
                                    <p className="font-medium">{hutang.penjualan?.barang?.nama_barang || '-'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <User className="text-muted-foreground h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-sm">Status</p>
                                    <Badge variant={hutang.status === 'lunas' ? 'default' : 'destructive'}>
                                        {hutang.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Pembayaran</CardTitle>
                            <CardDescription>Detail nilai dan pembayaran</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nilai Faktur</span>
                                <span className="font-medium">{formatCurrency(hutang.nilai_faktur)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sudah Dibayar (DP)</span>
                                <span className="font-medium text-green-600">{formatCurrency(hutang.dp_bayar)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold">Sisa Hutang</span>
                                <span className="text-lg font-bold text-red-600">
                                    {formatCurrency(hutang.sisa_hutang)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Progress Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Persentase Pembayaran</span>
                                <span>
                                    {hutang.nilai_faktur > 0
                                        ? Math.round((hutang.dp_bayar / hutang.nilai_faktur) * 100)
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="bg-muted h-3 overflow-hidden rounded-full">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{
                                        width: `${hutang.nilai_faktur > 0 ? (hutang.dp_bayar / hutang.nilai_faktur) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
