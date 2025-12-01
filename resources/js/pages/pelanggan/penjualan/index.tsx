import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type Pelanggan, type Penjualan } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Props {
    penjualans: PaginatedData<Penjualan>;
    filters: {
        search?: string;
        dari_tanggal?: string;
        sampai_tanggal?: string;
    };
    statistics: {
        total_pembelian: number;
        total_nilai: number;
    };
    pelanggan: Pelanggan;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Pembelian', href: '/my/penjualan' },
];

export default function MyPenjualanIndex({ penjualans, filters, statistics, pelanggan }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [dariTanggal, setDariTanggal] = useState(filters?.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState(filters?.sampai_tanggal || '');

    // Handle both Laravel pagination formats (with meta or direct)
    const paginationData = penjualans?.meta || penjualans;
    const lastPage = paginationData?.last_page || 1;
    const links = paginationData?.links || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/my/penjualan', {
            search,
            dari_tanggal: dariTanggal,
            sampai_tanggal: sampaiTanggal,
        }, { preserveState: true });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pembelian" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembelian</h1>
                    <p className="text-muted-foreground">
                        Daftar pembelian Anda sebagai {pelanggan?.nama || '-'}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                            <ShoppingCart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_pembelian}</div>
                            <p className="text-muted-foreground text-xs">total pembelian</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Nilai Pembelian</CardTitle>
                            <ShoppingCart className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(statistics.total_nilai)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Cari barang..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Dari Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={dariTanggal}
                                        onChange={(e) => setDariTanggal(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Sampai Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={sampaiTanggal}
                                        onChange={(e) => setSampaiTanggal(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full">Cari</Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Faktur</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Barang</TableHead>
                                    <TableHead className="text-right">Jumlah (Kg)</TableHead>
                                    <TableHead className="text-right">Harga/Kg</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!penjualans?.data || penjualans.data.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center">
                                            <p className="text-muted-foreground">Tidak ada data pembelian</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    penjualans.data.map((penjualan) => (
                                        <TableRow key={penjualan.id}>
                                            <TableCell className="font-medium">{penjualan.no_faktur}</TableCell>
                                            <TableCell>{formatDate(penjualan.tanggal)}</TableCell>
                                            <TableCell>{penjualan.barang?.nama_barang || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {penjualan.jumlah_kg.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(penjualan.harga_per_kg)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(penjualan.total_penjualan)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex justify-center gap-2">
                        {links.map((link: { url: string | null; label: string; active: boolean }, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
