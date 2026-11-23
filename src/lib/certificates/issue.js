import "server-only";

/**
 * Menerbitkan sertifikat untuk satu enrollment (dipanggil di dalam transaksi).
 *
 * - Data nama student, judul course, dan nama teacher disalin (snapshot)
 *   agar sertifikat tetap valid walau data aslinya kelak berubah/dihapus.
 * - Trigger database menolak penerbitan jika progress belum 100%.
 * - UNIQUE (student_id, course_id) + ON CONFLICT: satu sertifikat per course,
 *   aman walau dipanggil dua kali bersamaan.
 *
 * Mengembalikan { id, certificate_number, created } atau null jika belum memenuhi syarat.
 */
export async function issueCertificate(client, { studentId, courseId }) {
  const { rows } = await client.query(
    `INSERT INTO certificates (student_id, course_id, student_name, course_title, teacher_name)
     SELECT e.student_id, c.id, s.name, c.title, t.name
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users s   ON s.id = e.student_id
       JOIN users t   ON t.id = c.teacher_id
      WHERE e.student_id = $1 AND e.course_id = $2 AND e.progress_percent = 100
     ON CONFLICT (student_id, course_id) DO NOTHING
     RETURNING id, certificate_number, course_title`,
    [studentId, courseId],
  );

  if (rows.length === 0) {
    // Sudah pernah terbit (atau belum 100%): kembalikan yang sudah ada jika ada.
    const existing = await client.query(
      `SELECT id, certificate_number FROM certificates WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId],
    );
    return existing.rows[0] ? { ...existing.rows[0], created: false } : null;
  }

  const certificate = rows[0];
  await client.query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES ($1, 'certificate_issued', 'Sertifikat terbit', $2, $3)`,
    [
      studentId,
      `Selamat! Sertifikat ${certificate.course_title} (${certificate.certificate_number}) sudah dapat diunduh.`,
      `/student/certificates/${certificate.id}`,
    ],
  );
  return { id: certificate.id, certificate_number: certificate.certificate_number, created: true };
}
