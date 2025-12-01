import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Penjualan, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, User, Package, Calendar, Receipt } from 'lucide-react';

interface Props {
    penjualan: Penjualan;
}

export default function PenjualanShow({ penjualan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Penjualan', href: '/penjualan' },
        { title: penjualan.no_faktur, href: `/penjualan/${penjualan.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data penjualan ini?')) {
            router.delete(`/penjualan/${penjualan.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={penjualan.no_faktur} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/penjualan">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{penjualan.no_faktur}</h1>
                            <p className="text-muted-foreground">
                                Detail transaksi penjualan
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/penjualan/${penjualan.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Informasi Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        No. Faktur
                                    </dt>
                                    <dd className="text-lg font-medium">{penjualan.no_faktur}</dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">
                                            Tanggal
                                        </dt>
                                        <dd>{penjualan.tanggal}</dd>
                                    </div>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Pelanggan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Nama</dt>
                                    <dd className="text-lg">{penjualan.pelanggan?.nama}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Lokasi</dt>
                                    <dd>{penjualan.pelanggan?.lokasi}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Detail Barang
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left">Barang</th>
                                        <th className="p-3 text-right">Jumlah</th>
                                        <th className="p-3 text-right">Harga Satuan</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-3">{penjualan.barang?.nama_barang}</td>
                                        <td className="p-3 text-right">
                                            {penjualan.jumlah_kg} {penjualan.barang?.satuan}
                                        </td>
                                        <td className="p-3 text-right">{penjualan.harga_per_kg_formatted}</td>
                                        <td className="p-3 text-right font-bold">
                                            {penjualan.total_penjualan_formatted}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

