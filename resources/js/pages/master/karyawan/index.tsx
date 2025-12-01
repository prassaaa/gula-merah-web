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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type Karyawan, type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
    karyawans: PaginatedData<Karyawan>;
    jabatanList: string[];
    filters: {
        search?: string;
        status?: string;
        jabatan?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Karyawan', href: '/karyawan' },
];

export default function KaryawanIndex({ karyawans, jabatanList, filters }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
            router.delete(`/karyawan/${id}`);
        }
    };

    const handleToggleStatus = (id: number) => {
        router.patch(`/karyawan/${id}/toggle-status`);
    };

    const handleSearch = (value: string) => {
        router.get('/karyawan', { ...filters, search: value }, { preserveState: true, replace: true });
    };

    const handleFilterStatus = (value: string) => {
        router.get('/karyawan', { ...filters, status: value === 'all' ? '' : value }, { preserveState: true, replace: true });
    };

    const handleFilterJabatan = (value: string) => {
        router.get('/karyawan', { ...filters, jabatan: value === 'all' ? '' : value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Karyawan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Karyawan</h1>
                        <p className="text-muted-foreground">
                            Kelola data karyawan perusahaan
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/karyawan/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Karyawan
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama, jabatan, kontak..."
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
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.jabatan || 'all'} onValueChange={handleFilterJabatan}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jabatan</SelectItem>
                            {jabatanList.map((jabatan) => (
                                <SelectItem key={jabatan} value={jabatan}>
                                    {jabatan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Karyawan</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {karyawans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Belum ada data karyawan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                karyawans.data.map((karyawan) => (
                                    <TableRow key={karyawan.id}>
                                        <TableCell className="font-medium">
                                            {karyawan.nama_karyawan}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{karyawan.jabatan}</Badge>
                                        </TableCell>
                                        <TableCell>{karyawan.kontak || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {karyawan.alamat || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={karyawan.is_active ? 'default' : 'secondary'}>
                                                {karyawan.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleStatus(karyawan.id)}
                                                    title={karyawan.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    {karyawan.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/karyawan/${karyawan.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/karyawan/${karyawan.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(karyawan.id)}
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

                {karyawans.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {karyawans.meta.links.map((link, index) => (
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
