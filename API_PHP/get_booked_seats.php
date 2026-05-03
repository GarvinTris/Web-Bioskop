<?php
// get_booked_seats.php - FIXED VERSION
require_once 'database.php';

// Set header untuk JSON response
header('Content-Type: application/json');

// Cek parameter
if (!isset($_GET['id_jadwal']) || empty($_GET['id_jadwal'])) {
    echo json_encode([
        "success" => false, 
        "error" => "ID Jadwal tidak ditemukan",
        "booked_seats" => []
    ]);
    exit;
}

$id_jadwal = $_GET['id_jadwal'];

// Validasi ID Jadwal (pastikan formatnya benar)
if (!preg_match('/^[A-Z0-9]+$/i', $id_jadwal)) {
    echo json_encode([
        "success" => false, 
        "error" => "Format ID Jadwal tidak valid",
        "booked_seats" => []
    ]);
    exit;
}

// Query untuk mengambil kursi yang sudah terjual
$query = "SELECT k.Baris, k.Nomor_Kursi 
          FROM tiket t
          INNER JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
          WHERE t.ID_Jadwal = ? AND t.Status = 'terjual'
          ORDER BY k.Baris, k.Nomor_Kursi";

$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode([
        "success" => false, 
        "error" => "Database error: " . $conn->error,
        "booked_seats" => []
    ]);
    exit;
}

$stmt->bind_param("s", $id_jadwal);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false, 
        "error" => "Execute failed: " . $stmt->error,
        "booked_seats" => []
    ]);
    $stmt->close();
    exit;
}

$result = $stmt->get_result();

$bookedSeats = [];
while ($row = $result->fetch_assoc()) {
    $bookedSeats[] = $row['Baris'] . $row['Nomor_Kursi'];
}

$stmt->close();

// Kirim response sukses
echo json_encode([
    "success" => true, 
    "booked_seats" => $bookedSeats,
    "total_booked" => count($bookedSeats),
    "id_jadwal" => $id_jadwal
]);
?>