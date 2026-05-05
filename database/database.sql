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
    Rating        DECIMAL(2,1) CHECK (Rating BETWEEN 0 AND 10),
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
-- 9. TABEL TIKET (Stok dihapus, cukup Status)
-- =============================================
CREATE TABLE tiket (
    ID_Tiket      VARCHAR(20) PRIMARY KEY,
    Harga         INT(11) NOT NULL,
    ID_Kursi      VARCHAR(20) NOT NULL,
    ID_Jadwal     VARCHAR(20) NOT NULL,
    Status        ENUM('tersedia', 'terjual', 'dipesan') DEFAULT 'tersedia',
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
-- TABEL PASSWORD RESETS
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
-- 14. INSERT DATA ADMIN
-- =============================================
INSERT INTO admin (ID_Admin, Nama_Lengkap, Email, Password, Created_At) 
VALUES (
    'ADM001', 
    'Administrator', 
    'admin@cinema.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NOW()
);

-- =============================================
-- 15. INSERT DATA KATEGORI
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
-- 16. INSERT DATA STUDIO
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
-- 17. GENERATE KURSI UNTUK SEMUA STUDIO (1-9)
-- =============================================
DELIMITER $$
CREATE PROCEDURE GenerateAllSeats()
BEGIN
    DECLARE studio_num INT DEFAULT 1;
    DECLARE baris_char CHAR(1);
    DECLARE nomor INT;
    
    WHILE studio_num <= 9 DO
        SET baris_char = 'A';
        WHILE baris_char <= 'C' DO
            SET nomor = 1;
            WHILE nomor <= 8 DO
                INSERT INTO kursi (ID_Kursi, No_Studio, Baris, Nomor_Kursi)
                VALUES (CONCAT('KRS', studio_num, baris_char, LPAD(nomor, 2, '0')), 
                        studio_num, baris_char, nomor)
                ON DUPLICATE KEY UPDATE ID_Kursi = ID_Kursi;
                SET nomor = nomor + 1;
            END WHILE;
            SET baris_char = CHAR(ASCII(baris_char) + 1);
        END WHILE;
        SET studio_num = studio_num + 1;
    END WHILE;
END$$
DELIMITER ;

CALL GenerateAllSeats();
DROP PROCEDURE GenerateAllSeats;

-- =============================================
-- 18. INSERT DATA FILM
-- =============================================
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
    ('Agak Laen: Menyala Pantik!', '02:10:00', 'KOMEDI', '1775826000_69d8f450b0d68.jpg', 'Muhadhly Acho', 'Film komedi aksi yang menampilkan para komedian terkenal dengan cerita penuh tawa dan kejutan.', 'D', 'https://www.youtube.com/watch?v=QxgqR7yXxdA', 8.0),
    ('The Amazing Spider-Man', '02:16:00', 'AKSI', '1777136510_69ecf37e46e39.jpg', 'Sam Raimi', 'Kisah Peter Parker yang berubah menjadi pahlawan super Spider-Man setelah digigit laba-laba radioaktif.', 'R', 'https://www.youtube.com/watch?v=-tnxzJ0SSOw', 7.4),
    ('Whisper of the Heart', '01:51:00', 'ANIM', '1777213531_69ee205b1f9fb.jpg', 'Yoshifumi Kondo', 'Sebuah film animasi Studio Ghibli tentang seorang gadis pencinta buku yang menemukan perpustakaan ajaib.', 'SU', 'https://www.youtube.com/watch?v=0pVkiod6V0U', 8.0),
    ('The Odyssey', '03:00:00', 'PETUALANG', '1777217859_69ee3143c060d.jpg', 'Christopher Nolan', 'Epik petualangan berdasarkan puisi karya Homer tentang prajurit Yunani yang berjuang pulang ke rumah.', 'R', 'https://www.youtube.com/watch?v=iklicVKcoI8', 8.7),
    ('Masters of the Universe', '02:08:00', 'FANTASI', '1777217880_69ee31585bafc.jpg', 'Travis Knight', 'Adaptasi live-action dari He-Man dan petualangannya melawan musuh bebuyutannya.', 'R', 'https://www.youtube.com/watch?v=ZmEx7wQI6RY', 7.2),
    ('Hard Boiled', '02:08:00', 'AKSI', '1777217907_69ee31733eb34.jpg', 'John Woo', 'Film aksi klasik John Woo tentang seorang polisi yang menyusup ke sindikat senjata api.', 'R', 'https://www.youtube.com/watch?v=_fcwFheTLdE', 7.8),
    ('The Killer', '02:00:00', 'THRIL', '1777217925_69ee3185619ee.jpg', 'John Woo', 'Film terbaru John Woo tentang seorang pembunuh bayaran yang meragukan pilihannya.', 'R', 'https://www.youtube.com/watch?v=zgNOS5ofQhw', 7.3),
    ('Ikatan Darah', '02:00:00', 'DRAMA', '1777258691_69eed0c3155e2.jpg', 'Matthew Rosiana', 'Film drama tentang ikatan keluarga dan pengorbanan seorang ayah untuk anak-anaknya.', 'D', 'https://www.youtube.com/watch?v=uyiyfcyvA0A', 7.0);

-- =============================================
-- 19. INSERT JADWAL (sudah diaktifkan semua)
-- =============================================
INSERT INTO jadwal (ID_Jadwal, Tanggal, Jam_Mulai, No_Studio, ID_Film) VALUES
('JDWL001', '2026-05-01', '13:00:00', 1, 1),
('JDWL002', '2026-05-02', '15:30:00', 1, 1),
('JDWL003', '2026-05-03', '19:00:00', 3, 1),
('JDWL004', '2026-05-04', '14:00:00', 5, 1),
('JDWL005', '2026-05-05', '20:00:00', 5, 1),
('JDWL006', '2026-05-01', '14:00:00', 2, 2),
('JDWL007', '2026-05-02', '19:30:00', 2, 2),
('JDWL008', '2026-05-03', '16:00:00', 4, 2),
('JDWL009', '2026-05-04', '20:30:00', 6, 2),
('JDWL010', '2026-05-05', '18:00:00', 6, 2),
('JDWL011', '2026-05-01', '16:00:00', 3, 3),
('JDWL012', '2026-05-02', '20:00:00', 3, 3),
('JDWL013', '2026-05-03', '13:30:00', 7, 3),
('JDWL014', '2026-05-04', '19:00:00', 8, 3),
('JDWL015', '2026-05-05', '21:00:00', 8, 3),
('JDWL016', '2026-05-01', '21:00:00', 7, 4),
('JDWL017', '2026-05-03', '22:00:00', 7, 4),
('JDWL018', '2026-05-05', '20:00:00', 3, 4),
('JDWL019', '2026-05-01', '13:00:00', 1, 5),
('JDWL020', '2026-05-03', '10:00:00', 3, 5),
('JDWL021', '2026-05-05', '16:00:00', 1, 5),
('JDWL022', '2026-05-01', '19:00:00', 4, 6),
('JDWL023', '2026-05-03', '20:30:00', 6, 6),
('JDWL024', '2026-05-05', '14:00:00', 2, 6),
('JDWL025', '2026-05-02', '13:00:00', 3, 7),
('JDWL026', '2026-05-04', '16:00:00', 5, 7),
('JDWL027', '2026-05-05', '11:00:00', 3, 7),
('JDWL028', '2026-05-02', '20:00:00', 5, 8),
('JDWL029', '2026-05-04', '21:00:00', 5, 8),
('JDWL030', '2026-05-05', '22:00:00', 8, 8),
('JDWL031', '2026-05-02', '23:00:00', 7, 9),
('JDWL032', '2026-05-04', '20:00:00', 7, 9),
('JDWL033', '2026-05-05', '21:30:00', 7, 9),
('JDWL034', '2026-05-01', '10:00:00', 1, 10),
('JDWL035', '2026-05-03', '11:00:00', 3, 10),
('JDWL036', '2026-05-05', '09:00:00', 2, 10),
('JDWL037', '2026-05-01', '15:00:00', 5, 11),
('JDWL038', '2026-05-03', '17:00:00', 5, 11),
('JDWL039', '2026-05-05', '19:00:00', 3, 11),
('JDWL040', '2026-05-01', '16:00:00', 1, 12),
('JDWL041', '2026-05-03', '14:00:00', 1, 12),
('JDWL042', '2026-05-05', '18:00:00', 2, 12),
('JDWL043', '2026-05-01', '20:00:00', 8, 13),
('JDWL044', '2026-05-03', '21:00:00', 8, 13),
('JDWL045', '2026-05-05', '22:30:00', 8, 13),
('JDWL046', '2026-05-02', '16:00:00', 4, 14),
('JDWL047', '2026-05-04', '18:00:00', 4, 14),
('JDWL048', '2026-05-05', '15:00:00', 6, 14),
('JDWL049', '2026-05-02', '10:00:00', 3, 15),
('JDWL050', '2026-05-04', '11:00:00', 1, 15),
('JDWL051', '2026-05-05', '10:00:00', 3, 15),
('JDWL052', '2026-05-02', '19:00:00', 4, 16),
('JDWL053', '2026-05-04', '20:00:00', 4, 16),
('JDWL054', '2026-05-05', '17:00:00', 4, 16),
('JDWL055', '2026-05-02', '14:00:00', 6, 17),
('JDWL056', '2026-05-04', '15:00:00', 2, 17),
('JDWL057', '2026-05-05', '13:00:00', 6, 17),
('JDWL058', '2026-05-02', '17:00:00', 3, 18),
('JDWL059', '2026-05-04', '19:00:00', 5, 18),
('JDWL060', '2026-05-05', '14:00:00', 1, 18),
('JDWL061', '2026-05-02', '21:00:00', 6, 19),
('JDWL062', '2026-05-04', '22:00:00', 4, 19),
('JDWL063', '2026-05-05', '20:00:00', 2, 19),
('JDWL064', '2026-05-02', '12:00:00', 2, 20),
('JDWL065', '2026-05-04', '14:00:00', 3, 20),
('JDWL066', '2026-05-05', '16:00:00', 5, 20);

-- =============================================
-- 20. GENERATE TIKET UNTUK SEMUA JADWAL & KURSI
-- =============================================
INSERT INTO tiket (ID_Tiket, Harga, ID_Kursi, ID_Jadwal, Status)
SELECT CONCAT('TKT', j.ID_Jadwal, k.ID_Kursi),
       s.Harga_Tiket,
       k.ID_Kursi,
       j.ID_Jadwal,
       'tersedia'
FROM jadwal j
JOIN studio s ON j.No_Studio = s.No_Studio
CROSS JOIN kursi k
WHERE k.No_Studio = j.No_Studio
ON DUPLICATE KEY UPDATE ID_Tiket = ID_Tiket;

-- =============================================
-- 21. TRIGGER UPDATE STATUS TIKET SAAT TRANSAKSI
-- =============================================
DELIMITER $$
CREATE TRIGGER after_transaksi_insert
AFTER INSERT ON transaksi
FOR EACH ROW
BEGIN
    DECLARE kursi_list TEXT;
    DECLARE kursi_item VARCHAR(20);
    DECLARE pos INT;
    
    SET kursi_list = NEW.Kursi;
    
    WHILE LENGTH(kursi_list) > 0 DO
        SET pos = LOCATE(',', kursi_list);
        IF pos > 0 THEN
            SET kursi_item = TRIM(SUBSTRING(kursi_list, 1, pos - 1));
            SET kursi_list = SUBSTRING(kursi_list, pos + 1);
        ELSE
            SET kursi_item = TRIM(kursi_list);
            SET kursi_list = '';
        END IF;
        
        UPDATE tiket 
        SET Status = 'terjual'
        WHERE ID_Kursi = kursi_item 
          AND ID_Jadwal = NEW.ID_Jadwal;
    END WHILE;
END$$
DELIMITER ;

-- =============================================
-- 22. TRIGGER UPDATE Last_Login ADMIN
-- =============================================
DELIMITER $$
CREATE TRIGGER before_admin_login
BEFORE UPDATE ON admin
FOR EACH ROW
BEGIN
    IF NEW.Last_Login IS NOT NULL AND OLD.Last_Login IS NULL THEN
        SET NEW.Last_Login = NOW();
    END IF;
END$$
DELIMITER ;

-- =============================================
-- SELESAI
-- =============================================