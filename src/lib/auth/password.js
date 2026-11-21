import bcrypt from "bcryptjs";

export const SALT_ROUNDS = 10;

// bcrypt.hash() — dipakai saat membuat atau mengganti password. 
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// bcrypt.compare() — dipakai saat login. 
export async function verifyPassword({ hash, password }) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
