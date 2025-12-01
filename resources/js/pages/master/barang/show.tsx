import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Barang, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface Props {
    barang: Barang;
}

export default function BarangShow({ barang }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Barang', href: '/barang' },
        { title: barang.nama_barang, href: `/barang/${barang.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            router.delete(`/barang/${barang.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={barang.nama_barang} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/barang">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{barang.nama_barang}</h1>
                            <p className="text-muted-foreground">
                                Detail data barang
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/barang/${barang.id}/edit`}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Barang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 md:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Kode Barang
                                </dt>
                                <dd className="text-lg">{barang.kode_barang}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Nama Barang
                                </dt>
                                <dd className="text-lg">{barang.nama_barang}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Harga per Kg
                                </dt>
                                <dd className="text-lg">{barang.harga_per_kg_formatted}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Satuan
                                </dt>
                                <dd className="text-lg">{barang.satuan}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Status
                                </dt>
                                <dd>
                                    <Badge variant={barang.is_active ? 'default' : 'secondary'}>
                                        {barang.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Dibuat
                                </dt>
                                <dd className="text-lg">{barang.created_at}</dd>
                            </div>
                            {barang.deskripsi && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Deskripsi
                                    </dt>
                                    <dd className="text-lg">{barang.deskripsi}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

