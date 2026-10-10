# BABAYO

Portal pemesanan dan dashboard admin BABAYO dengan Supabase serta fallback Local Storage.

## Struktur Proyek

```text
BABAYO/
|-- index.html          # Halaman utama
|-- styles.css          # Seluruh stylesheet halaman
|-- src/                # JavaScript aplikasi
|   |-- main.js         # Inisialisasi dan interaksi UI
|   |-- data.js         # Data katalog awal dan utilitas format
|   `-- supabase.js     # Akses Supabase dan fallback Local Storage
|-- public/assets/      # Gambar dan aset statis yang disalin ke hasil build
|-- supabase/
|   `-- schema.sql      # Tabel, kebijakan RLS, dan konfigurasi Realtime
`-- .github/workflows/  # Build dan deploy GitHub Pages
```

## Menjalankan Lokal

```sh
npm install
npm run dev
```

## Build dan Deploy

Jalankan `npm run build` untuk menghasilkan situs di `dist/`. Workflow GitHub Actions akan membangun dan menerbitkan folder tersebut ke GitHub Pages.

## Database

Jalankan isi [`supabase/schema.sql`](supabase/schema.sql) melalui SQL Editor di dashboard Supabase. URL project dan anon key dapat diatur melalui menu Database Supabase di aplikasi atau environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

