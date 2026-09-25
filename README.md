# Hadish Cake — Frontend

Antarmuka web untuk booking system toko kue Hadish Cake. Dibuat dengan
**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4**.

### Deploy
https://crack-fe-rizki0809.vercel.app/

---

## Cara menjalankan

### Prasyarat

**Backend harus jalan lebih dulu.** Tanpa itu, halaman akan terbuka tapi
seluruh datanya gagal dimuat. Ikuti README backend sampai `npm run start:dev`
berhasil, lalu kembali ke sini.

Node.js minimal **20.9**, sesuai syarat Next.js 16.

### Langkah

```bash
npm install

# Salin contoh konfigurasi, lalu sesuaikan kalau alamat backendmu berbeda
cp .env.example .env.local

npm run dev          # buka http://localhost:3000
```

### Daftar perintah

| Perintah        | Fungsi                                        |
| --------------- | --------------------------------------------- |
| `npm run dev`    | Server pengembangan dengan hot reload         |
| `npm run build`  | Build produksi                                |
| `npm start`      | Menjalankan hasil build                       |
| `npm run lint`   | Memeriksa kode dengan ESLint                  |
| `npx tsc --noEmit` | Memeriksa tipe tanpa menghasilkan berkas    |

### Environment variable

| Variable              | Contoh                            | Keterangan                          |
| --------------------- | --------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api`       | Alamat backend, **termasuk `/api`** |

Awalan `NEXT_PUBLIC_` berarti nilainya ikut terkirim ke browser. Itu memang
disengaja di sini — browser yang memanggil API secara langsung. Jangan pernah
menaruh rahasia apa pun di variabel berawalan itu.

### Akun untuk mencoba

Tersedia setelah backend di-seed (`npm run db:seed` di folder backend):

| Role     | Email                  | Password       |
| -------- | ---------------------- | -------------- |
| ADMIN    | `admin@hadishcake.com` | `Admin123!`    |
| CUSTOMER | `siti@example.com`     | `Customer123!` |

---

## Struktur folder

```
app/
├─ layout.tsx              Kerangka halaman + AuthProvider
├─ page.tsx                Beranda
├─ error.tsx               Penangkap error seluruh aplikasi
├─ not-found.tsx           Halaman 404
├─ home-catalog.tsx        Bagian beranda yang datanya dari API
│
├─ about/ help/            Halaman statis
├─ login/ register/        Autentikasi
├─ products/               Katalog menu
├─ cart/                   Keranjang + checkout
├─ orders/                 Riwayat pesanan customer
├─ account/                Data akun + ganti password
├─ admin/                  Dashboard pesanan
│  └─ menu/                Kelola menu
│
├─ components/             Komponen tampilan yang dipakai berulang
└─ lib/                    Logika non-tampilan

proxy.ts                   Penjaga route (dulu bernama middleware.ts)
```

### Pola satu halaman = dua berkas

Sebagian besar halaman dipecah jadi dua:

- **`page.tsx`** — Server Component. Berisi `metadata` untuk SEO dan kerangka
  halaman.
- **`*-client.tsx`** — Client Component. Berisi yang butuh interaksi: state,
  pengambilan data, dan penanganan error.

Pemisahan ini membuat judul dan deskripsi halaman tetap terbaca mesin pencari,
sementara bagian yang butuh JavaScript tetap bisa memakai hook.

### Isi `app/lib/`

| Berkas                | Tanggung jawab                                              |
| --------------------- | ----------------------------------------------------------- |
| `api.ts`              | Satu pembungkus `fetch`; semua kegagalan jadi `ApiError`     |
| `auth-context.tsx`    | Sesi login: siapa yang masuk, login, logout                  |
| `session.ts`          | Baca-tulis cookie sesi dan membaca isi token JWT             |
| `cart.ts`             | Isi keranjang, disimpan di browser                           |
| `use-api-resource.ts` | Hook pengambilan data beserta status loading dan error       |
| `format.ts`           | Format harga dan tanggal                                     |
| `tones.ts`            | Daftar warna kartu menu yang diizinkan                       |
| `types.ts`            | Bentuk data yang dikirim backend                             |

---

## Halaman dan hak akses

| Halaman        | Akses              | Isi                                         |
| -------------- | ------------------ | ------------------------------------------- |
| `/`            | publik             | Beranda, kategori, menu favorit             |
| `/products`    | publik             | Katalog menu, bisa difilter                 |
| `/about`       | publik             | Profil toko                                 |
| `/help`        | publik             | Cara pesan, status pesanan, FAQ             |
| `/cart`        | publik             | Keranjang; memesan baru butuh login         |
| `/login`       | hanya belum login  | Masuk                                       |
| `/register`    | hanya belum login  | Daftar sebagai customer                     |
| `/orders`      | wajib login        | Riwayat pesanan, ganti tanggal, batalkan    |
| `/account`     | wajib login        | Data akun, ganti password                   |
| `/admin`       | **admin**          | Semua pesanan, ubah status                  |
| `/admin/menu`  | **admin**          | Tambah, ubah, sembunyikan, hapus menu       |

Keranjang sengaja dibuka untuk umum: pengunjung boleh memilih kue dulu, dan
baru diminta masuk saat menekan tombol pesan. Isi keranjangnya tetap tersimpan.

---

## Autentikasi

### Alurnya

1. `POST /auth/login` atau `/auth/register` mengembalikan `accessToken` (JWT).
2. Token disimpan di **cookie** bernama `hadish_session`.
3. Setiap request berikutnya membawa header `Authorization: Bearer <token>`.

### Kenapa cookie, bukan localStorage

Supaya `proxy.ts` — yang berjalan di server sebelum halaman dirender — bisa
ikut membacanya. Dengan localStorage, pemblokiran halaman baru bisa dilakukan
setelah JavaScript termuat, sehingga isi halaman terlarang sempat berkedip
tampil.

Cookie ini **bukan httpOnly**, karena token yang sama juga dibutuhkan kode di
browser untuk mengisi header `Authorization`. Risikonya setara localStorage:
kalau ada celah XSS, token bisa terbaca.

### Dua lapis penjagaan

| Lapisan | Berkas | Sifat |
| ------- | ------ | ----- |
| `proxy.ts` | Root project | **Optimistis.** Membaca cookie, tidak memverifikasi tanda tangannya. Tugasnya mengalihkan halaman, bukan mengamankan data. |
| Backend | NestJS | **Sebenarnya.** Memverifikasi setiap token pada setiap request. |

Artinya: memalsukan cookie di browser memang bisa membuka tampilan halaman
admin, **tapi semua datanya gagal dimuat** karena backend menolak tokennya.
Ini sudah diuji.

### Yang ditangani `auth-context.tsx`

- Memulihkan sesi saat halaman pertama dibuka, lalu memastikannya ke `/auth/me`
- Logout otomatis tepat saat token kedaluwarsa
- Jawaban `401` dari endpoint mana pun mengakhiri sesi dan mengarahkan ke login
- Kalau backend tidak bisa dihubungi saat pemulihan sesi, pengguna **tidak**
  dipaksa login ulang — sesinya dipertahankan dari isi token

Pakai lewat hook:

```tsx
const { user, status, isAdmin, login, logout, request } = useAuth();
```

`status` bernilai `"loading" | "authenticated" | "unauthenticated"`. Nilai
`loading` perlu dibedakan agar tampilan tidak berkedip "belum login" sesaat
sebelum berubah jadi sudah login.

---

## Mengambil data dari API

### `apiFetch` dan `ApiError`

Semua kegagalan diseragamkan jadi satu bentuk, sehingga komponen cukup
menangani satu jenis error:

```ts
try {
  await apiFetch("/products");
} catch (error) {
  if (error instanceof ApiError) {
    error.messages;        // selalu array, siap ditampilkan
    error.isUnauthorized;  // 401
    error.isForbidden;     // 403
    error.isNetworkError;  // tidak sampai ke server
  }
}
```

Batas waktunya 30 detik. Ini disengaja: hosting gratis menidurkan server saat
lama tidak dipakai, dan request pertama butuh beberapa detik untuk
membangunkannya.

### Dua hook

```tsx
// Endpoint publik — tidak mengirim token
const products = usePublicResource<Paginated<Product>>("/products?limit=50");

// Endpoint yang butuh login — token dan penanganan 401 sudah diurus
const orders = useApiResource<Paginated<Order>>("/orders", {
  enabled: status === "authenticated",
});
```

Keduanya mengembalikan:

| Nilai            | Arti                                                        |
| ---------------- | ----------------------------------------------------------- |
| `data`           | Hasilnya, atau `null`                                        |
| `error`          | `ApiError`, atau `null`                                      |
| `initialLoading` | Memuat pertama kali, belum ada data sama sekali              |
| `refreshing`     | Memuat ulang, data lama masih ditampilkan                    |
| `reload()`       | Ambil ulang, dipakai tombol "Coba lagi"                      |

`initialLoading` dan `refreshing` dipisah supaya layar tidak berkedip kosong
setiap kali daftar disegarkan — misalnya setelah admin mengubah status pesanan.

Opsi `enabled` menahan request selama sesi belum diketahui, agar tidak terkirim
tanpa token lalu gagal 401.

---

## Keranjang

Isi keranjang disimpan di `localStorage`, jadi tetap ada setelah tab ditutup
dan setelah pengguna login.

Yang dikirim saat memesan **hanya `productId` dan `quantity`**. Harga dan total
dihitung ulang oleh backend dari database, sehingga tidak bisa dimanipulasi
dari browser. Karena itu angka di keranjang ditulis sebagai *perkiraan total*.

Keranjang juga membandingkan dirinya dengan katalog terbaru setiap kali
halamannya dibuka:

- menu yang sudah dihapus atau disembunyikan **ditandai**, dan tombol pesan
  dikunci sampai item itu dibuang;
- harga yang berubah **ikut disegarkan**, lengkap dengan penanda kecil.

Secara teknis, keranjang memakai `useSyncExternalStore`, bukan
`useState` + `useEffect`. Alasannya: `localStorage` baru bisa dibaca di
browser, sedangkan halaman ini juga dirender di server. Bonusnya, keranjang
ikut tersinkron antar-tab lewat event `storage`.

---

## Loading, error, dan kasus tepi

| Situasi | Perlakuan |
| ------- | --------- |
| Memuat pertama kali | Skeleton yang bentuknya menyerupai kontennya, supaya tata letak tidak melompat |
| Mengirim formulir | Tombol jadi spinner dan dinonaktifkan; pengiriman ganda dicegah |
| Gagal memuat | `<Alert>` dengan pesan dari backend + tombol "Coba lagi" |
| Data kosong | Ajakan bertindak, bukan halaman kosong |
| Sesi kedaluwarsa | Logout otomatis, diarahkan ke `/login?reason=expired` |
| Backend tidak terjangkau | Pesan yang membedakan "server lambat" dari "tidak ada koneksi" |
| Error tak tertangani | `app/error.tsx` menampilkan halaman rapi, bukan layar putih |
| Alamat salah | `app/not-found.tsx` |

Error validasi dari backend datang sebagai array, dan `<Alert>` menampilkannya
sekaligus — jadi pengguna tidak memperbaiki satu per satu.

---

## Komponen tampilan

Semua di `app/components/`:

| Komponen             | Kegunaan                                                |
| -------------------- | ------------------------------------------------------- |
| `button.tsx`         | Tombol; `buttonStyles()` membuat `<Link>` tampil serupa  |
| `card.tsx`           | Kotak konten dengan judul dan bagian bawah opsional      |
| `input.tsx`          | Field beserta label, petunjuk, dan pesan error           |
| `alert.tsx`          | Pesan error / sukses / info, bisa dengan tombol ulang    |
| `spinner.tsx`        | `Spinner` dan `Skeleton`                                 |
| `product-card.tsx`   | Kartu menu + tombol tambah ke keranjang                  |
| `order-status-badge.tsx` | Label status pesanan beserta warnanya                |
| `navbar.tsx`         | Navigasi, menyesuaikan status login dan role             |
| `footer.tsx`         | Footer                                                   |

### Warna

Palet didefinisikan sebagai token Tailwind di `app/globals.css`:

```
strawberry   merah muda, warna utama merek
cream        latar dan garis
butter       aksen kuning
pistachio    aksen hijau
blueberry    aksen ungu
cocoa        warna teks
```

**Warna kartu menu tersimpan di database** sebagai nama kelas Tailwind
(misalnya `bg-butter-100`). Ini menimbulkan satu jebakan: Tailwind hanya
membuat kelas yang **ia temukan di kode sumber**, sehingga nama kelas yang
hanya ada di database tidak akan menghasilkan warna apa pun.

Karena itu pilihannya dikunci di `app/lib/tones.ts` — daftar itu sekaligus yang
membuat kelas-kelasnya ikut ter-generate. Menambah warna baru harus lewat
berkas itu, bukan dengan mengetik nama kelas bebas di form admin.


