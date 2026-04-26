<?php
// hapus_semua_jadwal.php
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conn->begin_transaction();
    
    try {
        $count_query = "SELECT COUNT(*) as total FROM jadwal";
        $count_result = $conn->query($count_query);
        $count_row = $count_result->fetch_assoc();
        $jumlah_jadwal = $count_row['total'];
        
        $delete_tiket = "DELETE FROM tiket";
        if (!$conn->query($delete_tiket)) {
            throw new Exception("Gagal menghapus tiket: " . $conn->error);
        }
        
        $delete_jadwal = "DELETE FROM jadwal";
        if (!$conn->query($delete_jadwal)) {
            throw new Exception("Gagal menghapus jadwal: " . $conn->error);
        }
        
        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Semua jadwal dan tiket berhasil dihapus",
            "jumlah" => $jumlah_jadwal
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["error" => $e->getMessage(), "success" => false]);
    }
    
} else {
    echo json_encode(["error" => "Invalid request", "success" => false]);
}
?>