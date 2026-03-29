# Product Requirements Document (PRD) untuk Possum

## 1. Visi dan Misi

Possum adalah platform point of sales yang memungkinkan pengguna untuk mengelola toko mereka dengan lebih mudah. Visi kami adalah menjadi salah satu platform point of sales terbaik di Indonesia.

## 2. Fitur Utama

### 1. Home/Dashboard

* Grafik penjualan hari ini dengan timeframe per jam
* Grafik penjualan mingguan dengan timeframe per hari
* Forecast menggunakan regresi linear untuk prediksi penjualan di hari-hari dan jam selanjutnya

### 2. Produk

* List produk yang sudah ditambahkan ke dalam POS
* Pengatur stok tiap produk
* Fitur menambahkan produk baru dengan input:
 + Produk ID (rng)
 + Nama produk
 + Stok
 + Gambar opsional
 + Kategori produk (dinamis dan dapat dibuat oleh pengguna)
 + Harga produk

### 3. Sales/Penjualan

* List produk dengan tombol search produk
* Keranjang untuk konfirmasi transaksi pembelian customer
* Pengiriman notifikasi ke WhatsApp kepada pelanggan setelah melakukan pembelian

### 4. Profil

* Nama toko
* Logo toko
* Username yang digunakan (dinamis dan dapat diubah)
* Password toko (dinamis dan dapat diubah)
* ID toko (tidak bisa diubah)

## 3. Spesifikasi Teknis

### 1. Frontend

* React.js

### 2. Backend

* Node.js dengan Express.js sebagai framework RESTful API

### 3. Database

* PostgreSQL dengan libarary Sequelize.js untuk ORM

### 4. Offline mode

* Gunakan library seperti LocalForage atau PouchDB untuk menyimpan data offline

## 4. Integrasi

### 1. Pengiriman Notifikasi ke WhatsApp

* Menggunakan library seperti twilio atau nexmo.

### 2. Export Laporan Keuangan ke Google Drive

* Menggunakan library seperti google-api-python-client atau google-auth-library.

## 5. Testing dan Validasi

* Pastikan aplikasi Possum berjalan dengan lancar dalam kondisi online dan offline.
* Lakukan testing unit dan integritas untuk memastikan bahwa aplikasi Possum berfungsi dengan benar.