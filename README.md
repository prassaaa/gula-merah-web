# Gula Merah - Sistem Manajemen Penjualan & Prediksi

Aplikasi manajemen penjualan gula merah dengan fitur prediksi stok (ARIMA) dan prediksi biaya distribusi (XGBoost).

## Tech Stack

- **Backend**: Laravel 12 + PHP 8.3
- **Frontend**: React 19 + TypeScript + Inertia.js
- **AI/ML Service**: Python 3.10+ + FastAPI
- **Database**: MySQL/MariaDB

---

## 🚀 Instalasi

### 1. Clone & Setup Laravel

```bash
# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=gula_merah
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migration & seeder
php artisan migrate
php artisan db:seed
```

### 2. Setup Python AI Service

```bash
cd python

# Install dependencies
pip install -r requirements.txt --upgrade

# Copy environment file
cp .env.example .env
```

---

## ▶️ Menjalankan Aplikasi

### Terminal 1 - Laravel Backend
```bash
php artisan serve --port=8080
```

### Terminal 2 - Frontend (Development)
```bash
npm run dev
```

### Terminal 3 - Python AI Service
```bash
cd python
python run.py
```

**Akses Aplikasi:**
- Laravel: http://localhost:8080
- Python API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📋 Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| **Master Barang** | CRUD data produk gula merah |
| **Master Pelanggan** | CRUD data pelanggan dengan jarak |
| **Transaksi Stok** | Pencatatan stok harian |
| **Transaksi Penjualan** | Pencatatan penjualan |
| **Transaksi Distribusi** | Pencatatan pengiriman |
| **Prediksi Stok (ARIMA)** | Forecast stok 7 hari ke depan |
| **Prediksi Biaya (XGBoost)** | Estimasi biaya distribusi |

---

## 🔧 Konfigurasi

### Laravel (.env)
```env
PYTHON_API_URL=http://localhost:8000
```

### Python (python/.env)
```env
HOST=0.0.0.0
PORT=8000
DEBUG=true
LARAVEL_API_URL=http://localhost:8080/api
```

---

## 📁 Struktur Project

```
gula-merah-web/
├── app/                    # Laravel Backend
│   ├── Http/Controllers/   # Controllers
│   ├── Models/             # Eloquent Models
│   └── Services/           # PythonApiService
├── resources/js/           # React Frontend
│   ├── pages/              # Inertia Pages
│   └── components/         # UI Components
├── python/                 # Python AI Service
│   ├── app/
│   │   ├── routers/        # FastAPI Routes
│   │   ├── services/       # ARIMA & XGBoost
│   │   └── schemas/        # Pydantic Models
│   ├── requirements.txt
│   └── run.py
└── database/
    ├── migrations/
    └── seeders/
```

---

## 🧪 Testing API Python

```bash
# Health Check
curl http://localhost:8000/health

# ARIMA Info
curl http://localhost:8000/api/forecast/info

# XGBoost Info
curl http://localhost:8000/api/distribution/info
```

---

## 📝 Login Default

- **Email**: admin@example.com
- **Password**: password

---
