import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Pelanggan, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';

interface Props {
    pelanggan: Pelanggan;
}

export default function PelangganShow({ pelanggan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pelanggan', href: '/pelanggan' },
        { title: pelanggan.nama, href: `/pelanggan/${pelanggan.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
            router.delete(`/pelanggan/${pelanggan.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pelanggan.nama} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/pelanggan">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{pelanggan.nama}</h1>
                            <p className="text-muted-foreground">
                                Detail data pelanggan
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/pelanggan/${pelanggan.id}/edit`}>
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
                            <CardTitle>Informasi Pelanggan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Kode Pelanggan
                                    </dt>
                                    <dd className="text-lg">{pelanggan.kode_pelanggan}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Nama
                                    </dt>
                                    <dd className="text-lg">{pelanggan.nama}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </dt>
                                    <dd>
                                        <Badge variant={pelanggan.is_active ? 'default' : 'secondary'}>
                                            {pelanggan.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lokasi & Kontak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">
                                            Lokasi
                                        </dt>
                                        <dd>{pelanggan.lokasi} ({pelanggan.jarak_km} km)</dd>
                                        {pelanggan.alamat && (
                                            <dd className="text-sm text-muted-foreground">
                                                {pelanggan.alamat}
                                            </dd>
                                        )}
                                    </div>
                                </div>
                                {pelanggan.telepon && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">
                                                Telepon
                                            </dt>
                                            <dd>{pelanggan.telepon}</dd>
                                        </div>
                                    </div>
                                )}
                                {pelanggan.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">
                                                Email
                                            </dt>
                                            <dd>{pelanggan.email}</dd>
                                        </div>
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

