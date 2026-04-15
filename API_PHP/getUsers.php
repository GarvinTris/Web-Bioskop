<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Koneksi database
$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "error" => "Database gagal konek: " . $conn->connect_error
    ]);
    exit;
}

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// Cek tabel penonton
$table_check = $conn->query("SHOW TABLES LIKE 'penonton'");
if ($table_check->num_rows == 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tabel penonton tidak ditemukan"
    ]);
    $conn->close();
    exit;
}

// Query dengan pencarian
if (!empty($search)) {
    $search = $conn->real_escape_string($search);
    $sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
            FROM penonton 
            WHERE Nama_Lengkap LIKE '%$search%' 
               OR Email LIKE '%$search%' 
               OR No_HP LIKE '%$search%'
            ORDER BY Tanggal_Daftar DESC";
} else {
    $sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
            FROM penonton 
            ORDER BY Tanggal_Daftar DESC";
}

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false, 
        "error" => "Query error: " . $conn->error
    ]);
    $conn->close();
    exit;
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "success" => true, 
    "users" => $users,
    "total" => count($users)
]);

$conn->close();
?>