import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Barang, type Pelanggan, type Penjualan, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Props {
    penjualan: Penjualan;
    barangs: Barang[];
    pelanggans: Pelanggan[];
}

export default function PenjualanEdit({ penjualan, barangs, pelanggans }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Penjualan', href: '/penjualan' },
        { title: penjualan.no_faktur, href: `/penjualan/${penjualan.id}` },
        { title: 'Edit', href: `/penjualan/${penjualan.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        no_faktur: penjualan.no_faktur,
        tanggal: penjualan.tanggal,
        pelanggan_id: penjualan.pelanggan_id.toString(),
        barang_id: penjualan.barang_id.toString(),
        jumlah_kg: penjualan.jumlah_kg.toString(),
        harga_per_kg: penjualan.harga_per_kg.toString(),
    });

    const selectedBarang = barangs.find((b) => b.id.toString() === data.barang_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/penjualan/${penjualan.id}`);
    };

    const totalPenjualan = Number(data.jumlah_kg) * Number(data.harga_per_kg);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${penjualan.no_faktur}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/penjualan">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Penjualan</h1>
                        <p className="text-muted-foreground">
                            Edit transaksi {penjualan.no_faktur}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Penjualan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="no_faktur">No. Faktur</Label>
                                    <Input
                                        id="no_faktur"
                                        value={data.no_faktur}
                                        onChange={(e) => setData('no_faktur', e.target.value)}
                                    />
                                    <InputError message={errors.no_faktur} />
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pelanggan_id">Pelanggan</Label>
                                    <Select
                                        value={data.pelanggan_id}
                                        onValueChange={(value) => setData('pelanggan_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pelanggan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pelanggans.map((pelanggan) => (
                                                <SelectItem key={pelanggan.id} value={pelanggan.id.toString()}>
                                                    {pelanggan.nama} - {pelanggan.lokasi}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.pelanggan_id} />
                                </div>
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
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_kg">Jumlah ({selectedBarang?.satuan || 'kg'})</Label>
                                    <Input
                                        id="jumlah_kg"
                                        type="number"
                                        value={data.jumlah_kg}
                                        onChange={(e) => setData('jumlah_kg', e.target.value)}
                                    />
                                    <InputError message={errors.jumlah_kg} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="harga_per_kg">Harga per Kg</Label>
                                    <Input
                                        id="harga_per_kg"
                                        type="number"
                                        value={data.harga_per_kg}
                                        onChange={(e) => setData('harga_per_kg', e.target.value)}
                                    />
                                    <InputError message={errors.harga_per_kg} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Penjualan</Label>
                                    <Input
                                        value={`Rp ${totalPenjualan.toLocaleString('id-ID')}`}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/penjualan">Batal</Link>
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

