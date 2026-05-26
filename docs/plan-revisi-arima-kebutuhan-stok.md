# Plan Revisi ARIMA: Prediksi Kebutuhan Stok

## Ringkasan
Revisi ini mengubah target ARIMA dari `stok_akhir` menjadi kebutuhan stok mingguan berdasarkan total `jumlah_kg` dari tabel `penjualans`. Data stok tetap dipakai sebagai pembanding ketersediaan terakhir, bukan sebagai variabel utama yang diprediksi.

## Perubahan Utama
- Forecast stok memakai agregasi penjualan mingguan: `SUM(penjualans.jumlah_kg)` per barang.
- Payload Python berubah dari `{ tanggal, stok_akhir }` menjadi `{ tanggal, jumlah_terjual }`.
- ARIMA menghitung akurasi dengan chronological train-test split 80/20, bukan fitted values in-sample.
- UI memakai label "Prediksi Kebutuhan Stok" agar tidak mengklaim ARIMA memprediksi stok akhir gudang.
- Status restock dihitung dari stok aktual terakhir dikurangi total kebutuhan prediksi.

## Alur Data Baru
1. Admin memilih barang, rentang data, dan jumlah minggu prediksi.
2. Laravel mengambil transaksi `penjualans` sesuai barang dan rentang tanggal.
3. Laravel mengelompokkan transaksi per minggu dan menjumlahkan `jumlah_kg`.
4. Python melatih ARIMA dari deret `jumlah_terjual`.
5. Python mengevaluasi 20% data terakhir, lalu fit ulang dengan seluruh data historis.
6. Laravel membandingkan hasil prediksi kebutuhan dengan stok aktual terakhir dari tabel `stoks`.

## Catatan Validasi
- Minimum data tetap 10 minggu.
- Minggu tanpa penjualan dalam rentang data dihitung sebagai 0 kg agar deret mingguan tetap kontinyu.
- Restock manual di tabel `stoks` tidak masuk model ARIMA.
- `config/database.php` tidak disentuh.
