# Aspirasi Rakyat Local

Prototype civic-tech lokal untuk mengirim, memetakan, dan menindaklanjuti aspirasi masyarakat. Aplikasi memakai React, Leaflet/OpenStreetMap, Express, Prisma, dan SQLite.

## Fitur

- Peta interaktif dengan pemilihan titik, GPS, dan empat pilihan layer.
- Pemilihan wilayah bertingkat hingga desa/kelurahan.
- Validasi format WhatsApp, masking nomor publik, dan CAPTCHA tiga menit.
- Daftar aspirasi publik dengan pencarian, filter, pagination, dan detail riwayat.
- Login admin, moderasi status, catatan tindak lanjut, dan penghapusan spam.
- Dashboard statistik, tren bulanan, kategori, status, dan prioritas wilayah.
- Data contoh Daerah Istimewa Yogyakarta di SQLite.

## Persyaratan

- Node.js 18.18 atau lebih baru.
- Koneksi internet untuk memuat tile peta.

## Instalasi

Dari direktori project jalankan:

```powershell
npm run setup
```

Konfigurasi lokal tersedia di `backend/.env`. Untuk konfigurasi lain, sesuaikan file tersebut dan `frontend/.env` berdasarkan file `.env.example` masing-masing.

## Menjalankan

Buka dua terminal dari direktori project.

Terminal backend:

```powershell
npm run dev:backend
```

Terminal frontend:

```powershell
npm run dev:frontend
```

Kemudian buka `http://localhost:5173`.

## Akun Admin

- Email: `admin@local.test`
- Password: `admin123`
- Halaman login: `http://localhost:5173/admin/login`

## Endpoint

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

Project ini dibuat untuk pembelajaran dan prototyping internal. Tidak ada logo, aset, atau database pihak lain yang digunakan.
