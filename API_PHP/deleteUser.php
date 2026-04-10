<?php
// deleteUser.php
require_once 'database.php';

header('Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS');

if (!$conn) {
    sendResponse(false, [], 'Koneksi database gagal');
    exit;
}

// Ambil ID dari berbagai method
$id = null;
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $delete_vars);
    $id = $delete_vars['id'] ?? null;
}

if (!$id) {
    sendResponse(false, [], 'ID user tidak ditemukan');
    exit;
}

$id = mysqli_real_escape_string($conn, $id);

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
    sendResponse(true, [], 'User berhasil dihapus');
    
} catch (Exception $e) {
    mysqli_rollback($conn);
    sendResponse(false, [], $e->getMessage());
}

mysqli_close($conn);
?>