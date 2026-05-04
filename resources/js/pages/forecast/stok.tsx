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
import InputError from '@/components/input-error';
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
    filters?: {
        barang_id?: string;
        start_date?: string;
        end_date?: string;
        forecast_until?: string;
        periods?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prediksi Stok (ARIMA)', href: '/forecast/stok' },
];

function MiniLineChart({
    actual,
    predicted,
}: {
    actual: Array<{ label: string; value: number }>;
    predicted: Array<{ label: string; value: number }>;
}) {
    const points = [...actual, ...predicted];
    const width = 720;
    const height = 260;
    const padding = 28;
    const min = Math.min(...points.map((point) => point.value), 0);
    const max = Math.max(...points.map((point) => point.value), 1);
    const scaleX = (index: number) => padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const scaleY = (value: number) => height - padding - ((value - min) / Math.max(max - min, 1)) * (height - padding * 2);
    const toPath = (series: Array<{ value: number }>, offset = 0) =>
        series.map((point, index) => `${index === 0 ? 'M' : 'L'} ${scaleX(index + offset)} ${scaleY(point.value)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-muted-foreground/30" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-muted-foreground/30" />
            <path d={toPath(actual)} fill="none" className="stroke-blue-600" strokeWidth="3" />
            <path d={toPath(predicted, actual.length)} fill="none" className="stroke-green-600" strokeWidth="3" strokeDasharray="6 4" />
            {actual.map((point, index) => (
                <circle key={`actual-${point.label}`} cx={scaleX(index)} cy={scaleY(point.value)} r="3" className="fill-blue-600" />
            ))}
            {predicted.map((point, index) => (
                <circle key={`pred-${point.label}`} cx={scaleX(index + actual.length)} cy={scaleY(point.value)} r="3" className="fill-green-600" />
            ))}
        </svg>
    );
}

export default function ForecastStok({ barangs, stoks, forecast, filters }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        barang_id: filters?.barang_id || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        forecast_until: filters?.forecast_until || '',
        periods: filters?.periods || '7',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        post('/forecast/stok/predict', {
            onFinish: () => setIsLoading(false),
        });
    };

    const actualChart = forecast?.historical?.map((item) => ({
        label: item.tanggal,
        value: Number(item.stok_akhir),
    })) || [];
    const predictedChart = forecast?.predictions?.map((item) => ({
        label: item.date,
        value: Number(item.value),
    })) || [];

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

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Tanggal Awal Data</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">Tanggal Akhir Data</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="forecast_until">Prediksi Sampai Tanggal</Label>
                                    <Input
                                        id="forecast_until"
                                        type="date"
                                        value={data.forecast_until}
                                        onChange={(e) => setData('forecast_until', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="periods">Periode Prediksi (hari)</Label>
                                    <Input
                                        id="periods"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={data.periods}
                                        onChange={(e) => setData('periods', e.target.value)}
                                    />
                                    <InputError message={errors.periods} />
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
                                        <div className="grid gap-4 md:grid-cols-5">
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">MAPE</p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.mape != null ? `${forecast.metrics.mape.toFixed(2)}%` : '-'}
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
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">AIC</p>
                                                <p className="text-2xl font-bold">{forecast.metrics.aic?.toFixed(2)}</p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">BIC</p>
                                                <p className="text-2xl font-bold">{forecast.metrics.bic?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {actualChart.length > 0 && predictedChart.length > 0 && (
                                        <div className="rounded-md border p-4">
                                            <div className="mb-2 flex gap-4 text-sm">
                                                <span className="font-medium text-blue-600">Aktual</span>
                                                <span className="font-medium text-green-600">Prediksi</span>
                                            </div>
                                            <MiniLineChart actual={actualChart.slice(-30)} predicted={predictedChart} />
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
