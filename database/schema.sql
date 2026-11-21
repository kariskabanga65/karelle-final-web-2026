-- =============================================================
-- KARÉLLE — Modeling Course | Database Schema
-- Database : kar_class_db (PostgreSQL 14+)
-- =============================================================
-- Cara menjalankan (pgAdmin):
--   1. Buat database bernama kar_class_db.
--   2. Klik kanan kar_class_db > Query Tool.
--   3. Buka file ini, lalu Execute (F5).
--   4. Setelah itu jalankan seed.sql.
--
-- PERINGATAN: file ini MENGHAPUS semua tabel lalu membuatnya ulang.
-- Seluruh data lama akan hilang. Jalankan ulang seed.sql sesudahnya.
-- =============================================================

BEGIN;

-- gen_random_uuid() & gen_random_bytes()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------
-- 0. Bersihkan objek lama (agar file aman dijalankan ulang)
-- -------------------------------------------------------------
DROP VIEW  IF EXISTS v_course_catalog CASCADE;
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS certificates         CASCADE;
DROP TABLE IF EXISTS comments             CASCADE;
DROP TABLE IF EXISTS lesson_progress      CASCADE;
DROP TABLE IF EXISTS enrollments          CASCADE;
DROP TABLE IF EXISTS course_contents      CASCADE;
DROP TABLE IF EXISTS courses              CASCADE;
DROP TABLE IF EXISTS categories           CASCADE;
DROP TABLE IF EXISTS teacher_applications CASCADE;
DROP TABLE IF EXISTS verifications        CASCADE;
DROP TABLE IF EXISTS accounts             CASCADE;
DROP TABLE IF EXISTS sessions             CASCADE;
DROP TABLE IF EXISTS users                CASCADE;

DROP FUNCTION IF EXISTS set_updated_at()                    CASCADE;
DROP FUNCTION IF EXISTS recalc_enrollment_progress(UUID)    CASCADE;
DROP FUNCTION IF EXISTS recalc_course_progress(UUID)        CASCADE;
DROP FUNCTION IF EXISTS trg_lesson_progress_recalc()        CASCADE;
DROP FUNCTION IF EXISTS trg_course_contents_recalc()        CASCADE;
DROP FUNCTION IF EXISTS generate_certificate_number()       CASCADE;
DROP FUNCTION IF EXISTS trg_check_certificate_eligibility() CASCADE;


-- =============================================================
-- 1. TABEL AUTENTIKASI (mengikuti skema Better Auth 1.7)
--    ID bertipe TEXT karena dibuat oleh Better Auth.
-- =============================================================

CREATE TABLE users (
    id              TEXT PRIMARY KEY,
    name            TEXT        NOT NULL,                 -- nama lengkap
    username        TEXT        NOT NULL,                 -- additionalField
    email           TEXT        NOT NULL,
    email_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
    image           TEXT,
    role            TEXT        NOT NULL DEFAULT 'student',
    headline        TEXT,                                 -- contoh: "Senior Web Developer"
    bio             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_key    UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_role_check   CHECK (role IN ('admin', 'teacher', 'student')),
    CONSTRAINT users_username_format CHECK (username ~ '^[a-z0-9_.]{3,30}$')
);

CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,
    user_id     TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token       TEXT        NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT sessions_token_key UNIQUE (token)
);

-- Password disimpan di sini (provider_id = 'credential'), bukan di users.
CREATE TABLE accounts (
    id                        TEXT PRIMARY KEY,
    user_id                   TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    account_id                TEXT        NOT NULL,
    provider_id               TEXT        NOT NULL,
    access_token              TEXT,
    refresh_token             TEXT,
    id_token                  TEXT,
    access_token_expires_at   TIMESTAMPTZ,
    refresh_token_expires_at  TIMESTAMPTZ,
    scope                     TEXT,
    password                  TEXT,                       -- hash bcrypt, BUKAN plaintext
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT accounts_provider_account_key UNIQUE (provider_id, account_id),
    CONSTRAINT accounts_password_is_bcrypt
        CHECK (password IS NULL OR password ~ '^\$2[aby]\$[0-9]{2}\$.{53}$')
);

-- Token sementara (dipakai fitur Forgot Password).
CREATE TABLE verifications (
    id          TEXT PRIMARY KEY,
    identifier  TEXT        NOT NULL,
    value       TEXT        NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================
-- 2. PENGAJUAN TEACHER
--    User mendaftar lewat form "Register as Teacher" -> role tetap
--    'student', pengajuan disimpan di sini dengan status 'pending'.
-- =============================================================

CREATE TABLE teacher_applications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expertise         TEXT        NOT NULL,             -- bidang keahlian
    experience        TEXT,                             -- pengalaman mengajar
    motivation        TEXT,                             -- alasan ingin mengajar
    status            TEXT        NOT NULL DEFAULT 'pending',
    approved_at       TIMESTAMPTZ,
    approved_by       TEXT        REFERENCES users (id) ON DELETE SET NULL,
    rejected_at       TIMESTAMPTZ,
    rejection_reason  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT teacher_applications_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),
    -- Data harus konsisten dengan status-nya.
    CONSTRAINT teacher_applications_approved_check
        CHECK (status <> 'approved' OR approved_at IS NOT NULL),
    CONSTRAINT teacher_applications_rejected_check
        CHECK (status <> 'rejected' OR rejected_at IS NOT NULL)
);

-- Satu user hanya boleh punya SATU pengajuan yang masih pending.
CREATE UNIQUE INDEX teacher_applications_one_pending_idx
    ON teacher_applications (user_id) WHERE status = 'pending';
CREATE INDEX teacher_applications_status_idx ON teacher_applications (status, created_at DESC);


-- =============================================================
-- 3. KATEGORI & COURSE
-- =============================================================

CREATE TABLE categories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT        NOT NULL,
    slug         TEXT        NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT categories_name_key UNIQUE (name),
    CONSTRAINT categories_slug_key UNIQUE (slug)
);

CREATE TABLE courses (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT        NOT NULL,
    slug           TEXT        NOT NULL,
    description    TEXT        NOT NULL,
    -- RESTRICT: kategori tidak bisa dihapus selama masih dipakai course.
    category_id    UUID        NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    -- RESTRICT: teacher tidak bisa dihapus selama masih punya course.
    teacher_id     TEXT        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    start_date     DATE,                                -- NULL = lifetime access
    end_date       DATE,                                -- NULL = lifetime access
    thumbnail_url  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT courses_slug_key UNIQUE (slug),
    CONSTRAINT courses_date_range_check
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX courses_category_id_idx ON courses (category_id);
CREATE INDEX courses_teacher_id_idx  ON courses (teacher_id);
CREATE INDEX courses_title_lower_idx ON courses (LOWER(title));


-- =============================================================
-- 4. MATERI (COURSE CONTENTS)
-- =============================================================

CREATE TABLE course_contents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title        TEXT        NOT NULL,
    content      TEXT        NOT NULL,                  -- HTML dari Rich Text Editor
    order_index  INTEGER     NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT course_contents_order_positive CHECK (order_index >= 1),
    -- Urutan unik per course. DEFERRABLE supaya dua materi bisa
    -- bertukar urutan di dalam satu transaksi (fitur ubah urutan).
    CONSTRAINT course_contents_course_order_key
        UNIQUE (course_id, order_index) DEFERRABLE INITIALLY IMMEDIATE,
    -- Dibutuhkan oleh foreign key gabungan di lesson_progress.
    CONSTRAINT course_contents_id_course_key UNIQUE (id, course_id)
);


-- =============================================================
-- 5. ENROLLMENT & PROGRESS
-- =============================================================

CREATE TABLE enrollments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        TEXT          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id         UUID          NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    status            TEXT          NOT NULL DEFAULT 'active',
    progress_percent  NUMERIC(5, 2) NOT NULL DEFAULT 0,  -- dihitung otomatis oleh trigger
    last_content_id   UUID          REFERENCES course_contents (id) ON DELETE SET NULL,
    enrolled_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    -- Satu student tidak bisa mendaftar course yang sama dua kali.
    CONSTRAINT enrollments_student_course_key UNIQUE (student_id, course_id),
    CONSTRAINT enrollments_id_course_key      UNIQUE (id, course_id),
    CONSTRAINT enrollments_status_check   CHECK (status IN ('active', 'completed')),
    CONSTRAINT enrollments_progress_check CHECK (progress_percent BETWEEN 0 AND 100)
);

CREATE INDEX enrollments_course_id_idx ON enrollments (course_id);

CREATE TABLE lesson_progress (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id  UUID        NOT NULL,
    content_id     UUID        NOT NULL,
    course_id      UUID        NOT NULL,
    completed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Materi yang sama tidak bisa dihitung dua kali.
    CONSTRAINT lesson_progress_enrollment_content_key UNIQUE (enrollment_id, content_id),
    -- Foreign key gabungan: menjamin materi yang diselesaikan
    -- benar-benar milik course yang diikuti student tersebut.
    CONSTRAINT lesson_progress_enrollment_fkey
        FOREIGN KEY (enrollment_id, course_id)
        REFERENCES enrollments (id, course_id) ON DELETE CASCADE,
    CONSTRAINT lesson_progress_content_fkey
        FOREIGN KEY (content_id, course_id)
        REFERENCES course_contents (id, course_id) ON DELETE CASCADE
);

CREATE INDEX lesson_progress_content_id_idx ON lesson_progress (content_id);


-- =============================================================
-- 6. DISKUSI (KOMENTAR PER MATERI)
-- =============================================================

CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id  UUID        NOT NULL REFERENCES course_contents (id) ON DELETE CASCADE,
    user_id     TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    parent_id   UUID        REFERENCES comments (id) ON DELETE CASCADE,  -- balasan
    body        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT comments_body_length CHECK (char_length(body) BETWEEN 1 AND 2000)
);

CREATE INDEX comments_content_id_idx ON comments (content_id, created_at);


-- =============================================================
-- 7. SERTIFIKAT
-- =============================================================

-- Format nomor: KRL-2026-7F3A9C1B2E (10 karakter heksadesimal acak)
CREATE FUNCTION generate_certificate_number() RETURNS TEXT
LANGUAGE sql VOLATILE AS $$
    SELECT 'KRL-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
           UPPER(SUBSTRING(ENCODE(gen_random_bytes(5), 'hex') FROM 1 FOR 10));
$$;

CREATE TABLE certificates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- SET NULL: sertifikat tetap sah walaupun course-nya kelak dihapus.
    course_id           UUID        REFERENCES courses (id) ON DELETE SET NULL,
    certificate_number  TEXT        NOT NULL DEFAULT generate_certificate_number(),
    -- Snapshot data saat diterbitkan, untuk halaman verifikasi.
    student_name        TEXT        NOT NULL,
    course_title        TEXT        NOT NULL,
    teacher_name        TEXT        NOT NULL,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT certificates_number_key         UNIQUE (certificate_number),
    CONSTRAINT certificates_student_course_key UNIQUE (student_id, course_id)
);


-- =============================================================
-- 8. NOTIFIKASI
-- =============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type        TEXT        NOT NULL,
    title       TEXT        NOT NULL,
    message     TEXT        NOT NULL,
    link        TEXT,
    is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT notifications_type_check CHECK (type IN (
        'teacher_approved', 'teacher_rejected', 'certificate_issued',
        'new_enrollment', 'new_comment', 'system'
    ))
);

CREATE INDEX notifications_user_unread_idx ON notifications (user_id, is_read, created_at DESC);


-- =============================================================
-- 9. FUNCTION & TRIGGER
-- =============================================================

-- 9.1 Mengisi updated_at otomatis setiap kali baris di-UPDATE.
CREATE FUNCTION set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at                BEFORE UPDATE ON users                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sessions_set_updated_at             BEFORE UPDATE ON sessions             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER accounts_set_updated_at             BEFORE UPDATE ON accounts             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER verifications_set_updated_at        BEFORE UPDATE ON verifications        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER teacher_applications_set_updated_at BEFORE UPDATE ON teacher_applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER categories_set_updated_at           BEFORE UPDATE ON categories           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER courses_set_updated_at              BEFORE UPDATE ON courses              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER course_contents_set_updated_at      BEFORE UPDATE ON course_contents      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER enrollments_set_updated_at          BEFORE UPDATE ON enrollments          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER comments_set_updated_at             BEFORE UPDATE ON comments             FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 9.2 Menghitung ulang progress satu enrollment.
--     progress = materi selesai / total materi x 100
CREATE FUNCTION recalc_enrollment_progress(p_enrollment_id UUID) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
    v_course_id UUID;
    v_total     INTEGER;
    v_done      INTEGER;
    v_percent   NUMERIC(5, 2);
BEGIN
    SELECT course_id INTO v_course_id FROM enrollments WHERE id = p_enrollment_id;
    IF v_course_id IS NULL THEN
        RETURN;  -- enrollment sudah dihapus
    END IF;

    SELECT COUNT(*) INTO v_total FROM course_contents WHERE course_id = v_course_id;
    SELECT COUNT(*) INTO v_done  FROM lesson_progress WHERE enrollment_id = p_enrollment_id;

    v_percent := CASE WHEN v_total = 0 THEN 0
                      ELSE LEAST(100, ROUND(v_done * 100.0 / v_total, 2)) END;

    UPDATE enrollments
       SET progress_percent = v_percent,
           status           = CASE WHEN v_percent = 100 THEN 'completed' ELSE 'active' END,
           completed_at     = CASE WHEN v_percent = 100 THEN COALESCE(completed_at, NOW()) ELSE NULL END
     WHERE id = p_enrollment_id;
END;
$$;

-- 9.3 Menghitung ulang progress semua student di satu course
--     (dipanggil saat materi ditambah atau dihapus).
CREATE FUNCTION recalc_course_progress(p_course_id UUID) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM enrollments WHERE course_id = p_course_id LOOP
        PERFORM recalc_enrollment_progress(r.id);
    END LOOP;
END;
$$;

-- 9.4 Trigger: Mark as Done (INSERT) / batal (DELETE) -> progress diperbarui.
CREATE FUNCTION trg_lesson_progress_recalc() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalc_enrollment_progress(OLD.enrollment_id);
        RETURN OLD;
    END IF;
    PERFORM recalc_enrollment_progress(NEW.enrollment_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER lesson_progress_recalc
AFTER INSERT OR DELETE ON lesson_progress
FOR EACH ROW EXECUTE FUNCTION trg_lesson_progress_recalc();

-- 9.5 Trigger: materi ditambah/dihapus -> progress semua student diperbarui.
CREATE FUNCTION trg_course_contents_recalc() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalc_course_progress(OLD.course_id);
        RETURN OLD;
    END IF;
    PERFORM recalc_course_progress(NEW.course_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER course_contents_recalc
AFTER INSERT OR DELETE ON course_contents
FOR EACH ROW EXECUTE FUNCTION trg_course_contents_recalc();

-- 9.6 Trigger: sertifikat HANYA bisa diterbitkan jika progress = 100%.
CREATE FUNCTION trg_check_certificate_eligibility() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM enrollments
         WHERE student_id = NEW.student_id
           AND course_id  = NEW.course_id
           AND progress_percent = 100
    ) THEN
        RAISE EXCEPTION 'Sertifikat hanya dapat diterbitkan jika progress course mencapai 100%%'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER certificates_check_eligibility
BEFORE INSERT ON certificates
FOR EACH ROW EXECUTE FUNCTION trg_check_certificate_eligibility();


-- =============================================================
-- 10. VIEW: ringkasan course untuk homepage & katalog
-- =============================================================

CREATE VIEW v_course_catalog AS
SELECT
    c.id,
    c.title,
    c.slug,
    c.description,
    c.start_date,
    c.end_date,
    c.thumbnail_url,
    c.created_at,
    c.category_id,
    cat.name     AS category_name,
    cat.slug     AS category_slug,
    c.teacher_id,
    u.name       AS teacher_name,
    u.username   AS teacher_username,
    u.email      AS teacher_email,
    u.headline   AS teacher_headline,
    (SELECT COUNT(*) FROM course_contents cc WHERE cc.course_id = c.id)::INT AS content_count,
    (SELECT COUNT(*) FROM enrollments e     WHERE e.course_id  = c.id)::INT AS student_count
FROM courses c
JOIN categories cat ON cat.id = c.category_id
JOIN users u        ON u.id   = c.teacher_id;

COMMIT;
