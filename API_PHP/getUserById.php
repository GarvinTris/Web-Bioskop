<?php
// getUserById.php
require_once 'database.php';
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode([
        "success" => false, 
        "error" => "ID user tidak ditemukan"
    ]);
    exit;
}

$id = $_GET['id'];

// Query user dengan prepared statement
$sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
        FROM penonton WHERE ID_Penonton = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode([
        "success" => false, 
        "error" => "Query error: " . $conn->error
    ]);
    $stmt->close();
    exit;
}

if ($result->num_rows == 0) {
    echo json_encode([
        "success" => false, 
        "error" => "User tidak ditemukan dengan ID: " . $id
    ]);
    $stmt->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Ambil statistik transaksi dengan prepared statement
$transaksiSql = "SELECT COUNT(*) as total_transaksi, COALESCE(SUM(Total_Harga), 0) as total_pengeluaran
                 FROM transaksi WHERE ID_Penonton = ?";
$stmt2 = $conn->prepare($transaksiSql);
$stmt2->bind_param("s", $id);
$stmt2->execute();
$transResult = $stmt2->get_result();

if ($transResult && $transResult->num_rows > 0) {
    $transData = $transResult->fetch_assoc();
    $user['total_transaksi'] = (int)($transData['total_transaksi'] ?? 0);
    $user['total_pengeluaran'] = (int)($transData['total_pengeluaran'] ?? 0);
} else {
    $user['total_transaksi'] = 0;
    $user['total_pengeluaran'] = 0;
}
$stmt2->close();

echo json_encode([
    "success" => true, 
    "user" => $user
]);
?>