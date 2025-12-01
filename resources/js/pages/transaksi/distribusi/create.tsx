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
import { type Pelanggan, type Barang, type BreadcrumbItem, type JenisKendaraan } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Props {
    pelanggans: Pelanggan[];
    barangs: Barang[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Distribusi', href: '/distribusi' },
    { title: 'Tambah', href: '/distribusi/create' },
];

const jenisKendaraanOptions: { value: JenisKendaraan; label: string }[] = [
    { value: 'pick_up', label: 'Pick Up' },
    { value: 'truk_sedang', label: 'Truk Sedang' },
    { value: 'truk_besar', label: 'Truk Besar' },
];

export default function DistribusiCreate({ pelanggans, barangs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        faktur_distribusi: '',
        pelanggan_id: '',
        barang_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        jarak_kirim_km: '',
        jumlah_kg: '',
        jenis_kendaraan: '' as JenisKendaraan | '',
        biaya_bahan_bakar: '0',
        biaya_tenaga_kerja: '0',
        biaya_tambahan: '0',
        keterangan: '',
    });

    const handlePelangganChange = (value: string) => {
        setData('pelanggan_id', value);
        const pelanggan = pelanggans.find((p) => p.id.toString() === value);
        if (pelanggan) {
            setData('jarak_kirim_km', pelanggan.jarak_km.toString());
        }
    };

    const totalBiaya = Number(data.biaya_bahan_bakar) + Number(data.biaya_tenaga_kerja) + Number(data.biaya_tambahan);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/distribusi');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Distribusi" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/distribusi">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Distribusi</h1>
                        <p className="text-muted-foreground">
                            Tambah data distribusi baru
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Distribusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="faktur_distribusi">No. Faktur Distribusi</Label>
                                    <Input
                                        id="faktur_distribusi"
                                        value={data.faktur_distribusi}
                                        onChange={(e) => setData('faktur_distribusi', e.target.value)}
                                        placeholder="DST-001"
                                    />
                                    <InputError message={errors.faktur_distribusi} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pelanggan_id">Pelanggan</Label>
                                    <Select value={data.pelanggan_id} onValueChange={handlePelangganChange}>
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
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="barang_id">Barang</Label>
                                    <Select value={data.barang_id} onValueChange={(value) => setData('barang_id', value)}>
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
                                    <Label htmlFor="jarak_kirim_km">Jarak Kirim (km)</Label>
                                    <Input
                                        id="jarak_kirim_km"
                                        type="number"
                                        value={data.jarak_kirim_km}
                                        onChange={(e) => setData('jarak_kirim_km', e.target.value)}
                                    />
                                    <InputError message={errors.jarak_kirim_km} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_kg">Jumlah (kg)</Label>
                                    <Input
                                        id="jumlah_kg"
                                        type="number"
                                        value={data.jumlah_kg}
                                        onChange={(e) => setData('jumlah_kg', e.target.value)}
                                    />
                                    <InputError message={errors.jumlah_kg} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kendaraan">Jenis Kendaraan</Label>
                                    <Select
                                        value={data.jenis_kendaraan}
                                        onValueChange={(value) => setData('jenis_kendaraan', value as JenisKendaraan)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kendaraan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jenisKendaraanOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.jenis_kendaraan} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="biaya_bahan_bakar">Biaya Bahan Bakar (Rp)</Label>
                                    <Input
                                        id="biaya_bahan_bakar"
                                        type="number"
                                        value={data.biaya_bahan_bakar}
                                        onChange={(e) => setData('biaya_bahan_bakar', e.target.value)}
                                    />
                                    <InputError message={errors.biaya_bahan_bakar} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="biaya_tenaga_kerja">Biaya Tenaga Kerja (Rp)</Label>
                                    <Input
                                        id="biaya_tenaga_kerja"
                                        type="number"
                                        value={data.biaya_tenaga_kerja}
                                        onChange={(e) => setData('biaya_tenaga_kerja', e.target.value)}
                                    />
                                    <InputError message={errors.biaya_tenaga_kerja} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="biaya_tambahan">Biaya Tambahan (Rp)</Label>
                                    <Input
                                        id="biaya_tambahan"
                                        type="number"
                                        value={data.biaya_tambahan}
                                        onChange={(e) => setData('biaya_tambahan', e.target.value)}
                                    />
                                    <InputError message={errors.biaya_tambahan} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Biaya</Label>
                                    <Input
                                        value={`Rp ${totalBiaya.toLocaleString('id-ID')}`}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.keterangan} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/distribusi">Batal</Link>
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

