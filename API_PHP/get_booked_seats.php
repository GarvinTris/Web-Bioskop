<?php
// get_booked_seats.php - FIXED VERSION
require_once 'database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

if (!isset($_GET['id_jadwal']) || empty($_GET['id_jadwal'])) {
    echo json_encode(["success" => false, "error" => "ID Jadwal tidak ditemukan", "booked_seats" => []]);
    exit;
}

$id_jadwal = $_GET['id_jadwal'];

$query = "SELECT CONCAT(k.Baris, k.Nomor_Kursi) as seat_name
          FROM tiket t
          INNER JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
          WHERE t.ID_Jadwal = ? AND t.Status = 'terjual'
          ORDER BY k.Baris, k.Nomor_Kursi";

$stmt = $conn->prepare($query);
$stmt->bind_param("s", $id_jadwal);
$stmt->execute();
$result = $stmt->get_result();

$bookedSeats = [];
while ($row = $result->fetch_assoc()) {
    $bookedSeats[] = $row['seat_name'];
}
$stmt->close();

// Debug log
error_log("get_booked_seats.php - ID_Jadwal: $id_jadwal, Booked seats: " . print_r($bookedSeats, true));

echo json_encode([
    "success" => true,
    "booked_seats" => $bookedSeats,
    "total_booked" => count($bookedSeats),
    "id_jadwal" => $id_jadwal
]);
?>