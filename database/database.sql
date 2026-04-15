CREATE DATABASE IF NOT EXISTS web_bioskop;
USE web_bioskop;

-- =============================================
-- 2. TABEL KATEGORI
-- =============================================
CREATE TABLE kategori (
    ID_Kategori VARCHAR(20) PRIMARY KEY,
    Nama_Kategori VARCHAR(50) NOT NULL
);

-- =============================================
-- 3. INSERT DATA KATEGORI
-- =============================================
INSERT INTO kategori (ID_Kategori, Nama_Kategori) VALUES
('AKSI', 'Action'),
('ANIM', 'Animation'),
('DOKUM', 'Dokumenter'),
('DRAMA', 'Drama'),
('FANTASI', 'Fantasi'),
('HOROR', 'Horror'),
('KOMEDI', 'Komedi'),
('MYSTERY', 'Misteri'),
('PETUALANG', 'Petualangan'),
('ROMAN', 'Romance'),
('SCIFI', 'Science Fiction'),
('THRIL', 'Thriller');

-- =============================================
-- 4. TABEL FILM
-- =============================================
CREATE TABLE film (
    ID_Film INT(11) PRIMARY KEY AUTO_INCREMENT,
    Judul_Film VARCHAR(50) NOT NULL,
    Durasi TIME,
    ID_Kategori VARCHAR(20),
    image VARCHAR(255),
    Director VARCHAR(100),
    Deskripsi TEXT,
    Rating_Usia VARCHAR(10),
    Trailer_URL VARCHAR(255),
    Rating DECIMAL(2,1),
    FOREIGN KEY (ID_Kategori) REFERENCES kategori(ID_Kategori) ON DELETE SET NULL
);

-- =============================================
-- 5. INSERT DATA FILM
-- =============================================
INSERT INTO film (Judul_Film, Durasi, ID_Kategori, image, Director, Deskripsi, Rating_Usia, Trailer_URL, Rating) VALUES
('Mission: Impossible - The Final Reckoning', '02:43:00', 'AKSI', '17757696709_69d881e58b43e.jpg', 'Christopher McQuarrie', 'Ethan Hunt dan tim IMF-nya kembali untuk menghadap...', 'R', 'https://youtu.be/fsQgc9pCyDU?si=mSgsab1DE2dLso83', 8.4),
('The Fantastic Four: First Steps', '02:00:00', 'AKSI', '17757698222_69d882567a02e.jpg', 'Matt Shakman', 'Berlatar di versi alternatif tahun 1960-an, film i...', 'R', 'https://youtu.be/18QQWa5c7aO?si=Jbw7nvnn22bNgNISD', 7.5),
('Eddington', '02:30:00', 'DRAMA', '17757697619_69d882b6397c1.jpg', 'Ari Aster', 'Sebuah komedi gelap yang mengambil latar di kota k...', 'D', 'https://youtu.be/oL6jZqExlIk?si=VFui82XmxxzwNoBF', 7.8),
('Nuremberg', '01:40:00', 'DRAMA', '17757697140_69d8839424433.jpg', 'Richard Linklater', 'Tentang satu malam dalam kehidupan penulis lirik B...', 'D', 'https://youtu.be/qo7gRHip0II?si=iadAog1CQMifHsh', 7.4),
('Blue Moon', '02:20:00', 'HOROR', '17757682568_69d87403a95f3.jpg', 'Coralie Fargeat', 'Film horor tubuh yang eksperimental tentang kecant...', 'D', 'https://youtu.be/jBkloU5PhyQ?si=4_tXu3OdhQLgu-md', 7.6),
('The Substance', '01:45:00', 'ANIM', '17757682568_69d87403a95f3.jpg', 'Coralie Fargeat', 'Judy Hoops dan Nick Wilde harus melacak Gary, seek...', 'SU', 'https://youtu.be/BjkLOU5PhyQ?si=4_tXu3OdhQLgu-md', 7.6),
('Zootopia 2', '01:50:00', 'HOROR', '17757682568_69d87403a95f3.jpg', 'Kevin Rahardjo', 'Seorang pemain yang selamat dari kecelakaan, hidup...', 'D', 'https://youtu.be/wzqkVJfnzv0?si=gOVomkc938HsdU5i', 7.3),
('Legenda Kelam Mendidik (The Verdict)', '02:00:00', 'DRAMA', '17757682592_69d87ce786af.jpg', 'Lee Chang Hee', 'Seorang pemain yang mendidik kelam mendidik...', 'D', 'https://youtu.be/oXVWmB0csH6U?si=FW_awk1W1Wd7-pTK', 7.3),
('Keadilan (The Verdict)', '01:55:00', 'KOMEDI', '17757682600_69d84f50b0d68.jpg', 'Muhadkhly Acho', 'Empat detektif yang terus gagal dalam misi harus m...', 'R', 'https://youtu.be/fYjJ6zP2Cp0?si=Zp2Bnrofm66VO481', 8.5);

-- =============================================
-- 6. TABEL STUDIO
-- =============================================
CREATE TABLE studio (
    No_Studio INT(11) PRIMARY KEY,
    Nama_Studio VARCHAR(50) NOT NULL,
    Harga_Tiket INT(11) NOT NULL
);

INSERT INTO studio (No_Studio, Nama_Studio, Harga_Tiket) VALUES
(1, 'Reguler 1', 50000),
(2, 'Reguler 2', 50000),
(3, 'Reguler 3', 50000),
(4, 'IMAX', 75000),
(5, 'Premiere', 85000),
(6, 'Dolby Atmos', 100000),
(7, '3D', 65000),
(8, 'VIP', 150000),
(9, 'IMAX 3D', 95000);

-- =============================================
-- 7. TABEL KURSI
-- =============================================
CREATE TABLE kursi (
    ID_Kursi VARCHAR(20) PRIMARY KEY,
    No_Studio INT(11) NOT NULL,
    Baris VARCHAR(5) NOT NULL,
    Nomor_Kursi INT(3) NOT NULL,
    FOREIGN KEY (No_Studio) REFERENCES studio(No_Studio) ON DELETE CASCADE,
    UNIQUE KEY unique_kursi (No_Studio, Baris, Nomor_Kursi)
);

INSERT INTO kursi (ID_Kursi, No_Studio, Baris, Nomor_Kursi) VALUES
-- Studio 1, Baris A, Kursi 1-8
('KRS1A01', 1, 'A', 1),
('KRS1A02', 1, 'A', 2),
('KRS1A03', 1, 'A', 3),
('KRS1A04', 1, 'A', 4),
('KRS1A05', 1, 'A', 5),
('KRS1A06', 1, 'A', 6),
('KRS1A07', 1, 'A', 7),
('KRS1A08', 1, 'A', 8),

-- Studio 1, Baris B, Kursi 1-8
('KRS1B01', 1, 'B', 1),
('KRS1B02', 1, 'B', 2),
('KRS1B03', 1, 'B', 3),
('KRS1B04', 1, 'B', 4),
('KRS1B05', 1, 'B', 5),
('KRS1B06', 1, 'B', 6),
('KRS1B07', 1, 'B', 7),
('KRS1B08', 1, 'B', 8),

-- Studio 1, Baris C, Kursi 1-8
('KRS1C01', 1, 'C', 1),
('KRS1C02', 1, 'C', 2),
('KRS1C03', 1, 'C', 3),
('KRS1C04', 1, 'C', 4),
('KRS1C05', 1, 'C', 5),
('KRS1C06', 1, 'C', 6),
('KRS1C07', 1, 'C', 7),
('KRS1C08', 1, 'C', 8);

-- =============================================
-- 8. TABEL PENONTON
-- =============================================
CREATE TABLE penonton (
    ID_Penonton VARCHAR(20) PRIMARY KEY,
    Email VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Alamat TEXT,
    No_HP VARCHAR(15),
    Jenis_Kelamin VARCHAR(10),
    Nama_Lengkap VARCHAR(100) NOT NULL,
    Tanggal_Daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. TABEL JADWAL
-- =============================================
CREATE TABLE jadwal (
    ID_Jadwal VARCHAR(20) PRIMARY KEY,
    Tanggal DATE NOT NULL,
    Jam_Mulai TIME NOT NULL,
    No_Studio INT(11) NOT NULL,
    ID_Film INT(11) NOT NULL,
    FOREIGN KEY (No_Studio) REFERENCES studio(No_Studio) ON DELETE CASCADE,
    FOREIGN KEY (ID_Film) REFERENCES film(ID_Film) ON DELETE CASCADE
);

-- =============================================
-- 10. TABEL TIKET
-- =============================================
CREATE TABLE tiket (
    ID_Tiket VARCHAR(20) PRIMARY KEY,
    Stok INT(11) NOT NULL,
    Harga INT(11) NOT NULL,
    ID_Kursi VARCHAR(20) NOT NULL,
    ID_Jadwal VARCHAR(20) NOT NULL,
    Status VARCHAR(20) DEFAULT 'tersedia',
    FOREIGN KEY (ID_Kursi) REFERENCES kursi(ID_Kursi) ON DELETE CASCADE,
    FOREIGN KEY (ID_Jadwal) REFERENCES jadwal(ID_Jadwal) ON DELETE CASCADE,
    UNIQUE KEY unique_tiket (ID_Jadwal, ID_Kursi)
);

-- =============================================
-- 11. TABEL TRANSAKSI
-- =============================================
CREATE TABLE transaksi (
    ID_Transaksi VARCHAR(20) PRIMARY KEY,
    Jumlah INT(11) NOT NULL,
    Total_Harga INT(11) NOT NULL,
    Metode_Pembayaran VARCHAR(50) NOT NULL,
    Tanggal_Pemesanan DATE NOT NULL,
    ID_Jadwal VARCHAR(20) NOT NULL,
    Kursi TEXT NOT NULL,
    ID_Penonton VARCHAR(20) NOT NULL,
    FOREIGN KEY (ID_Jadwal) REFERENCES jadwal(ID_Jadwal) ON DELETE CASCADE,
    FOREIGN KEY (ID_Penonton) REFERENCES penonton(ID_Penonton) ON DELETE CASCADE
);

-- =============================================
-- 12. TABEL TRAILER
-- =============================================
CREATE TABLE trailer (
    ID_Trailer INT PRIMARY KEY AUTO_INCREMENT,
    ID_Film INT NOT NULL,
    Link_Video VARCHAR(255) NOT NULL,
    is_Active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Film) REFERENCES film(ID_Film) ON DELETE CASCADE
);

-- Tambahkan indeks untuk performa query
ALTER TABLE penonton ADD INDEX idx_email (Email);
ALTER TABLE penonton ADD INDEX idx_no_hp (No_HP);
ALTER TABLE transaksi ADD INDEX idx_id_penonton (ID_Penonton);
ALTER TABLE transaksi ADD INDEX idx_id_jadwal (ID_Jadwal);
ALTER TABLE jadwal ADD INDEX idx_id_film (ID_Film);
ALTER TABLE jadwal ADD INDEX idx_tanggal (Tanggal);
ALTER TABLE film ADD INDEX idx_id_kategori (ID_Kategori);
ALTER TABLE tiket ADD INDEX idx_id_jadwal (ID_Jadwal);
ALTER TABLE tiket ADD INDEX idx_id_kursi (ID_Kursi);