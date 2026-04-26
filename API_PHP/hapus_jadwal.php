<?php
// hapus_jadwal.php
require_once 'database.php';
requireAdminMfa();

// HAPUS semua header manual

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id_jadwal = $_GET['id'];
    
    $conn->begin_transaction();
    
    try {
        $delete_tiket = "DELETE FROM tiket WHERE ID_Jadwal = ?";
        $stmt_tiket = $conn->prepare($delete_tiket);
        $stmt_tiket->bind_param("s", $id_jadwal);
        
        if (!$stmt_tiket->execute()) {
            throw new Exception("Gagal menghapus tiket: " . $stmt_tiket->error);
        }
        $stmt_tiket->close();
        
        $query = "DELETE FROM jadwal WHERE ID_Jadwal = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $id_jadwal);
        
        if (!$stmt->execute()) {
            throw new Exception("Gagal menghapus jadwal: " . $stmt->error);
        }
        $stmt->close();
        
        $conn->commit();
        
        echo json_encode(["success" => true, "message" => "Jadwal dan tiket terkait berhasil dihapus"]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["error" => $e->getMessage(), "success" => false]);
    }
    
} else {
    echo json_encode(["error" => "Invalid request", "success" => false]);
}
?>