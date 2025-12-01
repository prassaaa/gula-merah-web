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
import AppLayout from '@/layouts/app-layout';
import { type Distribusi, type BreadcrumbItem, type PaginatedData, type JenisKendaraan } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface Props {
    distribusis: PaginatedData<Distribusi>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Distribusi', href: '/distribusi' },
];

const jenisKendaraanLabels: Record<JenisKendaraan, string> = {
    pick_up: 'Pick Up',
    truk_sedang: 'Truk Sedang',
    truk_besar: 'Truk Besar',
};

export default function DistribusiIndex({ distribusis }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data distribusi ini?')) {
            router.delete(`/distribusi/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Distribusi" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Distribusi</h1>
                        <p className="text-muted-foreground">
                            Kelola data distribusi untuk prediksi biaya XGBoost
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/distribusi/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Distribusi
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Kendaraan</TableHead>
                                <TableHead className="text-right">Jarak</TableHead>
                                <TableHead className="text-right">Berat</TableHead>
                                <TableHead className="text-right">Biaya</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {distribusis.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Belum ada data distribusi
                                    </TableCell>
                                </TableRow>
                            ) : (
                                distribusis.data.map((distribusi) => (
                                    <TableRow key={distribusi.id}>
                                        <TableCell>{distribusi.tanggal}</TableCell>
                                        <TableCell>{distribusi.pelanggan?.nama}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {jenisKendaraanLabels[distribusi.jenis_kendaraan]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {distribusi.jarak_kirim_km} km
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {distribusi.jumlah_kg} kg
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {distribusi.total_biaya_formatted}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/distribusi/${distribusi.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/distribusi/${distribusi.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(distribusi.id)}
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

                {distribusis.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {distribusis.meta.links.map((link, index) => (
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

