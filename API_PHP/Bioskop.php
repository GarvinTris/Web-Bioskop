<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 0);

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

if (isset($_GET['judul'])) {
    $judul = $conn->real_escape_string($_GET['judul']);
    
    // Ambil data film dengan JOIN kategori - HAPUS Rating_Usia
    $sqlFilm = "SELECT f.*, k.Nama_Kategori 
                FROM film f
                LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
                WHERE f.Judul_Film = ?";
    
    $stmt = $conn->prepare($sqlFilm);
    if (!$stmt) {
        echo json_encode(["error" => "Prepare statement gagal: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("s", $judul);
    $stmt->execute();
    $resultFilm = $stmt->get_result();

    $data = [];
    if ($film = $resultFilm->fetch_assoc()) {
        
        // Ambil jadwal film ini
        $sqlJadwal = "SELECT 
                        j.ID_Jadwal,
                        j.ID_Film,
                        j.Tanggal,
                        j.Jam_Mulai,
                        j.No_Studio,
                        s.Nama_Studio,
                        s.Harga_Tiket as Harga,
                        f.Judul_Film
                      FROM jadwal j
                      LEFT JOIN studio s ON j.No_Studio = s.No_Studio
                      LEFT JOIN film f ON j.ID_Film = f.ID_Film
                      WHERE j.ID_Film = ?
                      ORDER BY j.Tanggal, j.Jam_Mulai";
        
        $stmtJadwal = $conn->prepare($sqlJadwal);
        if (!$stmtJadwal) {
            echo json_encode(["error" => "Prepare jadwal gagal: " . $conn->error]);
            exit;
        }
        
        $stmtJadwal->bind_param("i", $film['ID_Film']);
        $stmtJadwal->execute();
        $resultJadwal = $stmtJadwal->get_result();

        $jadwal = [];
        while ($row = $resultJadwal->fetch_assoc()) {
            if ($row['Jam_Mulai']) {
                $jam_parts = explode(':', $row['Jam_Mulai']);
                $row['Jam_Mulai'] = $jam_parts[0] . ':' . $jam_parts[1];
            }
            $jadwal[] = $row;
        }
        
        $stmtJadwal->close();

        $film['jadwal'] = $jadwal;
        $data[] = $film;
    }
    
    $stmt->close();
    echo json_encode($data);
    
} else {
    // Ambil semua film - HAPUS Rating_Usia
    $sql = "SELECT f.*, k.Nama_Kategori 
            FROM film f
            LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
            ORDER BY f.ID_Film DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        echo json_encode(["error" => "Query gagal: " . $conn->error]);
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

$conn->close();
?>