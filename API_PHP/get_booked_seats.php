<?php
// get_booked_seats.php
require_once 'database.php';

// 🔴 HAPUS semua header manual! database.php sudah mengatur CORS
// HAPUS: header("Access-Control-Allow-Origin: *");
// HAPUS: header("Content-Type: application/json");
// HAPUS: $conn = new mysqli(...);

if (isset($_GET['id_jadwal'])) {
    $id_jadwal = $_GET['id_jadwal'];
    
    $query = "SELECT k.Baris, k.Nomor_Kursi 
              FROM tiket t
              JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
              WHERE t.ID_Jadwal = ? AND t.Status = 'terjual'";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $id_jadwal);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookedSeats = [];
    while ($row = $result->fetch_assoc()) {
        $bookedSeats[] = $row['Baris'] . $row['Nomor_Kursi'];
    }
    
    echo json_encode(["success" => true, "booked_seats" => $bookedSeats]);
} else {
    echo json_encode(["success" => false, "error" => "ID Jadwal tidak ditemukan"]);
}

// Jangan tutup koneksi karena sudah di database.php
?>