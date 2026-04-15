<?php
// deleteUser.php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
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

// Ambil ID dari berbagai method
$id = null;

// Method GET (untuk testing di browser)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
}
// Method DELETE
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Coba dari GET parameter dulu
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } 
    // Coba dari raw input
    else {
        $input = file_get_contents("php://input");
        parse_str($input, $delete_vars);
        $id = $delete_vars['id'] ?? null;
        
        // Jika masih null, coba dari JSON
        if (!$id) {
            $json = json_decode($input, true);
            $id = $json['id'] ?? null;
        }
    }
}
// Method POST
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? $_POST['id'] ?? null;
}

// Log untuk debugging
error_log("DeleteUser - Method: " . $_SERVER['REQUEST_METHOD'] . ", ID: " . $id);

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    $conn->close();
    exit;
}

$id = mysqli_real_escape_string($conn, $id);

// Cek apakah user ada
$checkQuery = "SELECT ID_Penonton FROM penonton WHERE ID_Penonton = '$id'";
$checkResult = mysqli_query($conn, $checkQuery);

if (mysqli_num_rows($checkResult) == 0) {
    echo json_encode(["success" => false, "error" => "User dengan ID $id tidak ditemukan"]);
    $conn->close();
    exit;
}

// Mulai transaksi
mysqli_begin_transaction($conn);

try {
    // Hapus transaksi user terlebih dahulu
    $deleteTransaksi = "DELETE FROM transaksi WHERE ID_Penonton = '$id'";
    if (!mysqli_query($conn, $deleteTransaksi)) {
        throw new Exception('Gagal menghapus transaksi: ' . mysqli_error($conn));
    }
    
    // Hapus user
    $sql = "DELETE FROM penonton WHERE ID_Penonton = '$id'";
    if (!mysqli_query($conn, $sql)) {
        throw new Exception('Gagal menghapus user: ' . mysqli_error($conn));
    }
    
    mysqli_commit($conn);
    echo json_encode(["success" => true, "message" => "User berhasil dihapus"]);
    
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

mysqli_close($conn);
?>