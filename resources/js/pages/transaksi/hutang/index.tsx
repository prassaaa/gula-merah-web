import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type Hutang, type HutangSummary, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2, Search, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
    hutangs: PaginatedData<Hutang>;
    summary: HutangSummary;
    filters: {
        search?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Hutang', href: '/hutang' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function HutangIndex({ hutangs, summary, filters }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data hutang ini?')) {
            router.delete(`/hutang/${id}`);
        }
    };

    const handleSearch = (value: string) => {
        router.get('/hutang', { ...filters, search: value }, { preserveState: true, replace: true });
    };

    const handleFilterStatus = (value: string) => {
        router.get('/hutang', { ...filters, status: value === 'all' ? '' : value }, { preserveState: true, replace: true });
    };

    const handleFilterDate = (field: 'from_date' | 'to_date', value: string) => {
        router.get('/hutang', { ...filters, [field]: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hutang" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Hutang</h1>
                        <p className="text-muted-foreground">
                            Kelola data hutang pelanggan
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/hutang/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Hutang
                        </Link>
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_hutang)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Belum Lunas</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{summary.total_belum_lunas}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(summary.nilai_belum_lunas)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lunas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{summary.total_lunas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_belum_lunas + summary.total_lunas}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari faktur, pelanggan..."
                            className="pl-9"
                            defaultValue={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <Select value={filters.status || 'all'} onValueChange={handleFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                            <SelectItem value="lunas">Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        className="w-[150px]"
                        value={filters.from_date || ''}
                        onChange={(e) => handleFilterDate('from_date', e.target.value)}
                        placeholder="Dari tanggal"
                    />
                    <Input
                        type="date"
                        className="w-[150px]"
                        value={filters.to_date || ''}
                        onChange={(e) => handleFilterDate('to_date', e.target.value)}
                        placeholder="Sampai tanggal"
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Faktur</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead className="text-right">Nilai Faktur</TableHead>
                                <TableHead className="text-right">DP Bayar</TableHead>
                                <TableHead className="text-right">Sisa Hutang</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hutangs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        Belum ada data hutang
                                    </TableCell>
                                </TableRow>
                            ) : (
                                hutangs.data.map((hutang) => (
                                    <TableRow key={hutang.id}>
                                        <TableCell className="font-medium">
                                            {hutang.faktur_penjualan}
                                        </TableCell>
                                        <TableCell>{hutang.tanggal}</TableCell>
                                        <TableCell>{hutang.penjualan?.pelanggan || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(hutang.nilai_faktur)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(hutang.dp_bayar)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(hutang.sisa_hutang)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={hutang.status === 'lunas' ? 'default' : 'destructive'}>
                                                {hutang.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/hutang/${hutang.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/hutang/${hutang.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(hutang.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {hutangs.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {hutangs.meta.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
