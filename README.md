# Asisten Gaple

Aplikasi web **Asisten Permainan Gaple** untuk mode 4 pemain (2 vs 2) dengan set domino 0–6. Berbasis Next.js + TypeScript + Tailwind CSS, berjalan sepenuhnya di browser (tanpa server backend).

## Fitur

### 🎯 Asisten Langkah
- **Input Manual**: pilih ubin di tangan via domino picker, isi ujung kiri/kanan papan.
- **Input Foto (semi-manual)**: upload foto ubin dari kamera/galeri, lalu koreksi pilihan ubin secara manual (foto dipakai sebagai referensi visual). *Deteksi otomatis belum tersedia — lihat bagian Keterbatasan.*
- **Saran langkah**: rekomendasi langkah terbaik + 2 alternatif, dengan alasan singkat.
- **Info pass/ketuk**: catat saat lawan pass pada angka tertentu → mesin meningkatkan skor langkah yang mengarah ke angka tersebut.

### 📋 Riwayat & Logging
- Buat match baru (nama, 4 pemain, 2 pasangan tim).
- Catat ronde: pemenang tim, poin, ujung papan akhir, catatan bebas.
- Selesaikan match → skor total dihitung otomatis.
- Export per match dalam format **JSON** atau **CSV**.
- Export semua match sekaligus.

### 📊 Analitik
- Ringkasan global: jumlah match & total ronde.
- Per match: winrate tim (bar visual), poin total, jumlah ronde menang.

### 🗄️ Storage
- Semua data disimpan lokal di browser via **IndexedDB** (library `idb`). Tidak ada server, tidak ada koneksi internet yang dibutuhkan.

---

## Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- npm ≥ 9

### Instalasi & Development

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Produksi

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Testing (Vitest)

```bash
npm test
# atau watch mode:
npm run test:watch
```

---

## Struktur Proyek

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Beranda
│   ├── asisten/page.tsx    # Halaman asisten langkah
│   ├── riwayat/
│   │   ├── page.tsx        # Daftar match
│   │   └── [id]/page.tsx   # Detail match + tambah ronde
│   └── analitik/page.tsx   # Halaman analitik
├── components/
│   ├── DominoPicker.tsx    # Komponen pilih ubin
│   ├── PipSelect.tsx       # Pilih angka 0-6 atau kosong
│   ├── RecommendationList.tsx  # Tampilkan rekomendasi langkah
│   └── Navbar.tsx          # Bottom navigation
├── engine/                 # Mesin rekomendasi (murni TypeScript)
│   ├── types.ts            # Tipe data: Tile, Move, GameContext, dll.
│   ├── domino.ts           # Utilitas domino (generate set, pip count, dll.)
│   ├── moves.ts            # Generator langkah legal
│   ├── scorer.ts           # Heuristik skor + ranking
│   └── index.ts            # Public API engine
├── lib/
│   ├── storage.ts          # IndexedDB via idb (match, round, analytics)
│   └── utils.ts            # Helper: generateId, formatDate, downloadFile
└── __tests__/              # Unit test Vitest
    ├── domino.test.ts
    ├── moves.test.ts
    └── scorer.test.ts
```

---

## Mesin Rekomendasi

Algoritma heuristik client-side di `src/engine/scorer.ts`:

| Komponen | Bobot | Deskripsi |
|---|---|---|
| **Kontrol ujung** | 3.0 | Prefer angka ujung yang banyak didukung ubin tersisa |
| **Buang pip tinggi** | 1.5 | Prefer membuang ubin berat untuk kurangi risiko |
| **Hindari buntu** | -4.0 | Penalti jika ujung baru tidak punya lanjutan di tangan maupun ubin tersisa |
| **Eksploitasi pass** | 5.0 | Bonus besar jika ujung baru = angka yang pernah di-pass lawan |
| **Balak** | 0.5 | Bonus kecil untuk memainkan double (balak) |

Modul ini didesain agar mudah diupgrade ke Monte Carlo / MCTS di masa depan.

---

## Keterbatasan Fitur Foto

Fitur **input foto ubin** saat ini bersifat **semi-manual**:

- Foto diupload hanya sebagai **referensi visual** di layar konfirmasi.
- **Tidak ada deteksi otomatis** (computer vision / OCR) — pengguna tetap harus memilih ubin secara manual.
- Alasan: deteksi dot domino dari foto memerlukan model CV (mis. YOLO atau segmentasi khusus) yang kompleks dan di luar cakupan MVP ini.
- Rencana ke depan: integrasikan model TensorFlow.js atau panggil API eksternal untuk deteksi dot.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB via [idb](https://github.com/jakearchibald/idb)
- **Testing**: Vitest
- **Linting**: ESLint (eslint-config-next)
