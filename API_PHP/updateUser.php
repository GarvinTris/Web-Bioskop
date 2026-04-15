<?php
// updateUser.php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

// Ambil data dari GET (karena frontend pakai GET)
$id = $_GET['id_penonton'] ?? $_POST['id_penonton'] ?? null;
$nama = $_GET['nama_lengkap'] ?? $_POST['nama_lengkap'] ?? null;
$email = $_GET['email'] ?? $_POST['email'] ?? null;
$no_hp = $_GET['no_hp'] ?? $_POST['no_hp'] ?? null;
$password = $_GET['password'] ?? $_POST['password'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    $conn->close();
    exit;
}

if (!$nama || !$email || !$no_hp) {
    echo json_encode([
        "success" => false, 
        "error" => "Data tidak lengkap",
        "received" => compact('id', 'nama', 'email', 'no_hp')
    ]);
    $conn->close();
    exit;
}

$id = mysqli_real_escape_string($conn, $id);
$nama = mysqli_real_escape_string($conn, $nama);
$email = mysqli_real_escape_string($conn, $email);
$no_hp = mysqli_real_escape_string($conn, $no_hp);

// Cek apakah user ada
$check = $conn->query("SELECT ID_Penonton FROM penonton WHERE ID_Penonton = '$id'");
if (!$check || $check->num_rows == 0) {
    echo json_encode(["success" => false, "error" => "User dengan ID $id tidak ditemukan"]);
    $conn->close();
    exit;
}

// Update data
if (!empty($password) && strlen($password) >= 6) {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $hashedPassword = mysqli_real_escape_string($conn, $hashedPassword);
    $sql = "UPDATE penonton SET Nama_Lengkap='$nama', Email='$email', No_HP='$no_hp', Password='$hashedPassword' WHERE ID_Penonton='$id'";
} else {
    $sql = "UPDATE penonton SET Nama_Lengkap='$nama', Email='$email', No_HP='$no_hp' WHERE ID_Penonton='$id'";
}

if (mysqli_query($conn, $sql)) {
    echo json_encode(["success" => true, "message" => "User berhasil diupdate"]);
} else {
    echo json_encode(["success" => false, "error" => "Gagal update: " . mysqli_error($conn)]);
}

mysqli_close($conn);
?>