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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Barang, type Stok, type BreadcrumbItem, type ForecastResult } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
    barangs: Barang[];
    stoks: Stok[];
    forecast?: ForecastResult;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prediksi Stok (ARIMA)', href: '/forecast/stok' },
];

export default function ForecastStok({ barangs, stoks, forecast }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        barang_id: '',
        periods: '7',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        post('/forecast/stok/predict', {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prediksi Stok (ARIMA)" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Prediksi Stok dengan ARIMA</h1>
                    <p className="text-muted-foreground">
                        Prediksi stok menggunakan metode ARIMA (AutoRegressive Integrated Moving Average)
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Parameter Prediksi</CardTitle>
                            <CardDescription>
                                Pilih barang dan periode prediksi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="periods">Periode Prediksi (hari)</Label>
                                    <Input
                                        id="periods"
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={data.periods}
                                        onChange={(e) => setData('periods', e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing || isLoading}>
                                    {(processing || isLoading) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Prediksi Stok
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Hasil Prediksi</CardTitle>
                            <CardDescription>
                                Prediksi stok untuk periode yang dipilih
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!forecast ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mb-4" />
                                    <p>Pilih barang dan klik "Prediksi Stok" untuk melihat hasil</p>
                                </div>
                            ) : forecast.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{forecast.error}</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="p-3 text-left">Tanggal</th>
                                                    <th className="p-3 text-right">Prediksi Stok</th>
                                                    <th className="p-3 text-right">Batas Bawah</th>
                                                    <th className="p-3 text-right">Batas Atas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {forecast.predictions?.map((pred, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-3">{pred.date}</td>
                                                        <td className="p-3 text-right font-medium">
                                                            {Math.round(pred.value)}
                                                        </td>
                                                        <td className="p-3 text-right text-muted-foreground">
                                                            {Math.round(pred.lower_bound)}
                                                        </td>
                                                        <td className="p-3 text-right text-muted-foreground">
                                                            {Math.round(pred.upper_bound)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {forecast.metrics && (
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">MAPE</p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.mape?.toFixed(2)}%
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">RMSE</p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.rmse?.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">MAE</p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.mae?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Historis Stok</CardTitle>
                        <CardDescription>
                            Data stok yang digunakan untuk training model ARIMA
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border max-h-96 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-background">
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left">Tanggal</th>
                                        <th className="p-3 text-left">Barang</th>
                                        <th className="p-3 text-right">Stok Akhir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stoks.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                Belum ada data stok
                                            </td>
                                        </tr>
                                    ) : (
                                        stoks.map((stok) => (
                                            <tr key={stok.id} className="border-b">
                                                <td className="p-3">{stok.tanggal}</td>
                                                <td className="p-3">{stok.barang?.nama_barang}</td>
                                                <td className="p-3 text-right">{stok.stok_akhir}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

