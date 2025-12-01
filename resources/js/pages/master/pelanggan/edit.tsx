import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Pelanggan, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Props {
    pelanggan: Pelanggan;
}

export default function PelangganEdit({ pelanggan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pelanggan', href: '/pelanggan' },
        { title: pelanggan.nama, href: `/pelanggan/${pelanggan.id}` },
        { title: 'Edit', href: `/pelanggan/${pelanggan.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        kode_pelanggan: pelanggan.kode_pelanggan,
        nama: pelanggan.nama,
        lokasi: pelanggan.lokasi,
        alamat: pelanggan.alamat || '',
        telepon: pelanggan.telepon || '',
        email: pelanggan.email || '',
        jarak_km: pelanggan.jarak_km.toString(),
        is_active: pelanggan.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/pelanggan/${pelanggan.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${pelanggan.nama}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/pelanggan">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Pelanggan</h1>
                        <p className="text-muted-foreground">
                            Edit data pelanggan {pelanggan.nama}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Pelanggan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="kode_pelanggan">Kode Pelanggan</Label>
                                    <Input
                                        id="kode_pelanggan"
                                        value={data.kode_pelanggan}
                                        onChange={(e) => setData('kode_pelanggan', e.target.value)}
                                    />
                                    <InputError message={errors.kode_pelanggan} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Pelanggan</Label>
                                    <Input
                                        id="nama"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                    />
                                    <InputError message={errors.nama} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi</Label>
                                    <Input
                                        id="lokasi"
                                        value={data.lokasi}
                                        onChange={(e) => setData('lokasi', e.target.value)}
                                    />
                                    <InputError message={errors.lokasi} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jarak_km">Jarak (km)</Label>
                                    <Input
                                        id="jarak_km"
                                        type="number"
                                        value={data.jarak_km}
                                        onChange={(e) => setData('jarak_km', e.target.value)}
                                    />
                                    <InputError message={errors.jarak_km} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alamat">Alamat Lengkap</Label>
                                <Textarea
                                    id="alamat"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.alamat} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telepon">Telepon</Label>
                                    <Input
                                        id="telepon"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                    />
                                    <InputError message={errors.telepon} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/pelanggan">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

