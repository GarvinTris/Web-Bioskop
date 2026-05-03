<?php
// hapus_film.php - FIXED VERSION
require_once 'database.php';

// Set header untuk debugging
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Debug: Cek apakah admin login
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Session tidak ditemukan. Silakan login ulang.",
        "session" => $_SESSION ?? []
    ]);
    exit;
}

if ($_SESSION['user_type'] !== 'admin') {
    echo json_encode(["success" => false, "error" => "Anda bukan admin"]);
    exit;
}

if (!isset($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID film tidak ditemukan"]);
    exit;
}

$id_film = intval($_GET['id']);

// Mulai transaksi
$conn->begin_transaction();

try {
    // 1. Cek apakah film ada
    $check_sql = "SELECT ID_Film, image FROM film WHERE ID_Film = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $id_film);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Film dengan ID $id_film tidak ditemukan");
    }
    
    $film = $check_result->fetch_assoc();
    $check_stmt->close();
    
    // 2. Cek apakah film memiliki jadwal
    $jadwal_sql = "SELECT COUNT(*) as total FROM jadwal WHERE ID_Film = ?";
    $jadwal_stmt = $conn->prepare($jadwal_sql);
    $jadwal_stmt->bind_param("i", $id_film);
    $jadwal_stmt->execute();
    $jadwal_result = $jadwal_stmt->get_result();
    $jadwal_row = $jadwal_result->fetch_assoc();
    $jadwal_stmt->close();
    
    if ($jadwal_row['total'] > 0) {
        throw new Exception("Film tidak bisa dihapus karena masih memiliki {$jadwal_row['total']} jadwal tayang. Hapus jadwal terlebih dahulu.");
    }
    
    // 3. Hapus dari trailer (jika ada)
    $trailer_sql = "DELETE FROM trailer WHERE ID_Film = ?";
    $trailer_stmt = $conn->prepare($trailer_sql);
    $trailer_stmt->bind_param("i", $id_film);
    $trailer_stmt->execute();
    $trailer_stmt->close();
    
    // 4. Hapus film
    $delete_sql = "DELETE FROM film WHERE ID_Film = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $id_film);
    
    if (!$delete_stmt->execute()) {
        throw new Exception("Gagal menghapus film: " . $delete_stmt->error);
    }
    
    $affected = $delete_stmt->affected_rows;
    $delete_stmt->close();
    
    // 5. Hapus file gambar
    if (!empty($film['image'])) {
        $file_path = "uploads/" . $film['image'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
    }
    
    $conn->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Film berhasil dihapus",
        "affected_rows" => $affected
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}
?>