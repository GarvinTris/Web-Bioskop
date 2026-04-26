<?php
require_once 'database.php';
// tambah_jadwal.php - HAPUS kolom Harga (tidak ada di tabel jadwal)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_jadwal = $_POST['ID_Jadwal'] ?? null;
    $id_film = $_POST['ID_Film'] ?? null;
    $tanggal = $_POST['Tanggal'] ?? null;
    $jam_mulai = $_POST['Jam_Mulai'] ?? null;
    $no_studio = $_POST['No_Studio'] ?? null;
    
    // Validasi (HARGA TIDAK DIPERLUKAN - ambil dari tabel studio)
    if (!$id_film || !$tanggal || !$jam_mulai || !$no_studio) {
        echo json_encode(["error" => "Semua field harus diisi", "success" => false]);
        exit;
    }
    
    if ($id_jadwal) {
        // Update - tanpa kolom Harga
        $query = "UPDATE jadwal SET 
                  ID_Film = ?, 
                  Tanggal = ?, 
                  Jam_Mulai = ?, 
                  No_Studio = ? 
                  WHERE ID_Jadwal = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $id_film, $tanggal, $jam_mulai, $no_studio, $id_jadwal);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Jadwal berhasil diupdate"]);
        } else {
            echo json_encode(["error" => "Gagal update jadwal: " . $stmt->error, "success" => false]);
        }
        $stmt->close();
    } else {
        // Insert new schedule
        $query_id = "SELECT MAX(CAST(SUBSTRING(ID_Jadwal, 5) AS UNSIGNED)) as max_id FROM jadwal";
        $result = $conn->query($query_id);
        $row = $result->fetch_assoc();
        $next_id = ($row['max_id'] ?? 0) + 1;
        $new_id = "JDWL" . str_pad($next_id, 3, "0", STR_PAD_LEFT);
        
        $query = "INSERT INTO jadwal (ID_Jadwal, ID_Film, Tanggal, Jam_Mulai, No_Studio) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $new_id, $id_film, $tanggal, $jam_mulai, $no_studio);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Jadwal berhasil ditambahkan", "id" => $new_id]);
        } else {
            echo json_encode(["error" => "Gagal tambah jadwal: " . $stmt->error, "success" => false]);
        }
        $stmt->close();
    }
}

$conn->close();
?>