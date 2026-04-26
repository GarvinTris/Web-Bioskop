<?php
// deleteUser.php
require_once 'database.php';
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ambil ID dari berbagai method
$id = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
}
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } 
    else {
        $input = file_get_contents("php://input");
        parse_str($input, $delete_vars);
        $id = $delete_vars['id'] ?? null;
        
        if (!$id) {
            $json = json_decode($input, true);
            $id = $json['id'] ?? null;
        }
    }
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? $_POST['id'] ?? null;
}

error_log("DeleteUser - Method: " . $_SERVER['REQUEST_METHOD'] . ", ID: " . $id);

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    exit;
}

// Cek apakah user ada dengan prepared statement
$checkQuery = "SELECT ID_Penonton FROM penonton WHERE ID_Penonton = ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("s", $id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows == 0) {
    $checkStmt->close();
    echo json_encode(["success" => false, "error" => "User dengan ID $id tidak ditemukan"]);
    exit;
}
$checkStmt->close();

// Mulai transaksi
mysqli_begin_transaction($conn);

try {
    // Hapus transaksi user terlebih dahulu
    $deleteTransaksi = "DELETE FROM transaksi WHERE ID_Penonton = ?";
    $transStmt = $conn->prepare($deleteTransaksi);
    $transStmt->bind_param("s", $id);
    if (!$transStmt->execute()) {
        throw new Exception('Gagal menghapus transaksi: ' . $transStmt->error);
    }
    $transStmt->close();
    
    // Hapus user
    $sql = "DELETE FROM penonton WHERE ID_Penonton = ?";
    $userStmt = $conn->prepare($sql);
    $userStmt->bind_param("s", $id);
    if (!$userStmt->execute()) {
        throw new Exception('Gagal menghapus user: ' . $userStmt->error);
    }
    $userStmt->close();
    
    mysqli_commit($conn);
    echo json_encode(["success" => true, "message" => "User berhasil dihapus"]);
    
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>