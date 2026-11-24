import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
const password = process.argv[2];

if (!password) {
  console.error('Contoh: npm run hash-password -- "PasswordAnda123!"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, SALT_ROUNDS);
const isValid = await bcrypt.compare(password, hash);

console.log(`Hash      : ${hash}`);
console.log(`Verifikasi: ${isValid ? "cocok" : "TIDAK cocok"}`);
