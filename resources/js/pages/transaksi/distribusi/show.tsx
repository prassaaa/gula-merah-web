import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Distribusi, type BreadcrumbItem, type JenisKendaraan } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Truck, MapPin, Package, DollarSign } from 'lucide-react';

interface Props {
    distribusi: Distribusi;
}

const jenisKendaraanLabels: Record<JenisKendaraan, string> = {
    pick_up: 'Pick Up',
    truk_sedang: 'Truk Sedang',
    truk_besar: 'Truk Besar',
};

export default function DistribusiShow({ distribusi }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Distribusi', href: '/distribusi' },
        { title: `Distribusi ${distribusi.faktur_distribusi}`, href: `/distribusi/${distribusi.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data distribusi ini?')) {
            router.delete(`/distribusi/${distribusi.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Distribusi ${distribusi.tanggal}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/distribusi">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Detail Distribusi</h1>
                            <p className="text-muted-foreground">
                                {distribusi.faktur_distribusi} - {distribusi.tanggal}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/distribusi/${distribusi.id}/edit`}>
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

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jarak Kirim</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{distribusi.jarak_kirim_km} km</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jumlah</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{distribusi.jumlah_kg} kg</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kendaraan</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline" className="text-lg">
                                {jenisKendaraanLabels[distribusi.jenis_kendaraan]}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {distribusi.total_biaya_formatted}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pelanggan & Barang</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Pelanggan</dt>
                                    <dd className="text-lg">{distribusi.pelanggan?.nama}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Lokasi</dt>
                                    <dd>{distribusi.pelanggan?.lokasi}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Barang</dt>
                                    <dd>{distribusi.barang?.nama_barang}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Biaya</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Biaya Bahan Bakar</dt>
                                    <dd>{distribusi.biaya_bahan_bakar_formatted}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Biaya Tenaga Kerja</dt>
                                    <dd>{distribusi.biaya_tenaga_kerja_formatted}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Biaya Tambahan</dt>
                                    <dd>{distribusi.biaya_tambahan_formatted}</dd>
                                </div>
                                {distribusi.keterangan && (
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">
                                            Keterangan
                                        </dt>
                                        <dd>{distribusi.keterangan}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

