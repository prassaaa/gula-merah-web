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
import { type Penjualan, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface Props {
    penjualans: PaginatedData<Penjualan>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Penjualan', href: '/penjualan' },
];

export default function PenjualanIndex({ penjualans }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penjualan ini?')) {
            router.delete(`/penjualan/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penjualan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Penjualan</h1>
                        <p className="text-muted-foreground">
                            Kelola data transaksi penjualan
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/penjualan/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Penjualan
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Faktur</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Barang</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {penjualans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Belum ada data penjualan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                penjualans.data.map((penjualan) => (
                                    <TableRow key={penjualan.id}>
                                        <TableCell className="font-medium">
                                            {penjualan.no_faktur}
                                        </TableCell>
                                        <TableCell>{penjualan.tanggal}</TableCell>
                                        <TableCell>{penjualan.pelanggan?.nama}</TableCell>
                                        <TableCell>{penjualan.barang?.nama_barang}</TableCell>
                                        <TableCell className="text-right">
                                            {penjualan.jumlah_kg} {penjualan.barang?.satuan}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {penjualan.total_penjualan_formatted}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/penjualan/${penjualan.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/penjualan/${penjualan.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(penjualan.id)}
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

                {penjualans.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {penjualans.meta.links.map((link, index) => (
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

