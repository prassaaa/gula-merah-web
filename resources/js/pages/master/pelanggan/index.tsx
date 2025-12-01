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
import { type Pelanggan, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface Props {
    pelanggans: PaginatedData<Pelanggan>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pelanggan', href: '/pelanggan' },
];

export default function PelangganIndex({ pelanggans }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
            router.delete(`/pelanggan/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelanggan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Pelanggan</h1>
                        <p className="text-muted-foreground">
                            Kelola data master pelanggan
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/pelanggan/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Pelanggan
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Jarak (km)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pelanggans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Belum ada data pelanggan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pelanggans.data.map((pelanggan) => (
                                    <TableRow key={pelanggan.id}>
                                        <TableCell className="font-medium">
                                            {pelanggan.kode_pelanggan}
                                        </TableCell>
                                        <TableCell>{pelanggan.nama}</TableCell>
                                        <TableCell>{pelanggan.lokasi}</TableCell>
                                        <TableCell>{pelanggan.jarak_km} km</TableCell>
                                        <TableCell>
                                            <Badge variant={pelanggan.is_active ? 'default' : 'secondary'}>
                                                {pelanggan.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/pelanggan/${pelanggan.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/pelanggan/${pelanggan.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(pelanggan.id)}
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

                {pelanggans.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {pelanggans.meta.links.map((link, index) => (
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

