# Possum Backend

Backend starter untuk aplikasi POS Possum berdasarkan PRD menggunakan Express.js, Sequelize, dan PostgreSQL.

## Fitur yang sudah disiapkan

- REST API untuk produk, kategori, penjualan, profil toko, dashboard, dan report
- Model Sequelize untuk domain inti POS
- Forecast penjualan sederhana menggunakan regresi linear
- Stub integrasi WhatsApp dan export Google Drive
- Error handling, validasi dasar, dan health check

## Menjalankan project

1. Install dependency:

```bash
npm install
```

2. Salin environment file:

```bash
copy .env.example .env
```

3. Pastikan PostgreSQL berjalan dan kredensial di `.env` sesuai.

4. Jalankan server:

```bash
npm run dev
```

Server akan aktif di `http://localhost:4000`.

## Frontend

Frontend React modern dengan tampilan glass-style tersedia di [frontend](C:\Users\sckanadee\Desktop\FS Possum\frontend).

1. Masuk ke folder frontend:

```bash
cd frontend
```

2. Install dependency:

```bash
npm install
```

3. Salin environment file:

```bash
copy .env.example .env
```

4. Jalankan frontend:

```bash
npm run dev
```

Frontend default akan berjalan di `http://localhost:5173` dan terhubung ke backend `http://localhost:4000/api`.

## Endpoint utama

- `GET /health`
- `GET /api/dashboard/today`
- `GET /api/dashboard/weekly`
- `GET /api/dashboard/forecast`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/products`
- `PUT /api/products/:productId`
- `PATCH /api/products/:productId/stock`
- `GET /api/sales`
- `GET /api/sales/:saleId`
- `POST /api/sales`
- `GET /api/profile`
- `PUT /api/profile`
- `PATCH /api/profile/password`
- `POST /api/reports/export/google-drive`
