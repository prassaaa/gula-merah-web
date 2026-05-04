import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type Stok, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';

interface Props {
    stoks: PaginatedData<Stok>;
    latestStocks: Stok[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok', href: '/stok' },
];

export default function StokIndex({ stoks, latestStocks, filters }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data stok ini?')) {
            router.delete(`/stok/${id}`);
        }
    };

    const handleSearch = (value: string) => {
        router.get('/stok', { search: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Stok</h1>
                        <p className="text-muted-foreground">
                            Kelola data stok harian untuk prediksi ARIMA
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/stok/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Stok
                        </Link>
                    </Button>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        defaultValue={filters.search || ''}
                        className="pl-9"
                        placeholder="Cari nama gula atau kode barang..."
                        onChange={(event) => handleSearch(event.target.value)}
                    />
                </div>

                {latestStocks.length > 0 && (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {latestStocks.map((stok) => (
                            <Card key={stok.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">{stok.barang?.nama_barang}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tanggal</span>
                                        <span className="font-medium">{stok.tanggal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Stok Awal</span>
                                        <span>{stok.stok_awal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Stok Akhir</span>
                                        <span className="font-semibold">{stok.stok_akhir}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Barang</TableHead>
                                <TableHead className="text-right">Stok Awal</TableHead>
                                <TableHead className="text-right">Masuk</TableHead>
                                <TableHead className="text-right">Keluar</TableHead>
                                <TableHead className="text-right">Stok Akhir</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stoks.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Belum ada data stok
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stoks.data.map((stok) => (
                                    <TableRow key={stok.id}>
                                        <TableCell>{stok.tanggal}</TableCell>
                                        <TableCell>{stok.barang?.nama_barang}</TableCell>
                                        <TableCell className="text-right">{stok.stok_awal}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                            +{stok.masuk}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            -{stok.keluar}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {stok.stok_akhir}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/stok/${stok.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/stok/${stok.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(stok.id)}
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

                {stoks.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {stoks.meta.links.map((link, index) => (
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
