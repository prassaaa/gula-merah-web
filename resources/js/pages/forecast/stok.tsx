import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    type Barang,
    type BreadcrumbItem,
    type ForecastResult,
    type Stok,
} from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
    barangs: Barang[];
    stoks: Stok[];
    forecast?: ForecastResult;
    filters?: {
        barang_id?: string;
        start_date?: string;
        end_date?: string;
        weeks?: string;
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
    const labels = points.map((point) => point.label);
    const width = 720;
    const height = 260;
    const padding = 28;
    const min = Math.min(...points.map((point) => point.value), 0);
    const max = Math.max(...points.map((point) => point.value), 1);
    const scaleX = (index: number) =>
        padding +
        (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const scaleY = (value: number) =>
        height -
        padding -
        ((value - min) / Math.max(max - min, 1)) * (height - padding * 2);
    const toPath = (series: Array<{ value: number }>, offset = 0) =>
        series
            .map(
                (point, index) =>
                    `${index === 0 ? 'M' : 'L'} ${scaleX(index + offset)} ${scaleY(point.value)}`,
            )
            .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
            <line
                x1={padding}
                y1={height - padding}
                x2={width - padding}
                y2={height - padding}
                className="stroke-muted-foreground/30"
            />
            <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={height - padding}
                className="stroke-muted-foreground/30"
            />
            <path
                d={toPath(actual)}
                fill="none"
                className="stroke-blue-600"
                strokeWidth="3"
            />
            <path
                d={toPath(predicted, actual.length)}
                fill="none"
                className="stroke-green-600"
                strokeWidth="3"
                strokeDasharray="6 4"
            />
            {actual.map((point, index) => (
                <circle
                    key={`actual-${point.label}`}
                    cx={scaleX(index)}
                    cy={scaleY(point.value)}
                    r="3"
                    className="fill-blue-600"
                />
            ))}
            {predicted.map((point, index) => (
                <circle
                    key={`pred-${point.label}`}
                    cx={scaleX(index + actual.length)}
                    cy={scaleY(point.value)}
                    r="3"
                    className="fill-green-600"
                />
            ))}
            {points.map((point, index) => (
                <text
                    key={`label-${point.label}-${index}`}
                    x={scaleX(index)}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                >
                    {labels[index]}
                </text>
            ))}
        </svg>
    );
}

export default function ForecastStok({
    barangs,
    stoks,
    forecast,
    filters,
}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        barang_id: filters?.barang_id || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        weeks: filters?.weeks || '4',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        post('/forecast/stok/predict', {
            onFinish: () => setIsLoading(false),
        });
    };

    const weeklySummary = forecast?.weekly_summary || [];
    const actualChart =
        forecast?.historical?.map((item) => ({
            label: item.week,
            value: Number(item.stok_akhir),
        })) || [];
    const predictedChart =
        forecast?.predictions?.map((item) => ({
            label: item.week,
            value: Number(item.value),
        })) || [];
    const latestActualStock = forecast?.historical?.at(-1)?.stok_akhir;
    const highestPredictedStock =
        predictedChart.length > 0
            ? Math.max(...predictedChart.map((item) => item.value))
            : undefined;
    const lastPredictedStock = predictedChart.at(-1)?.value;
    const needsRestock = weeklySummary.some(
        (item) => item.status === 'perlu_restock',
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prediksi Stok (ARIMA)" />

            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Prediksi Stok dengan ARIMA
                    </h1>
                    <p className="text-muted-foreground">
                        Prediksi stok menggunakan metode ARIMA (AutoRegressive
                        Integrated Moving Average)
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
                                        onValueChange={(value) =>
                                            setData('barang_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih barang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barangs.map((barang) => (
                                                <SelectItem
                                                    key={barang.id}
                                                    value={barang.id.toString()}
                                                >
                                                    {barang.nama_barang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">
                                            Tanggal Awal Data
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">
                                            Tanggal Akhir Data
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weeks">
                                        Jumlah Minggu Prediksi
                                    </Label>
                                    <Input
                                        id="weeks"
                                        type="number"
                                        min="1"
                                        max="52"
                                        value={data.weeks}
                                        onChange={(e) =>
                                            setData('weeks', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.weeks} />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing || isLoading}
                                >
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
                                    <TrendingUp className="mb-4 h-12 w-12" />
                                    <p>
                                        Pilih barang dan klik "Prediksi Stok"
                                        untuk melihat hasil
                                    </p>
                                </div>
                            ) : forecast.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {forecast.error}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Stok Aktual Terakhir
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {latestActualStock != null
                                                    ? `${Math.round(latestActualStock)} kg`
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Prediksi Tertinggi / Terakhir
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {highestPredictedStock != null
                                                    ? Math.round(
                                                          highestPredictedStock,
                                                      )
                                                    : '-'}{' '}
                                                /{' '}
                                                {lastPredictedStock != null
                                                    ? `${Math.round(lastPredictedStock)} kg`
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Status Keseluruhan
                                            </p>
                                            <p
                                                className={
                                                    needsRestock
                                                        ? 'text-2xl font-bold text-destructive'
                                                        : 'text-2xl font-bold text-green-600'
                                                }
                                            >
                                                {needsRestock
                                                    ? 'PERLU RESTOCK'
                                                    : 'AMAN'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-md border">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="p-3 text-left">
                                                        Minggu
                                                    </th>
                                                    <th className="p-3 text-left">
                                                        Periode
                                                    </th>
                                                    <th className="p-3 text-right">
                                                        Data Aktual
                                                    </th>
                                                    <th className="p-3 text-right">
                                                        Data Prediksi
                                                    </th>
                                                    <th className="p-3 text-left">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {weeklySummary.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            className="p-8 text-center text-muted-foreground"
                                                        >
                                                            Belum ada ringkasan
                                                            mingguan
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    weeklySummary.map(
                                                        (item) => (
                                                            <tr
                                                                key={item.week}
                                                                className="border-b"
                                                            >
                                                                <td className="p-3 font-medium">
                                                                    Minggu{' '}
                                                                    {item.week}
                                                                </td>
                                                                <td className="p-3 text-muted-foreground">
                                                                    {
                                                                        item.week_start
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        item.week_end
                                                                    }
                                                                </td>
                                                                <td className="p-3 text-right">
                                                                    {item.actual !=
                                                                    null
                                                                        ? `${Math.round(item.actual)} kg`
                                                                        : '-'}
                                                                </td>
                                                                <td className="p-3 text-right font-medium">
                                                                    {Math.round(
                                                                        item.predicted,
                                                                    )}{' '}
                                                                    kg
                                                                </td>
                                                                <td className="p-3">
                                                                    <div
                                                                        className={
                                                                            item.status ===
                                                                            'perlu_restock'
                                                                                ? 'font-medium text-destructive'
                                                                                : 'font-medium text-green-600'
                                                                        }
                                                                    >
                                                                        {
                                                                            item.status_label
                                                                        }
                                                                    </div>
                                                                    {item.status ===
                                                                        'perlu_restock' &&
                                                                        item.difference !=
                                                                            null && (
                                                                            <div className="text-sm text-muted-foreground">
                                                                                Kurang{' '}
                                                                                {Math.abs(
                                                                                    Math.round(
                                                                                        item.difference,
                                                                                    ),
                                                                                )}{' '}
                                                                                kg
                                                                            </div>
                                                                        )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {forecast.metrics && (
                                        <div className="grid gap-4 md:grid-cols-5">
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    MAPE
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.mape !=
                                                    null
                                                        ? `${forecast.metrics.mape.toFixed(2)}%`
                                                        : '-'}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    RMSE
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.rmse?.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    MAE
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.mae?.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    AIC
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.aic?.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    BIC
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {forecast.metrics.bic?.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {actualChart.length > 0 &&
                                        predictedChart.length > 0 && (
                                            <div className="rounded-md border p-4">
                                                <div className="mb-2 flex gap-4 text-sm">
                                                    <span className="font-medium text-blue-600">
                                                        Aktual
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        Prediksi
                                                    </span>
                                                </div>
                                                <MiniLineChart
                                                    actual={actualChart.slice(
                                                        -30,
                                                    )}
                                                    predicted={predictedChart}
                                                />
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
                        <div className="max-h-96 overflow-auto rounded-md border">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-background">
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left">
                                            Tanggal
                                        </th>
                                        <th className="p-3 text-left">
                                            Barang
                                        </th>
                                        <th className="p-3 text-right">
                                            Stok Akhir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stoks.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                Belum ada data stok
                                            </td>
                                        </tr>
                                    ) : (
                                        stoks.map((stok) => (
                                            <tr
                                                key={stok.id}
                                                className="border-b"
                                            >
                                                <td className="p-3">
                                                    {stok.tanggal}
                                                </td>
                                                <td className="p-3">
                                                    {stok.barang?.nama_barang}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {stok.stok_akhir}
                                                </td>
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
