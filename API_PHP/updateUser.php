<?php
// updateUser.php
require_once 'database.php';
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ambil data dari GET atau POST
$id = $_GET['id_penonton'] ?? $_POST['id_penonton'] ?? null;
$nama = $_GET['nama_lengkap'] ?? $_POST['nama_lengkap'] ?? null;
$email = $_GET['email'] ?? $_POST['email'] ?? null;
$no_hp = $_GET['no_hp'] ?? $_POST['no_hp'] ?? null;
$password = $_GET['password'] ?? $_POST['password'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    exit;
}

if (!$nama || !$email || !$no_hp) {
    echo json_encode([
        "success" => false, 
        "error" => "Data tidak lengkap",
        "received" => compact('id', 'nama', 'email', 'no_hp')
    ]);
    exit;
}

// Cek apakah user ada dengan prepared statement
$checkQuery = "SELECT ID_Penonton FROM penonton WHERE ID_Penonton = ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("s", $id);
$checkStmt->execute();
$check = $checkStmt->get_result();

if (!$check || $check->num_rows == 0) {
    $checkStmt->close();
    echo json_encode(["success" => false, "error" => "User dengan ID $id tidak ditemukan"]);
    exit;
}
$checkStmt->close();

// Update data dengan prepared statement
if (!empty($password) && strlen($password) >= 6) {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "UPDATE penonton SET Nama_Lengkap=?, Email=?, No_HP=?, Password=? WHERE ID_Penonton=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $nama, $email, $no_hp, $hashedPassword, $id);
} else {
    $sql = "UPDATE penonton SET Nama_Lengkap=?, Email=?, No_HP=? WHERE ID_Penonton=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $nama, $email, $no_hp, $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User berhasil diupdate"]);
} else {
    echo json_encode(["success" => false, "error" => "Gagal update: " . $stmt->error]);
}

$stmt->close();
?>