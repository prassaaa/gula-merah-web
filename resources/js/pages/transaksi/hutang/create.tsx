import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { useEffect } from 'react';

interface PenjualanOption {
    id: number;
    label: string;
    nilai_faktur: number;
    dp_bayar: number;
    sisa_hutang: number;
}

interface Props {
    penjualans: PenjualanOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Hutang', href: '/hutang' },
    { title: 'Tambah', href: '/hutang/create' },
];

export default function HutangCreate({ penjualans }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        faktur_penjualan: '',
        penjualan_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        nilai_faktur: 0,
        dp_bayar: 0,
        sisa_hutang: 0,
        status: 'belum_lunas' as 'lunas' | 'belum_lunas',
    });

    // Auto-fill when penjualan selected
    useEffect(() => {
        if (data.penjualan_id) {
            const selected = penjualans.find(p => p.id === Number(data.penjualan_id));
            if (selected) {
                setData(prev => ({
                    ...prev,
                    nilai_faktur: selected.nilai_faktur,
                    dp_bayar: selected.dp_bayar,
                    sisa_hutang: selected.sisa_hutang,
                    status: selected.sisa_hutang <= 0 ? 'lunas' : 'belum_lunas',
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.penjualan_id, penjualans]);

    // Update sisa hutang when dp_bayar changes
    useEffect(() => {
        const sisa = data.nilai_faktur - data.dp_bayar;
        setData(prev => ({
            ...prev,
            sisa_hutang: Math.max(0, sisa),
            status: sisa <= 0 ? 'lunas' : 'belum_lunas',
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.nilai_faktur, data.dp_bayar]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/hutang');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Hutang" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/hutang">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Hutang</h1>
                        <p className="text-muted-foreground">
                            Catat hutang baru dari penjualan
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Hutang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="faktur_penjualan">Nomor Faktur *</Label>
                                    <Input
                                        id="faktur_penjualan"
                                        value={data.faktur_penjualan}
                                        onChange={(e) => setData('faktur_penjualan', e.target.value)}
                                        placeholder="Akan auto-generate jika kosong"
                                    />
                                    <InputError message={errors.faktur_penjualan} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal *</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                    />
                                    <InputError message={errors.tanggal} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="penjualan_id">Penjualan Terkait *</Label>
                                <Select
                                    value={data.penjualan_id.toString()}
                                    onValueChange={(value) => setData('penjualan_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih penjualan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {penjualans.length === 0 ? (
                                            <SelectItem value="none" disabled>
                                                Tidak ada penjualan dengan hutang
                                            </SelectItem>
                                        ) : (
                                            penjualans.map((penjualan) => (
                                                <SelectItem key={penjualan.id} value={penjualan.id.toString()}>
                                                    {penjualan.label}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.penjualan_id} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="nilai_faktur">Nilai Faktur *</Label>
                                    <Input
                                        id="nilai_faktur"
                                        type="number"
                                        value={data.nilai_faktur}
                                        onChange={(e) => setData('nilai_faktur', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(data.nilai_faktur)}
                                    </p>
                                    <InputError message={errors.nilai_faktur} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dp_bayar">DP / Pembayaran *</Label>
                                    <Input
                                        id="dp_bayar"
                                        type="number"
                                        value={data.dp_bayar}
                                        onChange={(e) => setData('dp_bayar', Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(data.dp_bayar)}
                                    </p>
                                    <InputError message={errors.dp_bayar} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sisa_hutang">Sisa Hutang</Label>
                                    <Input
                                        id="sisa_hutang"
                                        type="number"
                                        value={data.sisa_hutang}
                                        readOnly
                                        className="bg-muted"
                                    />
                                    <p className="text-xs font-semibold text-destructive">
                                        {formatCurrency(data.sisa_hutang)}
                                    </p>
                                    <InputError message={errors.sisa_hutang} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: 'lunas' | 'belum_lunas') => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                                        <SelectItem value="lunas">Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/hutang">Batal</Link>
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
