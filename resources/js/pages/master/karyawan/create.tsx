import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Karyawan', href: '/karyawan' },
    { title: 'Tambah', href: '/karyawan/create' },
];

export default function KaryawanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama_karyawan: '',
        jabatan: '',
        kontak: '',
        alamat: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/karyawan');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Karyawan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/karyawan">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Karyawan</h1>
                        <p className="text-muted-foreground">
                            Tambah data karyawan baru
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Karyawan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nama_karyawan">Nama Karyawan *</Label>
                                    <Input
                                        id="nama_karyawan"
                                        value={data.nama_karyawan}
                                        onChange={(e) => setData('nama_karyawan', e.target.value)}
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                    <InputError message={errors.nama_karyawan} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jabatan">Jabatan *</Label>
                                    <Input
                                        id="jabatan"
                                        value={data.jabatan}
                                        onChange={(e) => setData('jabatan', e.target.value)}
                                        placeholder="Contoh: Sopir, Admin Gudang, Kasir"
                                    />
                                    <InputError message={errors.jabatan} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kontak">Kontak</Label>
                                <Input
                                    id="kontak"
                                    value={data.kontak}
                                    onChange={(e) => setData('kontak', e.target.value)}
                                    placeholder="Nomor telepon atau HP"
                                />
                                <InputError message={errors.kontak} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Textarea
                                    id="alamat"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    placeholder="Alamat lengkap karyawan (opsional)"
                                    rows={3}
                                />
                                <InputError message={errors.alamat} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Status Aktif</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/karyawan">Batal</Link>
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
