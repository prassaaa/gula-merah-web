import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type Hutang, type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, CreditCard, Receipt, User, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';

interface Props {
    hutang: Hutang;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function HutangShow({ hutang }: Props) {
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hutang', href: '/hutang' },
        { title: hutang.faktur_penjualan, href: `/hutang/${hutang.id}` },
    ];

    const paymentForm = useForm({
        jumlah_bayar: 0,
    });

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data hutang ini?')) {
            router.delete(`/hutang/${hutang.id}`);
        }
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(`/hutang/${hutang.id}/bayar`, {
            onSuccess: () => {
                setShowPaymentDialog(false);
                paymentForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={hutang.faktur_penjualan} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/hutang">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{hutang.faktur_penjualan}</h1>
                            <p className="text-muted-foreground">
                                Detail hutang pelanggan
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {hutang.status === 'belum_lunas' && (
                            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Bayar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Catat Pembayaran</DialogTitle>
                                        <DialogDescription>
                                            Sisa hutang: {formatCurrency(hutang.sisa_hutang)}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handlePayment}>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_bayar">Jumlah Bayar</Label>
                                                <Input
                                                    id="jumlah_bayar"
                                                    type="number"
                                                    value={paymentForm.data.jumlah_bayar}
                                                    onChange={(e) => paymentForm.setData('jumlah_bayar', Number(e.target.value))}
                                                    max={hutang.sisa_hutang}
                                                    min={1}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(paymentForm.data.jumlah_bayar)}
                                                </p>
                                                <InputError message={paymentForm.errors.jumlah_bayar} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowPaymentDialog(false)}
                                            >
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={paymentForm.processing}>
                                                Konfirmasi Pembayaran
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`/hutang/${hutang.id}/edit`}>
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
                                <Receipt className="h-5 w-5" />
                                Informasi Faktur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nomor Faktur</p>
                                    <p className="font-medium">{hutang.faktur_penjualan}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Tanggal
                                    </p>
                                    <p className="font-medium">{hutang.tanggal}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={hutang.status === 'lunas' ? 'default' : 'destructive'}>
                                    {hutang.status_label}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Penjualan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hutang.penjualan ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pelanggan</p>
                                        <p className="font-medium">{hutang.penjualan.pelanggan}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Barang</p>
                                        <p className="font-medium">{hutang.penjualan.barang}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tanggal Penjualan</p>
                                        <p className="font-medium">{hutang.penjualan.tanggal_penjualan}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">Data penjualan tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Rincian Hutang
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Nilai Faktur</p>
                                <p className="text-2xl font-bold">{formatCurrency(hutang.nilai_faktur)}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                                <p className="text-sm text-green-600 dark:text-green-400">DP / Bayar</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(hutang.dp_bayar)}
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                                <p className="text-sm text-red-600 dark:text-red-400">Sisa Hutang</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(hutang.sisa_hutang)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Dibuat pada</p>
                                <p>{hutang.created_at}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Terakhir diupdate</p>
                                <p>{hutang.updated_at}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
