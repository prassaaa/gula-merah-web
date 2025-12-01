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
    { title: 'Barang', href: '/barang' },
    { title: 'Tambah', href: '/barang/create' },
];

export default function BarangCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kode_barang: '',
        nama_barang: '',
        deskripsi: '',
        harga_per_kg: '',
        satuan: 'kg',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/barang');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Barang" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/barang">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Barang</h1>
                        <p className="text-muted-foreground">
                            Tambah data barang baru
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Barang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="kode_barang">Kode Barang</Label>
                                    <Input
                                        id="kode_barang"
                                        value={data.kode_barang}
                                        onChange={(e) => setData('kode_barang', e.target.value)}
                                        placeholder="Contoh: GT"
                                    />
                                    <InputError message={errors.kode_barang} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nama_barang">Nama Barang</Label>
                                    <Input
                                        id="nama_barang"
                                        value={data.nama_barang}
                                        onChange={(e) => setData('nama_barang', e.target.value)}
                                        placeholder="Contoh: Gula Tebu"
                                    />
                                    <InputError message={errors.nama_barang} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Deskripsi barang (opsional)"
                                    rows={3}
                                />
                                <InputError message={errors.deskripsi} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="harga_per_kg">Harga per Kg</Label>
                                    <Input
                                        id="harga_per_kg"
                                        type="number"
                                        value={data.harga_per_kg}
                                        onChange={(e) => setData('harga_per_kg', e.target.value)}
                                        placeholder="Contoh: 15000"
                                    />
                                    <InputError message={errors.harga_per_kg} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="satuan">Satuan</Label>
                                    <Input
                                        id="satuan"
                                        value={data.satuan}
                                        onChange={(e) => setData('satuan', e.target.value)}
                                        placeholder="Contoh: kg"
                                    />
                                    <InputError message={errors.satuan} />
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
                                    <Link href="/barang">Batal</Link>
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

