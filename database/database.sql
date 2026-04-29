-- =============================================
-- 1. MEMBUAT DATABASE
-- =============================================
CREATE DATABASE IF NOT EXISTS web_bioskop;
USE web_bioskop;

-- =============================================
-- 2. TABEL ADMIN
-- =============================================
CREATE TABLE admin (
    ID_Admin      VARCHAR(20) PRIMARY KEY,
    Nama_Lengkap  VARCHAR(100),
    Email         VARCHAR(100),
    Password      VARCHAR(255),
    Role          ENUM('super_admin', 'admin'),
    Last_Login    DATETIME,
    Created_At    DATETIME
);

-- =============================================
-- 3. TABEL KATEGORI
-- =============================================
CREATE TABLE kategori (
    ID_Kategori   VARCHAR(20) PRIMARY KEY,
    Nama_Kategori VARCHAR(50) NOT NULL
);

-- =============================================
-- 4. TABEL FILM
-- =============================================
CREATE TABLE film (
    ID_Film       INT(11) PRIMARY KEY AUTO_INCREMENT,
    Judul_Film    VARCHAR(50) NOT NULL,
    Durasi        TIME,
    ID_Kategori   VARCHAR(20),
    image         VARCHAR(255),
    Director      VARCHAR(100),
    Deskripsi     TEXT,
    Rating_Usia   VARCHAR(10),
    Trailer_URL   VARCHAR(255),
    Rating        DECIMAL(2,1),
    FOREIGN KEY (ID_Kategori) REFERENCES kategori(ID_Kategori) ON DELETE SET NULL
);

-- =============================================
-- 5. TABEL STUDIO
-- =============================================
CREATE TABLE studio (
    No_Studio     INT(11) PRIMARY KEY,
    Nama_Studio   VARCHAR(50) NOT NULL,
    Harga_Tiket   INT(11) NOT NULL
);

-- =============================================
-- 6. TABEL KURSI
-- =============================================
CREATE TABLE kursi (
    ID_Kursi      VARCHAR(20) PRIMARY KEY,
    No_Studio     INT(11) NOT NULL,
    Baris         VARCHAR(5) NOT NULL,
    Nomor_Kursi   INT(3) NOT NULL,
    FOREIGN KEY (No_Studio) REFERENCES studio(No_Studio) ON DELETE CASCADE,
    UNIQUE KEY unique_kursi (No_Studio, Baris, Nomor_Kursi)
);

-- =============================================
-- 7. TABEL PENONTON
-- =============================================
CREATE TABLE penonton (
    ID_Penonton     VARCHAR(20) PRIMARY KEY,
    Email           VARCHAR(50) UNIQUE NOT NULL,
    Password        VARCHAR(255) NOT NULL,
    Alamat          TEXT,
    No_HP           VARCHAR(15),
    Jenis_Kelamin   VARCHAR(10),
    Nama_Lengkap    VARCHAR(100) NOT NULL,
    Tanggal_Daftar  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. TABEL JADWAL
-- =============================================
CREATE TABLE jadwal (
    ID_Jadwal     VARCHAR(20) PRIMARY KEY,
    Tanggal       DATE NOT NULL,
    Jam_Mulai     TIME NOT NULL,
    No_Studio     INT(11) NOT NULL,
    ID_Film       INT(11) NOT NULL,
    FOREIGN KEY (No_Studio) REFERENCES studio(No_Studio) ON DELETE CASCADE,
    FOREIGN KEY (ID_Film)   REFERENCES film(ID_Film) ON DELETE CASCADE
);

-- =============================================
-- 9. TABEL TIKET
-- =============================================
CREATE TABLE tiket (
    ID_Tiket      VARCHAR(20) PRIMARY KEY,
    Stok          INT(11) NOT NULL,
    Harga         INT(11) NOT NULL,
    ID_Kursi      VARCHAR(20) NOT NULL,
    ID_Jadwal     VARCHAR(20) NOT NULL,
    Status        VARCHAR(20) DEFAULT 'tersedia',
    FOREIGN KEY (ID_Kursi)  REFERENCES kursi(ID_Kursi) ON DELETE CASCADE,
    FOREIGN KEY (ID_Jadwal) REFERENCES jadwal(ID_Jadwal) ON DELETE CASCADE,
    UNIQUE KEY unique_tiket (ID_Jadwal, ID_Kursi)
);

-- =============================================
-- 10. TABEL TRANSAKSI
-- =============================================
CREATE TABLE transaksi (
    ID_Transaksi        VARCHAR(20) PRIMARY KEY,
    Jumlah              INT(11) NOT NULL,
    Total_Harga         INT(11) NOT NULL,
    Metode_Pembayaran   VARCHAR(50) NOT NULL,
    Tanggal_Pemesanan   DATE NOT NULL,
    ID_Jadwal           VARCHAR(20) NOT NULL,
    Kursi               TEXT NOT NULL,
    ID_Penonton         VARCHAR(20) NOT NULL,
    FOREIGN KEY (ID_Jadwal)   REFERENCES jadwal(ID_Jadwal) ON DELETE CASCADE,
    FOREIGN KEY (ID_Penonton) REFERENCES penonton(ID_Penonton) ON DELETE CASCADE
);

-- =============================================
-- 11. TABEL TRAILER
-- =============================================
CREATE TABLE trailer (
    ID_Trailer    INT PRIMARY KEY AUTO_INCREMENT,
    ID_Film       INT NOT NULL,
    Link_Video    VARCHAR(255) NOT NULL,
    is_Active     BOOLEAN DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Film) REFERENCES film(ID_Film) ON DELETE CASCADE
);

-- =============================================
-- 12. TABEL NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
    id          INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id     VARCHAR(20),
    title       VARCHAR(255),
    message     TEXT,
    type        ENUM('success', 'info', 'warning', 'error'),
    is_read     TINYINT(1),
    created_at  TIMESTAMP
);

-- =============================================
-- TABEL PASSWORD RESETS (untuk lupa password)
-- =============================================
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email),
    FOREIGN KEY (email) REFERENCES penonton(Email) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- 13. INDEKS UNTUK PERFORMANCE
-- =============================================
ALTER TABLE penonton   ADD INDEX idx_email (Email);
ALTER TABLE penonton   ADD INDEX idx_no_hp (No_HP);
ALTER TABLE transaksi  ADD INDEX idx_id_penonton (ID_Penonton);
ALTER TABLE transaksi  ADD INDEX idx_id_jadwal (ID_Jadwal);
ALTER TABLE jadwal     ADD INDEX idx_id_film (ID_Film);
ALTER TABLE jadwal     ADD INDEX idx_tanggal (Tanggal);
ALTER TABLE film       ADD INDEX idx_id_kategori (ID_Kategori);
ALTER TABLE tiket      ADD INDEX idx_id_jadwal (ID_Jadwal);
ALTER TABLE tiket      ADD INDEX idx_id_kursi (ID_Kursi);
ALTER TABLE notifications ADD INDEX idx_user_id (user_id);
ALTER TABLE notifications ADD INDEX idx_is_read (is_read);

-- =============================================
-- 14. INSERT DATA KATEGORI
-- =============================================
INSERT INTO kategori (ID_Kategori, Nama_Kategori) VALUES
    ('AKSI',      'Action'),
    ('ANIM',      'Animation'),
    ('DOKUM',     'Dokumenter'),
    ('DRAMA',     'Drama'),
    ('FANTASI',   'Fantasi'),
    ('HOROR',     'Horror'),
    ('KOMEDI',    'Komedi'),
    ('MYSTERY',   'Misteri'),
    ('PETUALANG', 'Petualangan'),
    ('ROMAN',     'Romance'),
    ('SCIFI',     'Science Fiction'),
    ('THRIL',     'Thriller');

-- =============================================
-- 15. INSERT DATA STUDIO
-- =============================================
INSERT INTO studio (No_Studio, Nama_Studio, Harga_Tiket) VALUES
    (1, 'Reguler 1',    50000),
    (2, 'Reguler 2',    50000),
    (3, 'Reguler 3',    50000),
    (4, 'IMAX',         75000),
    (5, 'Premiere',     85000),
    (6, 'Dolby Atmos', 100000),
    (7, '3D',           65000),
    (8, 'VIP',         150000),
    (9, 'IMAX 3D',      95000);

-- =============================================
-- 16. INSERT DATA KURSI (Studio 1)
-- =============================================
-- Baris A (Kursi 1-8)
INSERT INTO kursi (ID_Kursi, No_Studio, Baris, Nomor_Kursi) VALUES
    ('KRS1A01', 1, 'A', 1), ('KRS1A02', 1, 'A', 2),
    ('KRS1A03', 1, 'A', 3), ('KRS1A04', 1, 'A', 4),
    ('KRS1A05', 1, 'A', 5), ('KRS1A06', 1, 'A', 6),
    ('KRS1A07', 1, 'A', 7), ('KRS1A08', 1, 'A', 8);

-- Baris B (Kursi 1-8)
INSERT INTO kursi (ID_Kursi, No_Studio, Baris, Nomor_Kursi) VALUES
    ('KRS1B01', 1, 'B', 1), ('KRS1B02', 1, 'B', 2),
    ('KRS1B03', 1, 'B', 3), ('KRS1B04', 1, 'B', 4),
    ('KRS1B05', 1, 'B', 5), ('KRS1B06', 1, 'B', 6),
    ('KRS1B07', 1, 'B', 7), ('KRS1B08', 1, 'B', 8);

-- Baris C (Kursi 1-8)
INSERT INTO kursi (ID_Kursi, No_Studio, Baris, Nomor_Kursi) VALUES
    ('KRS1C01', 1, 'C', 1), ('KRS1C02', 1, 'C', 2),
    ('KRS1C03', 1, 'C', 3), ('KRS1C04', 1, 'C', 4),
    ('KRS1C05', 1, 'C', 5), ('KRS1C06', 1, 'C', 6),
    ('KRS1C07', 1, 'C', 7), ('KRS1C08', 1, 'C', 8);

-- =============================================
-- 17. INSERT DATA FILM
-- =============================================
-- =============================================
-- INSERT DATA FILM BARU (Tambahan)
-- =============================================

-- =====================================================
-- INSERT DATA FILM KE TABEL web_bioskop film
-- =====================================================

    INSERT INTO `film` (`Judul_Film`, `Durasi`, `ID_Kategori`, `image`, `Director`, `Deskripsi`, `Rating_Usia`, `Trailer_URL`, `Rating`) VALUES
    ('John Wick: Chronicles', '02:15:00', 'AKSI', '1772629196_John_Wick_Chronicles.jpg', 'Chad Stahelski', 'Kisah legendaris sang pembunuh bayaran John Wick yang kembali dari masa pensiun untuk membalas dendam.', 'R', 'https://www.youtube.com/watch?v=2AUmvWm5ZDQ', 8.2),
    ('Home Alone', '01:45:00', 'KOMEDI', '1772631725_69a836ad217bc.jpg', 'John Hughes', 'Seorang anak kecil yang tertinggal di rumah saat liburan Natal harus melindungi rumahnya dari dua pencuri bodoh.', 'SU', 'https://www.youtube.com/watch?v=jEDaVHmw7r4', 7.9),
    ('Train to Busan', '01:58:00', 'HOROR', '1772635229_69a8445d438ca.jpg', 'Yeon Sang-ho', 'Penumpang kereta cepat menuju Busan harus berjuang mempertahankan hidup saat wabah zombie menyebar dengan cepat.', 'D', 'https://www.youtube.com/watch?v=SbP8_9iNwdA', 8.0),
    ('Avengers: Endgame', '03:01:00', 'AKSI', '1772676345_69a8e4f916d67.jpg', 'Anthony & Joe Russo', 'Para Avengers yang tersisa melakukan perjalanan waktu untuk mengumpulkan batu infinity dan mengalahkan Thanos.', 'R', 'https://www.youtube.com/watch?v=TcMBFSGVi1c', 8.4),
    ('Five Nights at Freddy''s', '01:50:00', 'HOROR', '1772683389_69a9007db2d3d.jpg', 'Emma Tammi', 'Sekuel dari film horor populer tentang mal mengerikan yang dihuni animatronik pembunuh.', 'D', 'https://www.youtube.com/watch?v=NQypHE9_Fm4', 6.8),
    ('The Shadow Edge', '02:10:00', 'AKSI', '1772708553_The_Shadow_Edge.jpg', 'Jackie Chan', 'Film aksi Jackie Chan terbaru dengan koreografi pertarungan spektakuler dan cerita penuh intrik.', 'R', 'https://www.youtube.com/watch?v=dDuzTlur3NU', 7.5),
    ('Nuremberg', '01:40:00', 'DRAMA', '1775797050_69d8833a95af3.jpg', 'James Vanderbilt', 'Berdasarkan kisah nyata pengadilan kejahatan perang Nazi pasca Perang Dunia II.', 'R', 'https://www.youtube.com/watch?v=WvAy9C-bipY&t=1s', 7.4),
    ('Blue Moon', '02:20:00', 'DRAMA', '1775797140_69d8839424433.jpg', 'Richard Linklater', 'Tentang satu malam dalam kehidupan penulis lirik terkenal di masa jayanya.', 'D', 'https://www.youtube.com/watch?v=qo7gRHip0lI', 7.4),
    ('The Substance', '02:20:00', 'HOROR', '1775825668_69d8f304a99fb.jpg', 'Coralie Fargeat', 'Sebuah film horor tubuh yang eksperimental tentang pencarian identitas dan kecantikan.', 'D', 'https://www.youtube.com/watch?v=LNlrGhBpYjc', 7.6),
    ('Zootopia 2', '01:50:00', 'ANIM', '1775825738_69d8f34a3f20b.jpg', 'Jared Bush', 'Judy Hoops dan Nick Wilde kembali dengan petualangan baru di kota Zootopia.', 'SU', 'https://www.youtube.com/watch?v=BjkIOU5PhyQ', 7.6),
    ('Legenda Kelam (Malin Kundang)', '02:00:00', 'DRAMA', '1775825832_69d8f3a848185.jpg', 'Lee Chang Hee', 'Adaptasi modern dari legenda Malin Kundang tentang kesombongan dan pengkhianatan anak kepada ibu.', 'D', 'https://www.youtube.com/watch?v=tu5kRtyIU3U', 7.3),
    ('Keadilan (The Verdict)', '01:55:00', 'KOMEDI', '1775825902_69d8f3ee786af.jpg', 'Muhadhly Acho', 'Empat detektif yang terus gagal dalam misi harus menyelesaikan kasus besar terakhir mereka.', 'R', 'https://www.youtube.com/watch?v=oXWmB0csH6U', 8.5),
    ('Agak Laen: Menyala Pantik!', '02:10:00', 'KOMEDI', '1775826000_69d8f450b0d68.jpg', 'Muhadhly Acho', 'Film komedi aksi yang menampilkan para komedian terkenal dengan cerita penuh tawa dan kejutan.', 'D', 'https://www.youtube.com/watch?v=QxgqR7yXxdA
    ', 8.0),
    ('The Amazing Spider-Man', '02:16:00', 'AKSI', '1777136510_69ecf37e46e39.jpg', 'Sam Raimi', 'Kisah Peter Parker yang berubah menjadi pahlawan super Spider-Man setelah digigit laba-laba radioaktif.', 'R', 'https://www.youtube.com/watch?v=-tnxzJ0SSOw&t=18s
    ', 7.4),
    ('Whisper of the Heart', '01:51:00', 'ANIM', '1777213531_69ee205b1f9fb.jpg', 'Yoshifumi Kondo', 'Sebuah film animasi Studio Ghibli tentang seorang gadis pencinta buku yang menemukan perpustakaan ajaib.', 'SU', 'https://www.youtube.com/watch?v=0pVkiod6V0U', 8.0),
    ('The Odyssey', '03:00:00', 'PETUALANG', '1777217859_69ee3143c060d.jpg', 'Christopher Nolan', 'Epik petualangan berdasarkan puisi karya Homer tentang prajurit Yunani yang berjuang pulang ke rumah.', 'R', 'https://www.youtube.com/watch?v=iklicVKcoI8&t=1s', 8.7),
    ('Masters of the Universe', '02:08:00', 'FANTASI', '1777217880_69ee31585bafc.jpg', 'Travis Knight', 'Adaptasi live-action dari He-Man dan petualangannya melawan musuh bebuyutannya.', 'R', 'https://www.youtube.com/watch?v=ZmEx7wQI6RY&t=1s', 7.2),
    ('Hard Boiled', '02:08:00', 'AKSI', '1777217907_69ee31733eb34.jpg', 'John Woo', 'Film aksi klasik John Woo tentang seorang polisi yang menyusup ke sindikat senjata api.', 'R', 'https://www.youtube.com/watch?v=_fcwFheTLdE&t=1s', 7.8),
    ('The Killer', '02:00:00', 'THRIL', '1777217925_69ee3185619ee.jpg', 'John Woo', 'Film terbaru John Woo tentang seorang pembunuh bayaran yang meragukan pilihannya.', 'R', 'https://www.youtube.com/watch?v=zgNOS5ofQhw', 7.3),
    ('Ikatan Darah', '02:00:00', 'DRAMA', '1777258691_69eed0c3155e2.jpg', 'Matthew Rosiana', 'Film drama tentang ikatan keluarga dan pengorbanan seorang ayah untuk anak-anaknya.', 'D', 'https://www.youtube.com/watch?v=uyiyfcyvA0A&t=1s', 7.0);

INSERT INTO jadwal (ID_Jadwal, Tanggal, Jam_Mulai, No_Studio, ID_Film) VALUES
-- John Wick: Chronicles (ID_Film = 1)
('JWL001', '2026-05-01', '13:00:00', 1, 1),
('JWL002', '2026-05-02', '15:30:00', 1, 1),
('JWL003', '2026-05-03', '19:00:00', 3, 1),
('JWL004', '2026-05-04', '14:00:00', 5, 1),
('JWL005', '2026-05-05', '20:00:00', 5, 1),

-- Home Alone (ID_Film = 2)
('KLR001', '2026-05-01', '14:00:00', 2, 2),
('KLR002', '2026-05-02', '19:30:00', 2, 2),
('KLR003', '2026-05-03', '16:00:00', 4, 2),
('KLR004', '2026-05-04', '20:30:00', 6, 2),
('KLR005', '2026-05-05', '18:00:00', 6, 2),

-- Train to Busan (ID_Film = 3)
('HBD001', '2026-05-01', '16:00:00', 3, 3),
('HBD002', '2026-05-02', '20:00:00', 3, 3),
('HBD003', '2026-05-03', '13:30:00', 7, 3),
('HBD004', '2026-05-04', '19:00:00', 8, 3),
('HBD005', '2026-05-05', '21:00:00', 8, 3),

-- Avengers: Endgame (ID_Film = 4)
('TTB001', '2026-05-01', '21:00:00', 7, 4),
('TTB002', '2026-05-03', '22:00:00', 7, 4),
('TTB003', '2026-05-05', '20:00:00', 3, 4),

-- Five Nights at Freddy's (ID_Film = 5)
('HMA001', '2026-05-01', '13:00:00', 1, 5),
('HMA002', '2026-05-03', '10:00:00', 3, 5),
('HMA003', '2026-05-05', '16:00:00', 1, 5),

-- The Shadow Edge (ID_Film = 6)
('JWK001', '2026-05-01', '19:00:00', 4, 6),
('JWK002', '2026-05-03', '20:30:00', 6, 6),
('JWK003', '2026-05-05', '14:00:00', 2, 6),

-- Nuremberg (ID_Film = 7)
('NRB001', '2026-05-02', '13:00:00', 3, 7),
('NRB002', '2026-05-04', '16:00:00', 5, 7),
('NRB003', '2026-05-05', '11:00:00', 3, 7),

-- Blue Moon (ID_Film = 8)
('BLM001', '2026-05-02', '20:00:00', 5, 8),
('BLM002', '2026-05-04', '21:00:00', 5, 8),
('BLM003', '2026-05-05', '22:00:00', 8, 8),

-- The Substance (ID_Film = 9)
('SUB001', '2026-05-02', '23:00:00', 7, 9),
('SUB002', '2026-05-04', '20:00:00', 7, 9),
('SUB003', '2026-05-05', '21:30:00', 7, 9),

-- Zootopia 2 (ID_Film = 10)
('ZTP001', '2026-05-01', '10:00:00', 1, 10),
('ZTP002', '2026-05-03', '11:00:00', 3, 10),
('ZTP003', '2026-05-05', '09:00:00', 2, 10),

-- Legenda Kelam (ID_Film = 11)
('LKL001', '2026-05-01', '15:00:00', 5, 11),
('LKL002', '2026-05-03', '17:00:00', 5, 11),
('LKL003', '2026-05-05', '19:00:00', 3, 11),

-- Keadilan (ID_Film = 12)
('KDL001', '2026-05-01', '16:00:00', 1, 12),
('KDL002', '2026-05-03', '14:00:00', 1, 12),
('KDL003', '2026-05-05', '18:00:00', 2, 12),

-- Agak Laen (ID_Film = 13)
('AGL001', '2026-05-01', '20:00:00', 8, 13),
('AGL002', '2026-05-03', '21:00:00', 8, 13),
('AGL003', '2026-05-05', '22:30:00', 8, 13),

-- The Amazing Spider-Man (ID_Film = 14)
('SPM001', '2026-05-02', '16:00:00', 4, 14),
('SPM002', '2026-05-04', '18:00:00', 4, 14),
('SPM003', '2026-05-05', '15:00:00', 6, 14),

-- Whisper of the Heart (ID_Film = 15)
('WSH001', '2026-05-02', '10:00:00', 3, 15),
('WSH002', '2026-05-04', '11:00:00', 1, 15),
('WSH003', '2026-05-05', '10:00:00', 3, 15),

-- The Odyssey (ID_Film = 16)
('ODY001', '2026-05-02', '19:00:00', 4, 16),
('ODY002', '2026-05-04', '20:00:00', 4, 16),
('ODY003', '2026-05-05', '17:00:00', 4, 16),

-- Masters of the Universe (ID_Film = 17)
('MOT001', '2026-05-02', '14:00:00', 6, 17),
('MOT002', '2026-05-04', '15:00:00', 2, 17),
('MOT003', '2026-05-05', '13:00:00', 6, 17),

-- Hard Boiled (ID_Film = 18)
('HBO001', '2026-05-02', '17:00:00', 3, 18),
('HBO002', '2026-05-04', '19:00:00', 5, 18),
('HBO003', '2026-05-05', '14:00:00', 1, 18),

-- The Killer (ID_Film = 19)
('TKR001', '2026-05-02', '21:00:00', 6, 19),
('TKR002', '2026-05-04', '22:00:00', 4, 19),
('TKR003', '2026-05-05', '20:00:00', 2, 19),

-- Ikatan Darah (ID_Film = 20)
('IKD001', '2026-05-02', '12:00:00', 2, 20),
('IKD002', '2026-05-04', '14:00:00', 3, 20),
('IKD003', '2026-05-05', '16:00:00', 5, 20);