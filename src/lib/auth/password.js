import bcrypt from "bcryptjs";

/**
 * Hashing password dengan bcryptjs.
 *
 * Fungsi ini dipasang ke Better Auth (lihat src/lib/auth/auth.js),
 * sehingga SEMUA password (register, reset password, akun buatan Admin)
 * memakai mekanisme yang sama dengan akun dummy di seed.sql.
 */

export const SALT_ROUNDS = 10;

/** bcrypt.hash() — dipakai saat membuat atau mengganti password. */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** bcrypt.compare() — dipakai saat login. */
export async function verifyPassword({ hash, password }) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
