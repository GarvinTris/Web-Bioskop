<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id_jadwal = $_GET['id'];
    
    // Mulai transaksi
    $conn->begin_transaction();
    
    try {
        // Hapus tiket terkait terlebih dahulu
        $delete_tiket = "DELETE FROM tiket WHERE ID_Jadwal = ?";
        $stmt_tiket = $conn->prepare($delete_tiket);
        $stmt_tiket->bind_param("s", $id_jadwal);
        
        if (!$stmt_tiket->execute()) {
            throw new Exception("Gagal menghapus tiket: " . $stmt_tiket->error);
        }
        $stmt_tiket->close();
        
        // Hapus jadwal
        $query = "DELETE FROM jadwal WHERE ID_Jadwal = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $id_jadwal);
        
        if (!$stmt->execute()) {
            throw new Exception("Gagal menghapus jadwal: " . $stmt->error);
        }
        $stmt->close();
        
        // Commit transaksi
        $conn->commit();
        
        echo json_encode(["success" => true, "message" => "Jadwal dan tiket terkait berhasil dihapus"]);
        
    } catch (Exception $e) {
        // Rollback jika ada error
        $conn->rollback();
        echo json_encode(["error" => $e->getMessage(), "success" => false]);
    }
    
} else {
    echo json_encode(["error" => "Invalid request", "success" => false]);
}

$conn->close();
?>