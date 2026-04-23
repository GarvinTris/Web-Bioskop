<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
requireAdminMfa();
$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Mulai transaksi
    $conn->begin_transaction();
    
    try {
        // Hitung jumlah jadwal sebelum dihapus
        $count_query = "SELECT COUNT(*) as total FROM jadwal";
        $count_result = $conn->query($count_query);
        $count_row = $count_result->fetch_assoc();
        $jumlah_jadwal = $count_row['total'];
        
        // Hapus semua tiket terlebih dahulu
        $delete_tiket = "DELETE FROM tiket";
        if (!$conn->query($delete_tiket)) {
            throw new Exception("Gagal menghapus tiket: " . $conn->error);
        }
        
        // Hapus semua jadwal
        $delete_jadwal = "DELETE FROM jadwal";
        if (!$conn->query($delete_jadwal)) {
            throw new Exception("Gagal menghapus jadwal: " . $conn->error);
        }
        
        // Commit transaksi
        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Semua jadwal dan tiket berhasil dihapus",
            "jumlah" => $jumlah_jadwal
        ]);
        
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