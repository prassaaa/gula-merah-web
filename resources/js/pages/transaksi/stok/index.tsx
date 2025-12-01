import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Stok, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface Props {
    stoks: PaginatedData<Stok>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok', href: '/stok' },
];

export default function StokIndex({ stoks }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data stok ini?')) {
            router.delete(`/stok/${id}`);
        }
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

