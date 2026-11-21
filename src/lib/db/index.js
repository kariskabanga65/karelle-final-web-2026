import "server-only";
import { Pool } from "pg";

/**
 * Koneksi PostgreSQL menggunakan connection pool dari package `pg`.
 *
 * - Pool dibuat SEKALI lalu dipakai ulang. Di mode development, Next.js
 *   memuat ulang modul setiap file berubah, jadi pool disimpan di
 *   globalThis agar tidak membuat koneksi baru terus-menerus.
 * - File ini hanya boleh dipakai di server (Server Component, Server
 *   Action, Route Handler). Import "server-only" memastikan file ini
 *   tidak pernah ikut terkirim ke browser.
 * - JANGAN di-import dari src/middleware.js.
 */

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL belum diatur. Salin .env.example menjadi .env.local lalu isi nilainya.",
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("error", (error) => {
    console.error("[db] Koneksi idle PostgreSQL error:", error.message);
  });

  return pool;
}

const globalForDb = globalThis;

export const pool = globalForDb.karellePool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.karellePool = pool;
}

/**
 * Menjalankan satu query SQL dengan parameter.
 *
 * SELALU kirim nilai dari pengguna lewat `params`, jangan digabung ke
 * dalam string SQL. Contoh yang benar:
 *
 *   await query("SELECT * FROM courses WHERE id = $1", [courseId]);
 *
 * Contoh yang SALAH (rawan SQL Injection):
 *
 *   await query(`SELECT * FROM courses WHERE id = '${courseId}'`);
 *
 * @param {string} text   SQL dengan placeholder $1, $2, ...
 * @param {unknown[]} [params]
 */
export async function query(text, params = []) {
  return pool.query(text, params);
}

/** Mengembalikan baris pertama, atau null jika tidak ada. */
export async function queryOne(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
}

/** Mengembalikan semua baris. */
export async function queryMany(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/**
 * Menjalankan beberapa query dalam satu transaksi.
 * Jika salah satu gagal, semua perubahan dibatalkan (ROLLBACK).
 *
 *   await withTransaction(async (client) => {
 *     await client.query("INSERT ...", [...]);
 *     await client.query("UPDATE ...", [...]);
 *   });
 *
 * @template T
 * @param {(client: import("pg").PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
