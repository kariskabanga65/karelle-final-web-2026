# KARÉLLE — Modeling Course

Final Project Praktikum Pemrograman Web 2026 — Individual Project 4: Platform Kursus.

KARÉLLE adalah platform kursus modeling berbasis kelas dengan empat peran: **Admin**, **Teacher**, **Student**, dan **Guest**.

Kelas yang tersedia: **Runway Modeling**, **Posing & Photoshoot**, **Model Portfolio**, dan **Casting Preparation**.

> Dokumentasi lengkap (instalasi database, akun dummy, cara menjalankan).

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, JSX), Tailwind CSS 4, shadcn/ui, Lucide React, Tiptap (Rich Text Editor), qrcode (QR sertifikat) |
| Backend | Route Handlers, Server Components, Server Actions, Zod (validasi), sanitize-html (anti-XSS) |
| Database | PostgreSQL + Raw SQL (`pg`), tanpa ORM |
| Auth | Better Auth, bcryptjs, `src/middleware.js`, RBAC |

## Struktur Folder

```
src/
├── app/
│   ├── (public)/      Homepage, katalog, detail course, teacher, verifikasi sertifikat
│   ├── (auth)/        Login, register student/teacher, forgot password
│   ├── dashboard/     Redirect ke dashboard sesuai role
│   ├── profile/       Profil pengguna, edit profil, ganti password
│   ├── notifications/ Notifikasi semua role
│   ├── admin/         Modul Admin
│   ├── teacher/       Modul Teacher
│   ├── student/       Modul Student
│   └── api/           Route Handlers
├── components/        ui/, layout/, forms/, shared/, home/, course/, dashboard/,
│                      learning/, discussion/, notifications/, certificates/, student/
├── lib/               auth/, db/ (queries), validations/, utils/, learning/, certificates/
├── actions/           Server Actions
└── middleware.js
database/
├── schema.sql
└── seed.sql
```

## Desain

- Gaya editorial monokrom: hitam pekat, putih gading, aksen silver.
- Font **Bodoni Moda** (judul) dan **Jost** (teks), dipasang lewat npm (`@fontsource-variable/*`) sehingga tidak bergantung pada Google Fonts.
- Komponen dasar **shadcn/ui** ada di `src/components/ui`. Komponen baru bisa ditambah dengan `npx shadcn@latest add <nama>`.
- Token warna ada di `src/app/globals.css`.

### Foto

Foto ada di folder `public/images/` dan ditampilkan dalam hitam-putih sesuai tema. Untuk mengganti foto, timpa file dengan **nama yang sama**:

| File | Dipakai di |
|---|---|
| `hero-model.jpg` | Hero homepage, halaman login, galeri |
| `editorial-face.jpg` | Section "Why Choose KARÉLLE" |
| `categories/runway-catwalk.jpg` | Kartu & course kategori Runway & Catwalk |
| `categories/photoshoot-posing.jpg` | Kategori Photoshoot & Posing |
| `categories/model-portfolio.jpg` | Kategori Model Portfolio |
| `categories/casting-preparation.jpg` | Kategori Casting Preparation |

### Sumber gambar

Gambar dipakai untuk keperluan tugas kuliah (non-komersial). Hak cipta tetap milik pembuatnya.

| File | Sumber |
|---|---|
| `categories/model-portfolio.jpg` | Character reference sheet karya **@smarts.ai** |
| `gallery/*.jpg` (4 foto Gallery) | Pinterest — *(isi nama/akun pembuat foto di sini)*; dijadikan hitam-putih |
| `instructors/*.jpg` (foto instruktur) | Foto dari pemilik proyek / Pinterest — *(isi sumber di sini)*; dijadikan hitam-putih |
| Foto lainnya | *(isi sumber/pembuat foto di sini)* |

## Persyaratan

- Node.js 20.9 atau lebih baru
- PostgreSQL 18 atau lebih baru (disarankan memakai pgAdmin 4)

## Setup Database (pgAdmin)

1. Buka pgAdmin, lalu masuk ke server PostgreSQL Anda.
2. Klik kanan **Databases** → **Create** → **Database...**, isi nama `kar_class_db`, lalu **Save**.
3. Klik kanan `kar_class_db` → **Query Tool**.
4. Klik ikon **Open File**, pilih `database/schema.sql`, lalu tekan **Execute (F5)**.
5. Ulangi langkah 4 untuk `database/seed.sql`.
6. Untuk memeriksa hasilnya, jalankan `SELECT title, student_count FROM v_course_catalog;`. Seharusnya muncul 4 kelas.

> **Urutan wajib:** `schema.sql` lebih dulu, baru `seed.sql`.
> `seed.sql` aman dijalankan ulang (tidak membuat data ganda).
> `schema.sql` **menghapus semua data**. Gunakan untuk mereset database, lalu jalankan `seed.sql` lagi.

Alternatif lewat terminal:

```bash
createdb kar_class_db
psql -d kar_class_db -f database/schema.sql
psql -d kar_class_db -f database/seed.sql
```

## Akun Dummy

Semua password disimpan sebagai hash **bcrypt** di tabel `accounts`, tidak ada yang berupa plaintext.

| Role | Email | Password | Keterangan |
|---|---|---|---|
| Admin | admin@karelle.id | `Admin123!` | Akses penuh |
| Teacher | karis@karelle.id | `Teacher123!` | Runway Coach, mengajar **Runway Modeling** |
| Teacher | kesia@karelle.id | `Teacher123!` | Fotografer, mengajar **Posing & Photoshoot** dan **Model Portfolio** |
| Teacher | ivan@karelle.id | `Teacher123!` | Casting Director, mengajar **Casting Preparation**. Baru di-approve, menampilkan notifikasi Welcome Teacher (24 jam setelah seed dijalankan) |
| Student | rina@karelle.id | `Student123!` | Pengajuan Teacher **pending**, untuk demo Approve/Reject |
| Student | puti@karelle.id | `Student123!` | Runway Modeling 100%, sudah punya sertifikat `KRL-2026-A1B2C3D4E5` |
| Student | nadhifa@karelle.id | `Student123!` | Progress sebagian |
| Student | aisyah@karelle.id | `Student123!` | Pengajuan Teacher **ditolak** |

Login bisa memakai **email atau username**, misalnya `karis.kabanga` / `Teacher123!`.

Membuat hash bcrypt untuk password lain:

```bash
npm run hash-password -- "PasswordBaru123!"
```

## Environment Variable

```bash
cp .env.example .env.local
```

Isi `DATABASE_URL` dengan username dan password PostgreSQL Anda, misalnya `postgresql://postgres:passwordanda@localhost:5432/kar_class_db`.

## Autentikasi & Keamanan

| Lapisan | Lokasi | Tugas |
|---|---|---|
| 1. Middleware | `src/middleware.js` | Cek ada/tidaknya **cookie** session. Tanpa database. Guest diarahkan ke `/login`. |
| 2. Server | `src/lib/auth/session.js` → `requireRole()` | Validasi session ke database dan cek **role** di setiap halaman, Server Action, dan Route Handler. |
| 3. Database | Query dengan `WHERE teacher_id = $1` | Memastikan data yang diubah memang milik user tersebut. |

- **Better Auth** menangani register, login, logout, session, dan reset password (`/api/auth/*`).
- **bcryptjs** dipasang ke Better Auth sebagai fungsi hash/verify password (`src/lib/auth/password.js`).
- Role **tidak bisa** dikirim dari form register. Semua pendaftar menjadi `student`. Pendaftar Teacher mendapat pengajuan berstatus `pending`.
- Aturan ubah role oleh Admin (dicek di server): Admin tidak bisa menurunkan role akunnya sendiri, dan **Teacher yang masih memiliki course tidak bisa diubah role-nya** sebelum course-nya dipindahkan atau dihapus. Mengubah Student menjadi Teacher otomatis menyetujui pengajuan yang masih pending.
- Login dibatasi Better Auth (rate limit) untuk mencegah brute force.
- Isi materi dari Rich Text Editor **dibersihkan di server** (`src/lib/utils/sanitize.js`) sebelum disimpan: `<script>`, atribut `on*`, dan link `javascript:` dibuang untuk mencegah XSS.
- Server Action materi menerima `courseId` dari client, jadi kepemilikan course **dicek ulang di setiap aksi**. Request yang dimanipulasi ke course Teacher lain ditolak.
- Semua query memakai **parameter** (`$1`, `$2`, ...), tidak ada input pengguna yang digabung langsung ke SQL (anti SQL injection).
- `callbackUrl` setelah login divalidasi dengan parser URL (`getSafeRedirectPath`), sehingga tidak bisa diarahkan ke situs lain (anti open redirect).
- Cookie session bersifat `HttpOnly` dan `SameSite=Lax`, dan otomatis `Secure` saat aplikasi berjalan di HTTPS.
- **Security headers** di `next.config.mjs`: `X-Frame-Options: DENY` dan `frame-ancestors 'none'` (anti clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, serta header `X-Powered-By` dimatikan.

**Forgot Password:** proyek ini belum memakai layanan email, jadi tautan reset password ditampilkan di **terminal** tempat `npm run dev` berjalan. Salin tautan tersebut ke browser.

## Route Handlers (API)

Semua respons berformat JSON `{ success, ... }`. Input divalidasi dengan **Zod**, lalu status HTTP disesuaikan (400 input salah, 401 belum login, 403 role tidak sesuai, 404 tidak ditemukan, 413 file terlalu besar, 415 format tidak didukung).

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` / `POST` | `/api/auth/*` | Publik | Better Auth: login, register, session, reset password |
| `GET` | `/api/courses?search=&category=&page=&limit=` | Publik | Katalog course (limit maks. 50, category berupa slug) |
| `GET` | `/api/certificates/verify/[number]` | Publik | Verifikasi sertifikat, mis. `/api/certificates/verify/KRL-2026-A1B2C3D4E5` |
| `POST` | `/api/uploads` (multipart, field `file`) | Teacher & Admin | Upload thumbnail course: JPG/PNG/WEBP maks. 2 MB |
| `GET` | `/api/uploads/[file]` | Publik | Menyajikan thumbnail yang sudah diunggah |

Keamanan upload:
- Role dicek di server dengan `authorizeRequest()` (`src/lib/auth/api-guard.js`).
- Jenis file ditentukan dari **isi file** (magic bytes), bukan dari nama atau `Content-Type`. File `.png` palsu dan SVG ditolak.
- Nama file dibuat ulang (UUID), dan nama file saat dibaca divalidasi ketat sehingga tidak bisa dipakai untuk path traversal (`../`).
- File disimpan di `storage/uploads/` (di luar `public/` dan diabaikan git). Thumbnail lama dihapus saat diganti atau saat course dihapus.

## Fitur Teacher 

| Halaman | Fitur |
|---|---|
| `/teacher` | Dashboard: jumlah course, materi, student, rata-rata progress, ringkasan per course, aktivitas student terbaru |
| `/teacher/courses` | Daftar course milik sendiri, buat, edit (termasuk upload thumbnail), dan hapus course |
| `/teacher/courses/[id]/contents` | Kelola materi: tambah, edit (Rich Text Editor), hapus, dan ubah urutan (naik/turun) |
| `/teacher/students` | Progress student per course: persentase, jumlah materi selesai, materi terakhir, filter, dan pencarian |

- Urutan materi memakai constraint `UNIQUE (course_id, order_index) DEFERRABLE`, sehingga dua materi bisa bertukar urutan dalam satu transaksi. Setelah materi dihapus, urutan dirapikan kembali menjadi 1, 2, 3, ...
- Progress student dihitung ulang otomatis oleh **trigger PostgreSQL** saat materi ditambah atau dihapus.
- Student yang mengikuti course mendapat **notifikasi** saat Teacher menambah materi baru.
- Admin juga dapat mengelola materi semua course lewat tombol **Materi** di `/admin/courses`.

## Fitur Student 

| Halaman | Fitur |
|---|---|
| `/student` | Dashboard: kartu **Lanjutkan belajar**, statistik, kelas saya, notifikasi terbaru, rekomendasi course |
| `/student/courses` | Kelas Saya: semua kelas yang diikuti dengan progress, filter Sedang dipelajari / Selesai |
| `/student/learn/[courseId]` | Tombol **Lanjutkan**: diarahkan ke materi terakhir dibuka yang belum selesai |
| `/student/learn/[courseId]/[contentId]` | Ruang belajar: sidebar materi, isi materi, **Tandai selesai** / batalkan, Sebelumnya / Berikutnya, diskusi |
| `/teacher/courses/[id]/contents/[contentId]/discussion` | Teacher membaca, membalas, dan memoderasi diskusi per materi |
| `/notifications` | Notifikasi semua role, tandai dibaca satu per satu atau sekaligus |
| `/profile` | Profil, kelas yang diikuti/diajar, edit profil, ganti password |

- Progress (`progress_percent`) dan status `completed` dihitung **trigger PostgreSQL** dari tabel `lesson_progress`, bukan dikirim dari browser.
- Student hanya bisa membuka materi course yang diikutinya. Materi course lain, atau course yang belum diikuti, ditolak di server.
- Course dengan tanggal mulai di masa depan: materi terkunci sampai tanggal mulai. Setelah tanggal berakhir, materi tetap bisa dibaca tetapi progress tidak dapat diubah.
- Komentar disimpan sebagai teks biasa dan ditampilkan oleh React (otomatis di-escape), sehingga aman dari XSS. Penulis dapat menghapus komentarnya. Teacher pemilik course dan Admin dapat memoderasi.
- Notifikasi otomatis: Teacher saat ada pertanyaan baru, penulis komentar saat dibalas, Student saat ada materi baru.
- Ganti password memakai Better Auth (`changePassword`) dan mengeluarkan sesi di perangkat lain.
- Admin dapat membuka ruang belajar dalam **mode pratinjau** (tanpa tombol Tandai selesai).
- **Student yang menjadi Teacher** tetap bisa mengakses kelas yang sudah diikutinya: menu **Kelas Saya** dan **Sertifikat** muncul di sidebar Teacher jika ia punya riwayat belajar. Ia bisa melanjutkan belajar, berdiskusi, dan mengunduh sertifikat, tetapi **tidak bisa mengikuti course baru** (enroll tetap khusus Student, dicek di server).

## Fitur Sertifikat

| Halaman | Fitur |
|---|---|
| `/student/certificates` | Sertifikat Saya: semua sertifikat milik student, plus tombol **Terbitkan** untuk course 100% yang belum punya sertifikat |
| `/student/certificates/[id]` | Tampilan sertifikat A4 landscape dengan QR code, tombol **Cetak / Simpan PDF** dan salin link verifikasi |
| `/certificates/verify` | Verifikasi publik: masukkan nomor sertifikat (tanpa login) |
| `/certificates/verify/[number]` | Hasil verifikasi (tujuan QR code di sertifikat) |
| `/admin/certificates` | Admin melihat & mencari semua sertifikat |

- Sertifikat **terbit otomatis** saat student menandai materi terakhir hingga progress 100%, lalu student mendapat notifikasi.
- **Trigger PostgreSQL** `certificates_check_eligibility` menolak sertifikat jika progress belum 100%, dan constraint `UNIQUE (student_id, course_id)` mencegah sertifikat ganda.
- Nomor sertifikat dibuat database (`generate_certificate_number()`), format `KRL-2026-XXXXXXXXXX`.
- Nama student, judul course, dan nama instruktur disimpan sebagai **snapshot**, sehingga sertifikat tetap sah walau data aslinya berubah. Sertifikat yang sudah terbit tidak hilang walau tanda selesai dibatalkan.
- Unduh PDF memakai **CSS print** (`@page A4 landscape`), sehingga hanya sertifikat yang tercetak tanpa library PDF tambahan.
- Student hanya bisa membuka sertifikat miliknya (sertifikat orang lain -> 404). Halaman verifikasi publik hanya menampilkan data yang tercetak di sertifikat.


## Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Buka http://localhost:3000.
