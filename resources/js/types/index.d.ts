import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// Business Entities
export interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    deskripsi: string | null;
    harga_per_kg: number;
    harga_per_kg_formatted: string;
    satuan: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Pelanggan {
    id: number;
    kode_pelanggan: string;
    nama: string;
    lokasi: string;
    alamat: string | null;
    telepon: string | null;
    email: string | null;
    jarak_km: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Stok {
    id: number;
    barang_id: number;
    barang?: Barang;
    tanggal: string;
    tanggal_formatted: string;
    stok_awal: number;
    masuk: number;
    keluar: number;
    stok_akhir: number;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export interface Penjualan {
    id: number;
    no_faktur: string;
    pelanggan_id: number;
    pelanggan?: Pelanggan;
    barang_id: number;
    barang?: Barang;
    tanggal: string;
    tanggal_formatted: string;
    jumlah_kg: number;
    harga_per_kg: number;
    harga_per_kg_formatted: string;
    total_penjualan: number;
    total_penjualan_formatted: string;
    hutang: number;
    hutang_formatted: string;
    pembayaran: number;
    pembayaran_formatted: string;
    sisa_hutang: number;
    sisa_hutang_formatted: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export type JenisKendaraan = 'pick_up' | 'truk_sedang' | 'truk_besar';

export interface Distribusi {
    id: number;
    faktur_distribusi: string;
    pelanggan_id: number;
    pelanggan?: Pelanggan;
    barang_id: number;
    barang?: Barang;
    tanggal: string;
    tanggal_formatted: string;
    jarak_kirim_km: number;
    jumlah_kg: number;
    jenis_kendaraan: JenisKendaraan;
    jenis_kendaraan_label: string;
    biaya_bahan_bakar: number;
    biaya_bahan_bakar_formatted: string;
    biaya_tenaga_kerja: number;
    biaya_tenaga_kerja_formatted: string;
    biaya_tambahan: number;
    biaya_tambahan_formatted: string;
    total_biaya_distribusi: number;
    total_biaya_formatted: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

// Pagination
export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

// Dashboard
export interface DashboardStats {
    totalBarang: number;
    totalPelanggan: number;
    totalPenjualanBulanIni: number;
    jumlahTransaksiBulanIni: number;
    totalDistribusiBulanIni: number;
    jumlahDistribusiBulanIni: number;
}

export interface RecentSale {
    id: number;
    no_faktur: string;
    pelanggan: string;
    barang: string;
    total: number;
    tanggal: string;
}

export interface MonthlySale {
    month: string;
    total: number;
}

export interface StockLevel {
    barang_id: number;
    nama_barang: string;
    stok_akhir: number;
}

export interface DistributionByVehicle {
    jenis_kendaraan: string;
    total: number;
    count: number;
}

// Forecast
export interface ForecastPrediction {
    date: string;
    value: number;
    lower_bound: number;
    upper_bound: number;
}

export interface ForecastMetrics {
    mape?: number;
    rmse?: number;
    mae?: number;
}

export interface ForecastResult {
    predictions?: ForecastPrediction[];
    metrics?: ForecastMetrics;
    error?: string;
}

export interface PredictionInput {
    jarak_kirim_km: number;
    jumlah_kg: number;
    jenis_kendaraan: string;
}

export interface CostBreakdown {
    biaya_bahan_bakar: number;
    biaya_tenaga_kerja: number;
    biaya_tambahan: number;
    total_biaya: number;
}

export interface PredictionResult {
    input_features?: PredictionInput;
    prediction?: CostBreakdown;
    confidence_score?: number;
    error?: string;
}
