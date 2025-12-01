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
import { type Distribusi, type BreadcrumbItem, type JenisKendaraan, type PredictionResult } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { BarChart3, AlertCircle, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
    distribusis: Distribusi[];
    prediction?: PredictionResult;
    modelTrained?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prediksi Biaya Distribusi', href: '/forecast/distribusi' },
];

const jenisKendaraanOptions: { value: JenisKendaraan; label: string }[] = [
    { value: 'pick_up', label: 'Pick Up' },
    { value: 'truk_sedang', label: 'Truk Sedang' },
    { value: 'truk_besar', label: 'Truk Besar' },
];

export default function ForecastDistribusi({ distribusis, prediction, modelTrained }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isTraining, setIsTraining] = useState(false);

    const { data, setData, post, processing } = useForm({
        jarak_kirim_km: '',
        jumlah_kg: '',
        jenis_kendaraan: '' as JenisKendaraan | '',
    });

    const handlePredict = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        post('/forecast/distribusi/predict', {
            onFinish: () => setIsLoading(false),
        });
    };

    const handleTrain = () => {
        setIsTraining(true);
        post('/forecast/distribusi/train', {
            onFinish: () => setIsTraining(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prediksi Biaya Distribusi" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Prediksi Biaya Distribusi dengan XGBoost</h1>
                        <p className="text-muted-foreground">
                            Prediksi biaya distribusi menggunakan metode XGBoost Machine Learning
                        </p>
                    </div>
                    <Button onClick={handleTrain} disabled={isTraining} variant="outline">
                        {isTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Zap className="mr-2 h-4 w-4" />
                        Train Model
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Parameter Prediksi</CardTitle>
                            <CardDescription>
                                Masukkan parameter untuk prediksi biaya
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePredict} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jarak_kirim_km">Jarak Kirim (km)</Label>
                                    <Input
                                        id="jarak_kirim_km"
                                        type="number"
                                        value={data.jarak_kirim_km}
                                        onChange={(e) => setData('jarak_kirim_km', e.target.value)}
                                        placeholder="Contoh: 50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_kg">Jumlah (kg)</Label>
                                    <Input
                                        id="jumlah_kg"
                                        type="number"
                                        value={data.jumlah_kg}
                                        onChange={(e) => setData('jumlah_kg', e.target.value)}
                                        placeholder="Contoh: 100"
                                    />
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
                                </div>

                                <Button type="submit" className="w-full" disabled={processing || isLoading}>
                                    {(processing || isLoading) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Prediksi Biaya
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Hasil Prediksi</CardTitle>
                            <CardDescription>
                                Estimasi biaya distribusi berdasarkan parameter
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!prediction ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mb-4" />
                                    <p>Masukkan parameter dan klik "Prediksi Biaya" untuk melihat hasil</p>
                                </div>
                            ) : prediction.error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{prediction.error}</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Estimasi Biaya Distribusi
                                        </p>
                                        <p className="text-4xl font-bold text-green-600">
                                            Rp {prediction.prediction?.total_biaya?.toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Jarak Kirim</p>
                                            <p className="text-xl font-bold">{prediction.input_features?.jarak_kirim_km} km</p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Jumlah</p>
                                            <p className="text-xl font-bold">{prediction.input_features?.jumlah_kg} kg</p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Kendaraan</p>
                                            <p className="text-xl font-bold capitalize">
                                                {prediction.input_features?.jenis_kendaraan?.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>

                                    {prediction.prediction && (
                                        <div>
                                            <h4 className="font-medium mb-2">Rincian Biaya</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                                                    <span className="text-sm">Biaya Bahan Bakar</span>
                                                    <span className="font-medium">Rp {prediction.prediction.biaya_bahan_bakar?.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                                                    <span className="text-sm">Biaya Tenaga Kerja</span>
                                                    <span className="font-medium">Rp {prediction.prediction.biaya_tenaga_kerja?.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                                                    <span className="text-sm">Biaya Tambahan</span>
                                                    <span className="font-medium">Rp {prediction.prediction.biaya_tambahan?.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {prediction.confidence_score !== undefined && (
                                        <div className="text-center text-sm text-muted-foreground">
                                            Confidence Score: {(prediction.confidence_score * 100).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Training</CardTitle>
                        <CardDescription>
                            Data distribusi yang digunakan untuk training model XGBoost
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border max-h-96 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-background">
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left">Tanggal</th>
                                        <th className="p-3 text-right">Jarak (km)</th>
                                        <th className="p-3 text-right">Jumlah (kg)</th>
                                        <th className="p-3 text-left">Kendaraan</th>
                                        <th className="p-3 text-right">Total Biaya</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {distribusis.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                Belum ada data distribusi
                                            </td>
                                        </tr>
                                    ) : (
                                        distribusis.map((dist) => (
                                            <tr key={dist.id} className="border-b">
                                                <td className="p-3">{dist.tanggal_formatted}</td>
                                                <td className="p-3 text-right">{dist.jarak_kirim_km}</td>
                                                <td className="p-3 text-right">{dist.jumlah_kg}</td>
                                                <td className="p-3">{dist.jenis_kendaraan_label}</td>
                                                <td className="p-3 text-right">{dist.total_biaya_formatted}</td>
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

