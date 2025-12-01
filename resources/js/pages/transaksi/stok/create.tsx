import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Barang, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Props {
    barangs: Barang[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok', href: '/stok' },
    { title: 'Tambah', href: '/stok/create' },
];

export default function StokCreate({ barangs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        barang_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        stok_awal: '',
        masuk: '0',
        keluar: '0',
        keterangan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stok');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Stok" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/stok">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Stok</h1>
                        <p className="text-muted-foreground">
                            Tambah data stok harian
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Stok</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="barang_id">Barang</Label>
                                    <Select
                                        value={data.barang_id}
                                        onValueChange={(value) => setData('barang_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih barang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barangs.map((barang) => (
                                                <SelectItem key={barang.id} value={barang.id.toString()}>
                                                    {barang.nama_barang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.barang_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                    />
                                    <InputError message={errors.tanggal} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="stok_awal">Stok Awal</Label>
                                    <Input
                                        id="stok_awal"
                                        type="number"
                                        value={data.stok_awal}
                                        onChange={(e) => setData('stok_awal', e.target.value)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.stok_awal} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="masuk">Stok Masuk</Label>
                                    <Input
                                        id="masuk"
                                        type="number"
                                        value={data.masuk}
                                        onChange={(e) => setData('masuk', e.target.value)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.masuk} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="keluar">Stok Keluar</Label>
                                    <Input
                                        id="keluar"
                                        type="number"
                                        value={data.keluar}
                                        onChange={(e) => setData('keluar', e.target.value)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.keluar} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Keterangan (opsional)"
                                    rows={3}
                                />
                                <InputError message={errors.keterangan} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/stok">Batal</Link>
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

