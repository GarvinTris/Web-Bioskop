<?php
// hapus_semua_jadwal.php - FIXED VERSION
require_once 'database.php';
requireAdminMfa(); // Tambahkan auth admin

// Set header untuk JSON response
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Method tidak diizinkan", "success" => false]);
    exit;
}

$conn->begin_transaction();

try {
    // Hitung jumlah jadwal sebelum dihapus
    $count_query = "SELECT COUNT(*) as total FROM jadwal";
    $count_result = $conn->query($count_query);
    $count_row = $count_result->fetch_assoc();
    $jumlah_jadwal = $count_row['total'];
    
    if ($jumlah_jadwal == 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Tidak ada jadwal yang perlu dihapus",
            "jumlah" => 0
        ]);
        exit;
    }
    
    // Hapus semua tiket terlebih dahulu (karena foreign key ke jadwal)
    $delete_tiket = "DELETE FROM tiket";
    if (!$conn->query($delete_tiket)) {
        throw new Exception("Gagal menghapus tiket: " . $conn->error);
    }
    
    // Hapus semua jadwal
    $delete_jadwal = "DELETE FROM jadwal";
    if (!$conn->query($delete_jadwal)) {
        throw new Exception("Gagal menghapus jadwal: " . $conn->error);
    }
    
    $conn->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Berhasil menghapus $jumlah_jadwal jadwal beserta semua tiketnya!",
        "jumlah" => $jumlah_jadwal
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage(), "success" => false]);
}
?>