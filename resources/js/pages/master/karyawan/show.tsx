import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type Karyawan, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Phone, MapPin, Briefcase } from 'lucide-react';

interface Props {
    karyawan: Karyawan;
}

export default function KaryawanShow({ karyawan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Karyawan', href: '/karyawan' },
        { title: karyawan.nama_karyawan, href: `/karyawan/${karyawan.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            router.delete(`/karyawan/${karyawan.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={karyawan.nama_karyawan} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/karyawan">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{karyawan.nama_karyawan}</h1>
                            <p className="text-muted-foreground">
                                Detail informasi karyawan
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/karyawan/${karyawan.id}/edit`}>
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
                                <Briefcase className="h-5 w-5" />
                                Informasi Karyawan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                    <p className="font-medium">{karyawan.nama_karyawan}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Jabatan</p>
                                    <Badge variant="outline">{karyawan.jabatan}</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={karyawan.is_active ? 'default' : 'secondary'}>
                                    {karyawan.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Kontak & Alamat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Kontak
                                </p>
                                <p className="font-medium">{karyawan.kontak || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Alamat
                                </p>
                                <p className="font-medium">{karyawan.alamat || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Dibuat pada</p>
                                <p>{karyawan.created_at}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Terakhir diupdate</p>
                                <p>{karyawan.updated_at}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
