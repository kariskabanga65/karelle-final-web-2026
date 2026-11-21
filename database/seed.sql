BEGIN;

-- 1. Users
INSERT INTO users (id, name, username, email, email_verified, role, headline, bio, created_at, updated_at) VALUES
  ('usr_admin', 'Admin KARÉLLE', 'admin', 'admin@karelle.id', TRUE, 'admin', 'Administrator Platform', 'Mengelola pengguna, kelas, dan kategori di KARÉLLE.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('usr_karis', 'Karis Kabanga', 'karis.kabanga', 'karis@karelle.id', TRUE, 'teacher', 'Runway Coach & Former Fashion Week Model', 'Berjalan di panggung Jakarta Fashion Week selama 7 musim dan kini melatih model runway profesional.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  ('usr_kesia', 'Kesia Karamoy', 'kesia.karamoy', 'kesia@karelle.id', TRUE, 'teacher', 'Fashion Photographer & Posing Coach', 'Fotografer editorial dan katalog yang telah memotret ratusan model untuk brand lokal.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('usr_ivan', 'Ivan Gunawan', 'ivan.gunawan', 'ivan@karelle.id', TRUE, 'teacher', 'Casting Director', 'Casting director untuk iklan dan peragaan busana, berpengalaman menilai ribuan talenta baru.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('usr_rina', 'Rina Kartika', 'rina.kartika', 'rina@karelle.id', TRUE, 'student', NULL, 'Model runway acara kampus yang ingin berbagi pengalaman.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('usr_puti', 'Puti Amelia', 'puti.amelia', 'puti@karelle.id', TRUE, 'student', NULL, 'Calon model wanita yang sedang membangun karier.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('usr_nadhifa', 'Nadhifa Alisya', 'nadhifa.alisya', 'nadhifa@karelle.id', TRUE, 'student', NULL, 'Tertarik pada dunia fashion dan photoshoot editorial.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('usr_aisyah', 'Nur Aisyah', 'nur.aisyah', 'aisyah@karelle.id', TRUE, 'student', NULL, NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;


-- 2. Accounts (password hash bcrypt, provider 'credential')
INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at) VALUES
  ('acc_admin', 'usr_admin', 'usr_admin', 'credential', '$2b$10$M9P3WRwLBHWBR4P8K1Hmze1ZSnwl1drzY3PxHApcRySFMj2wGdTT6', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('acc_karis', 'usr_karis', 'usr_karis', 'credential', '$2b$10$Fn2oq/1u5rvK8gKqHXy26ueRx9Jj/y99pmvooFq2dM/orfwmrccV.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  ('acc_kesia', 'usr_kesia', 'usr_kesia', 'credential', '$2b$10$Fn2oq/1u5rvK8gKqHXy26ueRx9Jj/y99pmvooFq2dM/orfwmrccV.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('acc_ivan', 'usr_ivan', 'usr_ivan', 'credential', '$2b$10$Fn2oq/1u5rvK8gKqHXy26ueRx9Jj/y99pmvooFq2dM/orfwmrccV.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('acc_rina', 'usr_rina', 'usr_rina', 'credential', '$2b$10$NS.XsJk9636qexCjigpBfuuC2r0rHHC.KRU.YoZ7IeNlVFX9/Ym8.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('acc_puti', 'usr_puti', 'usr_puti', 'credential', '$2b$10$NS.XsJk9636qexCjigpBfuuC2r0rHHC.KRU.YoZ7IeNlVFX9/Ym8.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('acc_nadhifa', 'usr_nadhifa', 'usr_nadhifa', 'credential', '$2b$10$NS.XsJk9636qexCjigpBfuuC2r0rHHC.KRU.YoZ7IeNlVFX9/Ym8.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('acc_aisyah', 'usr_aisyah', 'usr_aisyah', 'credential', '$2b$10$NS.XsJk9636qexCjigpBfuuC2r0rHHC.KRU.YoZ7IeNlVFX9/Ym8.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;


-- 3. Pengajuan Teacher
INSERT INTO teacher_applications (id, user_id, expertise, experience, motivation, status, created_at, approved_at, approved_by)
VALUES ('40000000-0000-0000-0000-000000000001', 'usr_karis', 'Runway & Catwalk', '7 musim di Jakarta Fashion Week, 3 tahun melatih model.', 'Membantu model baru tampil percaya diri di runway.', 'approved', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days', 'usr_admin')
ON CONFLICT DO NOTHING;
INSERT INTO teacher_applications (id, user_id, expertise, experience, motivation, status, created_at, approved_at, approved_by)
VALUES ('40000000-0000-0000-0000-000000000002', 'usr_kesia', 'Photoshoot & Posing', '10 tahun sebagai fotografer fashion.', 'Mengajarkan posing yang natural dan fotogenik.', 'approved', NOW() - INTERVAL '46 days', NOW() - INTERVAL '44 days', 'usr_admin')
ON CONFLICT DO NOTHING;
INSERT INTO teacher_applications (id, user_id, expertise, experience, motivation, status, created_at, approved_at, approved_by)
VALUES ('40000000-0000-0000-0000-000000000003', 'usr_ivan', 'Casting Preparation', '8 tahun sebagai casting director.', 'Membekali model agar siap menghadapi casting.', 'approved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 'usr_admin')
ON CONFLICT DO NOTHING;
INSERT INTO teacher_applications (id, user_id, expertise, experience, motivation, status, created_at)
VALUES ('40000000-0000-0000-0000-000000000004', 'usr_rina', 'Runway & Catwalk', 'Model runway acara kampus selama 2 tahun.', 'Ingin membuat kelas catwalk untuk pemula.', 'pending', NOW() - INTERVAL '6 days')
ON CONFLICT DO NOTHING;
INSERT INTO teacher_applications (id, user_id, expertise, experience, motivation, status, created_at, rejected_at, rejection_reason)
VALUES ('40000000-0000-0000-0000-000000000005', 'usr_aisyah', 'Photoshoot & Posing', 'Belum memiliki pengalaman mengajar.', 'Ingin mencoba mengajar.', 'rejected', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 'Mohon lengkapi pengalaman mengajar terlebih dahulu.')
ON CONFLICT DO NOTHING;


-- 4. Kategori (created_at berurutan agar tampil sesuai urutan program)
INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Runway & Catwalk', 'runway-catwalk', 'Teknik berjalan di panggung, postur, dan presentasi busana.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000002', 'Photoshoot & Posing', 'photoshoot-posing', 'Pose, ekspresi, dan kerja sama dengan fotografer di depan kamera.', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),
  ('10000000-0000-0000-0000-000000000003', 'Model Portfolio', 'model-portfolio', 'Menyusun portofolio, comp card, dan digitals yang menjual.', NOW() - INTERVAL '58 days', NOW() - INTERVAL '58 days'),
  ('10000000-0000-0000-0000-000000000004', 'Casting Preparation', 'casting-preparation', 'Persiapan go-see, audisi, dan self-tape untuk lolos casting.', NOW() - INTERVAL '57 days', NOW() - INTERVAL '57 days')
ON CONFLICT DO NOTHING;


-- 5. Courses  (start_date & end_date NULL = lifetime access)
INSERT INTO courses (id, title, slug, description, category_id, teacher_id, start_date, end_date, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Runway Modeling', 'runway-modeling',
   'Kuasai seni berjalan di runway: postur tubuh, langkah dan ritme, cara berbalik di ujung panggung, latihan high heels, hingga etika backstage di fashion show profesional.',
   '10000000-0000-0000-0000-000000000001', 'usr_karis', NULL, NULL, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000002', 'Posing & Photoshoot', 'posing-photoshoot',
   'Pelajari pose-pose fotogenik, ekspresi wajah, angle kamera terbaik, dan cara bekerja sama dengan fotografer selama sesi pemotretan editorial maupun komersial.',
   '10000000-0000-0000-0000-000000000002', 'usr_kesia', '2026-11-01', '2027-01-31', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
  ('20000000-0000-0000-0000-000000000003', 'Model Portfolio', 'model-portfolio',
   'Susun portofolio model yang dilirik agensi: memilih foto terbaik, variasi look, comp card standar agensi, data ukuran tubuh, hingga digitals atau polaroid.',
   '10000000-0000-0000-0000-000000000003', 'usr_kesia', NULL, NULL, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  ('20000000-0000-0000-0000-000000000004', 'Casting Preparation', 'casting-preparation',
   'Persiapan lengkap menghadapi casting: go-see, apa yang dibawa, kesan pertama di depan casting director, self-tape untuk audisi online, dan cara menghadapi penolakan.',
   '10000000-0000-0000-0000-000000000004', 'usr_ivan', '2026-11-15', '2027-02-28', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;


-- 6. Materi  (isi berupa HTML, ditampilkan sesuai order_index)

-- Runway Modeling
INSERT INTO course_contents (id, course_id, title, content, order_index) VALUES
  ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001', 'Mengenal Dunia Runway',
   $html$<h2>Apa itu runway?</h2><p><strong>Runway</strong> atau catwalk adalah panggung tempat model memperagakan busana di depan desainer, media, dan pembeli. Tugas utama model adalah <em>menampilkan busana</em>, bukan dirinya sendiri.</p><h3>Jenis peragaan</h3><ol><li><strong>Fashion week</strong>: koleksi musiman desainer.</li><li><strong>Showroom</strong>: peragaan untuk pembeli dalam ruangan kecil.</li><li><strong>Fashion show acara</strong>: peragaan di mal, kampus, atau acara brand.</li></ol>$html$, 1),
  ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001', 'Postur Tubuh yang Benar',
   $html$<h2>Fondasi setiap langkah</h2><p>Postur yang baik membuat busana jatuh dengan sempurna.</p><ul><li>Bahu turun dan sedikit ditarik ke belakang.</li><li>Dagu sejajar lantai, pandangan lurus ke depan.</li><li>Perut dikencangkan, punggung tegak.</li><li>Lengan rileks di samping tubuh.</li></ul><p><strong>Latihan:</strong> berdiri membelakangi dinding sehingga tumit, pinggul, bahu, dan kepala menyentuh dinding selama 2 menit setiap hari.</p>$html$, 2),
  ('30000000-0000-0000-0001-000000000003', '20000000-0000-0000-0000-000000000001', 'Teknik Langkah dan Ritme',
   $html$<h2>Langkah runway</h2><p>Model wanita umumnya melangkah dengan kaki menyilang tipis di garis tengah. Model pria melangkah lurus dengan jarak kaki selebar pinggul.</p><table><thead><tr><th>Unsur</th><th>Panduan</th></tr></thead><tbody><tr><td>Panjang langkah</td><td>Sedikit lebih panjang dari langkah biasa</td></tr><tr><td>Tempo</td><td>Mengikuti ketukan musik</td></tr><tr><td>Pijakan</td><td>Tumit lebih dulu, lalu telapak</td></tr><tr><td>Lengan</td><td>Mengayun alami, tidak kaku</td></tr></tbody></table>$html$, 3),
  ('30000000-0000-0000-0001-000000000004', '20000000-0000-0000-0000-000000000001', 'Berbalik di Ujung Runway',
   $html$<h2>The turn</h2><p>Titik ujung runway adalah momen ketika fotografer mengambil gambar terbaik.</p><ol><li>Berhenti dengan berat badan di satu kaki.</li><li>Tahan pose selama 1 sampai 2 detik.</li><li>Berbalik dengan bertumpu pada telapak kaki depan.</li><li>Kembali berjalan dengan ritme yang sama.</li></ol>$html$, 4),
  ('30000000-0000-0000-0001-000000000005', '20000000-0000-0000-0000-000000000001', 'Latihan Memakai High Heels',
   $html$<h2>Stabil di sepatu hak tinggi</h2><p>Sebagian besar peragaan wanita memakai high heels. Latih keseimbangan secara bertahap.</p><ul><li>Mulai dari hak 5 cm, lalu naikkan perlahan.</li><li>Latihan berjalan di lantai licin dan tangga.</li><li>Kuatkan pergelangan kaki dengan gerakan <em>calf raise</em>.</li></ul>$html$, 5),
  ('30000000-0000-0000-0001-000000000006', '20000000-0000-0000-0000-000000000001', 'Etika Backstage & Quick Change',
   $html$<h2>Profesional di balik panggung</h2><ul><li>Datang lebih awal sesuai call time.</li><li>Ikuti arahan dresser dan stylist.</li><li>Jaga busana tetap bersih dan rapi.</li><li>Jangan mengunggah foto koleksi sebelum diizinkan.</li></ul><h3>Quick change</h3><p>Di fashion week, model bisa berganti busana dalam waktu kurang dari 60 detik. Hafalkan urutan look dan percayakan prosesnya kepada dresser.</p>$html$, 6)
ON CONFLICT (id) DO NOTHING;

-- Posing & Photoshoot
INSERT INTO course_contents (id, course_id, title, content, order_index) VALUES
  ('30000000-0000-0000-0002-000000000001', '20000000-0000-0000-0000-000000000002', 'Mengenal Sudut Tubuh',
   $html$<h2>Sudut 45 derajat</h2><p>Memutar tubuh sekitar 45 derajat dari kamera membuat tubuh terlihat lebih ramping dan berdimensi.</p><table><thead><tr><th>Angle kamera</th><th>Efek</th></tr></thead><tbody><tr><td>Sedikit dari atas</td><td>Wajah terlihat lebih tirus</td></tr><tr><td>Sejajar mata</td><td>Natural dan jujur</td></tr><tr><td>Dari bawah</td><td>Kesan kuat dan tinggi</td></tr></tbody></table>$html$, 1),
  ('30000000-0000-0000-0002-000000000002', '20000000-0000-0000-0000-000000000002', 'Pose Berdiri',
   $html$<h2>Pose dasar berdiri</h2><ul><li><strong>Contrapposto</strong>: berat badan di satu kaki.</li><li><strong>Cross leg</strong>: kaki menyilang untuk kesan santai.</li><li><strong>Power stance</strong>: kaki terbuka untuk kesan kuat.</li></ul>$html$, 2),
  ('30000000-0000-0000-0002-000000000003', '20000000-0000-0000-0000-000000000002', 'Pose Duduk',
   $html$<h2>Duduk dengan elegan</h2><p>Duduk di ujung kursi, punggung tegak, dan beri jarak antara lengan dan tubuh agar siluet tetap terlihat.</p>$html$, 3),
  ('30000000-0000-0000-0002-000000000004', '20000000-0000-0000-0000-000000000002', 'Tangan dan Jari',
   $html$<h2>Tangan yang hidup</h2><p>Tangan sering terlihat kaku di foto. Lemaskan jari dan sentuh wajah, rambut, atau busana dengan lembut, bukan ditekan.</p>$html$, 4),
  ('30000000-0000-0000-0002-000000000005', '20000000-0000-0000-0000-000000000002', 'Ekspresi Wajah & Smize',
   $html$<h2>Mata yang bercerita</h2><p><em>Smize</em> adalah teknik membuat mata terlihat tersenyum walaupun bibir tidak tersenyum lebar.</p><h3>Ragam ekspresi editorial</h3><ul><li>Fierce</li><li>Dreamy</li><li>Playful</li><li>Mysterious</li></ul><p>Latih 10 ekspresi berbeda selama 15 menit setiap hari di depan cermin.</p>$html$, 5),
  ('30000000-0000-0000-0002-000000000006', '20000000-0000-0000-0000-000000000002', 'Bekerja Sama dengan Fotografer',
   $html$<h2>Komunikasi di set</h2><ol><li>Pahami moodboard sebelum pemotretan.</li><li>Ganti pose setiap bunyi shutter.</li><li>Minta melihat hasil sesekali untuk evaluasi.</li></ol>$html$, 6)
ON CONFLICT (id) DO NOTHING;

-- Model Portfolio
INSERT INTO course_contents (id, course_id, title, content, order_index) VALUES
  ('30000000-0000-0000-0003-000000000001', '20000000-0000-0000-0000-000000000003', 'Fungsi Portofolio',
   $html$<h2>Kartu nama visual</h2><p>Portofolio adalah alat utama model untuk memperkenalkan diri kepada agensi dan klien.</p>$html$, 1),
  ('30000000-0000-0000-0003-000000000002', '20000000-0000-0000-0000-000000000003', 'Memilih Foto Terbaik',
   $html$<h2>Kualitas, bukan kuantitas</h2><ul><li>Pilih 10 sampai 20 foto terbaik.</li><li>Tunjukkan variasi ekspresi dan gaya.</li><li>Pastikan foto terbaru, maksimal 1 tahun.</li></ul>$html$, 2),
  ('30000000-0000-0000-0003-000000000003', '20000000-0000-0000-0000-000000000003', 'Variasi Look',
   $html$<h2>Look yang wajib ada</h2><ol><li>Beauty close-up</li><li>Full body</li><li>Editorial</li><li>Komersial</li></ol>$html$, 3),
  ('30000000-0000-0000-0003-000000000004', '20000000-0000-0000-0000-000000000003', 'Comp Card',
   $html$<h2>Kartu komposit</h2><p>Comp card adalah kartu berisi foto terbaik dan data fisik model, biasanya dibawa saat casting. Perbarui setiap ada perubahan penampilan.</p>$html$, 4),
  ('30000000-0000-0000-0003-000000000005', '20000000-0000-0000-0000-000000000003', 'Mengukur Data Tubuh',
   $html$<h2>Data wajib</h2><table><thead><tr><th>Data</th><th>Keterangan</th></tr></thead><tbody><tr><td>Tinggi</td><td>Tanpa alas kaki</td></tr><tr><td>Bust/Chest</td><td>Lingkar dada</td></tr><tr><td>Waist</td><td>Lingkar pinggang</td></tr><tr><td>Hips</td><td>Lingkar pinggul</td></tr></tbody></table>$html$, 5),
  ('30000000-0000-0000-0003-000000000006', '20000000-0000-0000-0000-000000000003', 'Digitals atau Polaroid',
   $html$<h2>Tampil apa adanya</h2><ul><li>Tanpa make-up berlebihan.</li><li>Pakaian polos dan pas badan.</li><li>Latar belakang putih atau polos.</li></ul>$html$, 6)
ON CONFLICT (id) DO NOTHING;

-- Casting Preparation
INSERT INTO course_contents (id, course_id, title, content, order_index) VALUES
  ('30000000-0000-0000-0004-000000000001', '20000000-0000-0000-0000-000000000004', 'Casting dan Go-See',
   $html$<h2>Dua jenis pertemuan</h2><p><strong>Casting</strong> mencari model untuk pekerjaan tertentu. <strong>Go-see</strong> adalah perkenalan umum dengan klien atau agensi.</p>$html$, 1),
  ('30000000-0000-0000-0004-000000000002', '20000000-0000-0000-0000-000000000004', 'Apa yang Dibawa',
   $html$<h2>Checklist casting</h2><ul><li>Comp card dan portofolio</li><li>Sepatu hak tinggi atau sepatu formal</li><li>Pakaian dasar berwarna polos</li><li>Air minum</li></ul>$html$, 2),
  ('30000000-0000-0000-0004-000000000003', '20000000-0000-0000-0000-000000000004', 'Kesan Pertama',
   $html$<h2>30 detik pertama</h2><ol><li>Masuk dengan postur tegak dan senyum.</li><li>Perkenalkan diri dengan singkat.</li><li>Ikuti instruksi dengan tenang.</li></ol>$html$, 3),
  ('30000000-0000-0000-0004-000000000004', '20000000-0000-0000-0000-000000000004', 'Self-Tape: Peralatan',
   $html$<h2>Cukup dengan ponsel</h2><ul><li>Ponsel dengan kamera belakang</li><li>Tripod</li><li>Cahaya alami atau ring light</li><li>Latar polos</li></ul>$html$, 4),
  ('30000000-0000-0000-0004-000000000005', '20000000-0000-0000-0000-000000000004', 'Framing & Slate',
   $html$<h2>Terlihat jelas</h2><table><thead><tr><th>Shot</th><th>Kegunaan</th></tr></thead><tbody><tr><td>Close-up</td><td>Perkenalan dan ekspresi</td></tr><tr><td>Medium</td><td>Gestur tubuh</td></tr><tr><td>Full body</td><td>Walking dan profil</td></tr></tbody></table><p><strong>Slate:</strong> sebutkan nama, tinggi badan, dan agensi, lalu tunjukkan profil kiri dan kanan.</p>$html$, 5),
  ('30000000-0000-0000-0004-000000000006', '20000000-0000-0000-0000-000000000004', 'Menghadapi Penolakan',
   $html$<h2>Bagian dari proses</h2><p>Tidak lolos casting bukan berarti Anda gagal. Klien sering mencari tampilan tertentu. Evaluasi diri, lalu datang ke casting berikutnya.</p>$html$, 6)
ON CONFLICT (id) DO NOTHING;


-- 7. Enrollment
INSERT INTO enrollments (id, student_id, course_id, enrolled_at) VALUES
  ('50000000-0000-0000-0000-000000000001', 'usr_puti', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '28 days'),
  ('50000000-0000-0000-0000-000000000002', 'usr_puti', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 days'),
  ('50000000-0000-0000-0000-000000000003', 'usr_nadhifa', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000004', 'usr_nadhifa', '20000000-0000-0000-0000-000000000003', NOW() - INTERVAL '16 days'),
  ('50000000-0000-0000-0000-000000000005', 'usr_rina', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days'),
  ('50000000-0000-0000-0000-000000000006', 'usr_rina', '20000000-0000-0000-0000-000000000004', NOW() - INTERVAL '2 days'),
  ('50000000-0000-0000-0000-000000000007', 'usr_aisyah', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days'),
  ('50000000-0000-0000-0000-000000000008', 'usr_aisyah', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '9 days'),
  ('50000000-0000-0000-0000-000000000009', 'usr_aisyah', '20000000-0000-0000-0000-000000000004', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;


-- 8. Lesson progress (materi yang sudah ditandai selesai)
INSERT INTO lesson_progress (enrollment_id, content_id, course_id) VALUES
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000003', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000004', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000005', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000006', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0002-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0002-000000000002', '20000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0003-000000000001', '20000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0003-000000000002', '20000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0003-000000000003', '20000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0004-000000000001', '20000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Materi terakhir yang dibuka (dipakai tombol "Lanjutkan Belajar")
UPDATE enrollments e
   SET last_content_id = (
        SELECT lp.content_id
          FROM lesson_progress lp
          JOIN course_contents cc ON cc.id = lp.content_id
         WHERE lp.enrollment_id = e.id
         ORDER BY cc.order_index DESC
         LIMIT 1)
 WHERE e.last_content_id IS NULL;


-- 9. Sertifikat (Puti sudah menyelesaikan 100% "Runway Modeling")
INSERT INTO certificates (id, student_id, course_id, certificate_number, student_name, course_title, teacher_name, issued_at)
VALUES ('60000000-0000-0000-0000-000000000001', 'usr_puti', '20000000-0000-0000-0000-000000000001',
        'KRL-2026-A1B2C3D4E5', 'Puti Amelia', 'Runway Modeling', 'Karis Kabanga', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;


-- 10. Komentar / diskusi
INSERT INTO comments (id, content_id, user_id, parent_id, body, created_at) VALUES
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0001-000000000001', 'usr_nadhifa', NULL,
   'Apakah boleh berlatih catwalk tanpa high heels di awal?', NOW() - INTERVAL '10 days'),
  ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0001-000000000001', 'usr_karis', '70000000-0000-0000-0000-000000000001',
   'Boleh. Kuasai dulu postur dan langkah dengan sepatu datar, baru pindah ke hak rendah agar tidak cedera.', NOW() - INTERVAL '9 days'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0001-000000000001', 'usr_puti', NULL,
   'Penjelasannya jelas, terima kasih Kak Karis!', NOW() - INTERVAL '8 days'),
  ('70000000-0000-0000-0000-000000000004', '30000000-0000-0000-0001-000000000004', 'usr_rina', NULL,
   'Berapa lama idealnya menahan pose di ujung runway?', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;


-- 11. Notifikasi
INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES
  ('80000000-0000-0000-0000-000000000001', 'usr_ivan', 'teacher_approved', 'Selamat, Anda resmi menjadi Teacher!',
   'Pengajuan Teacher Anda telah disetujui Admin. Mulai buat course pertama Anda.', '/teacher', FALSE, NOW() - INTERVAL '2 hours'),
  ('80000000-0000-0000-0000-000000000002', 'usr_aisyah', 'teacher_rejected', 'Pengajuan Teacher ditolak',
   'Mohon lengkapi pengalaman mengajar terlebih dahulu.', '/profile', FALSE, NOW() - INTERVAL '3 days'),
  ('80000000-0000-0000-0000-000000000003', 'usr_puti', 'certificate_issued', 'Sertifikat diterbitkan',
   'Selamat! Anda menyelesaikan course Runway Modeling.', '/student/certificates', TRUE, NOW() - INTERVAL '4 days'),
  ('80000000-0000-0000-0000-000000000004', 'usr_karis', 'new_enrollment', 'Student baru bergabung',
   'Rina Kartika mengikuti course Runway Modeling.', '/teacher/students', FALSE, NOW() - INTERVAL '6 days')
ON CONFLICT DO NOTHING;

COMMIT;
