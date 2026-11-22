/**
 * Menerjemahkan error PostgreSQL menjadi pesan yang ramah pengguna.
 * Kode error: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */

const PG_ERROR = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  CHECK_VIOLATION: "23514",
  NOT_NULL_VIOLATION: "23502",
  INVALID_TEXT_REPRESENTATION: "22P02", // contoh: UUID tidak valid
};

const CONSTRAINT_MESSAGES = {
  users_email_key: "Email sudah terdaftar.",
  users_username_key: "Username sudah dipakai.",
  users_username_format:
    "Username hanya boleh huruf kecil, angka, titik, dan underscore (3-30 karakter).",
  categories_name_key: "Nama kategori sudah ada.",
  categories_slug_key: "Slug kategori sudah ada.",
  courses_slug_key: "Judul course sudah dipakai, gunakan judul lain.",
  courses_date_range_check: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  courses_category_id_fkey: "Kategori masih dipakai oleh course sehingga tidak dapat dihapus.",
  courses_teacher_id_fkey:
    "Teacher masih memiliki course. Pindahkan atau hapus course-nya terlebih dahulu.",
  course_contents_course_order_key: "Urutan materi sudah dipakai di course ini.",
  enrollments_student_course_key: "Anda sudah mengikuti course ini.",
  lesson_progress_enrollment_content_key: "Materi ini sudah ditandai selesai.",
  teacher_applications_one_pending_idx: "Anda masih memiliki pengajuan Teacher yang menunggu verifikasi.",
  certificates_student_course_key: "Sertifikat untuk course ini sudah diterbitkan.",
};

export function isUniqueViolation(error) {
  return error?.code === PG_ERROR.UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error) {
  return error?.code === PG_ERROR.FOREIGN_KEY_VIOLATION;
}

/**
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getDbErrorMessage(error, fallback = "Terjadi kesalahan pada database.") {
  if (!error || typeof error !== "object") return fallback;

  if (error.constraint && CONSTRAINT_MESSAGES[error.constraint]) {
    return CONSTRAINT_MESSAGES[error.constraint];
  }

  switch (error.code) {
    case PG_ERROR.UNIQUE_VIOLATION:
      return "Data yang sama sudah ada.";
    case PG_ERROR.FOREIGN_KEY_VIOLATION:
      return "Data masih terhubung dengan data lain.";
    case PG_ERROR.CHECK_VIOLATION:
      return error.message || "Data tidak memenuhi aturan.";
    case PG_ERROR.NOT_NULL_VIOLATION:
      return "Ada data wajib yang belum diisi.";
    case PG_ERROR.INVALID_TEXT_REPRESENTATION:
      return "Format data tidak valid.";
    default:
      return fallback;
  }
}
