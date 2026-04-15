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

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode([
        "success" => false, 
        "error" => "ID user tidak ditemukan"
    ]);
    $conn->close();
    exit;
}

$id = $conn->real_escape_string($_GET['id']);

// Cek dulu apakah tabel penonton ada
$table_check = $conn->query("SHOW TABLES LIKE 'penonton'");
if ($table_check->num_rows == 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Tabel penonton tidak ditemukan di database web_bioskop"
    ]);
    $conn->close();
    exit;
}

// Query user - gunakan kolom yang ada di tabel penonton
$sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
        FROM penonton WHERE ID_Penonton = '$id'";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false, 
        "error" => "Query error: " . $conn->error
    ]);
    $conn->close();
    exit;
}

if ($result->num_rows == 0) {
    echo json_encode([
        "success" => false, 
        "error" => "User tidak ditemukan dengan ID: " . $id
    ]);
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Ambil statistik transaksi dari tabel transaksi (kolom: ID_Transaksi, ID_Penonton, Total_Harga)
$transaksiSql = "SELECT COUNT(*) as total_transaksi, COALESCE(SUM(Total_Harga), 0) as total_pengeluaran
                 FROM transaksi WHERE ID_Penonton = '$id'";
$transResult = $conn->query($transaksiSql);

if ($transResult && $transResult->num_rows > 0) {
    $transData = $transResult->fetch_assoc();
    $user['total_transaksi'] = (int)($transData['total_transaksi'] ?? 0);
    $user['total_pengeluaran'] = (int)($transData['total_pengeluaran'] ?? 0);
} else {
    $user['total_transaksi'] = 0;
    $user['total_pengeluaran'] = 0;
}

echo json_encode([
    "success" => true, 
    "user" => $user
]);

$conn->close();
?>