# KARÉLLE — Modeling Course

Final Project Praktikum Pemrograman Web 2026 — Individual Project 4: Platform Kursus.

KARÉLLE adalah platform kursus modeling berbasis kelas dengan empat peran: **Admin**, **Teacher**, **Student**, dan **Guest**.

Bidang kursus: **Runway & Catwalk**, **Photoshoot & Posing**, **Model Portfolio**, dan **Casting Preparation**.

> Dokumentasi lengkap (instalasi database, akun dummy, cara menjalankan) akan dilengkapi pada Tahap 10.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, JSX), Tailwind CSS 4, shadcn/ui, Lucide React |
| Backend | Route Handlers, Server Components, Server Actions, Zod (validasi) |
| Database | PostgreSQL + Raw SQL (`pg`), tanpa ORM |
| Auth | Better Auth, bcryptjs, `src/middleware.js`, RBAC |

## Struktur Folder

```
src/
├── app/
│   ├── (public)/      Homepage, katalog, detail course, teacher, verifikasi sertifikat
│   ├── (auth)/        Login, register student/teacher, forgot password
│   ├── dashboard/     Redirect ke dashboard sesuai role
│   ├── profile/       Profil pengguna
│   ├── admin/         Modul Admin
│   ├── teacher/       Modul Teacher
│   ├── student/       Modul Student
│   └── api/           Route Handlers
├── components/        ui/, layout/, forms/, shared/
├── lib/               auth/, db/, validations/, utils/
├── actions/           Server Actions
├── hooks/
└── middleware.js
database/
├── schema.sql
└── seed.sql
```

## Menjalankan (sementara)

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```
