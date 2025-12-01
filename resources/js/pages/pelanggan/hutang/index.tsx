import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Hutang, type PaginatedData, type Pelanggan } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Eye, Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
    hutangs: PaginatedData<Hutang>;
    filters: {
        search?: string;
        status?: string;
    };
    statistics: {
        total_hutang: number;
        total_lunas: number;
    };
    pelanggan: Pelanggan;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Hutang Saya', href: '/my/hutang' },
];

export default function MyHutangIndex({ hutangs, filters, statistics, pelanggan }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    // Handle both Laravel pagination formats (with meta or direct)
    const paginationData = hutangs?.meta || hutangs;
    const lastPage = paginationData?.last_page || 1;
    const links = paginationData?.links || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/my/hutang', { search, status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/my/hutang', { search, status: value === 'all' ? '' : value }, { preserveState: true });
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
            <Head title="Hutang Saya" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hutang Saya</h1>
                    <p className="text-muted-foreground">
                        Daftar hutang Anda sebagai {pelanggan?.nama || '-'}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hutang Belum Lunas</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(statistics.total_hutang)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hutang Lunas</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.total_lunas}</div>
                            <p className="text-muted-foreground text-xs">transaksi sudah lunas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Cari barang atau keterangan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                                    <SelectItem value="lunas">Lunas</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Cari</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Barang</TableHead>
                                    <TableHead className="text-right">Nilai Hutang</TableHead>
                                    <TableHead className="text-right">Sudah Bayar</TableHead>
                                    <TableHead className="text-right">Sisa Hutang</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!hutangs?.data || hutangs.data.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center">
                                            <p className="text-muted-foreground">Tidak ada data hutang</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    hutangs.data.map((hutang) => (
                                        <TableRow key={hutang.id}>
                                            <TableCell>{formatDate(hutang.tanggal)}</TableCell>
                                            <TableCell>{hutang.penjualan?.barang?.nama_barang || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(hutang.nilai_faktur)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(hutang.dp_bayar)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-red-600">
                                                {formatCurrency(hutang.sisa_hutang)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={hutang.status === 'lunas' ? 'default' : 'destructive'}>
                                                    {hutang.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/my/hutang/${hutang.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
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
