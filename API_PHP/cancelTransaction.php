<?php
// cancelTransaction.php - Batalkan transaksi dengan notifikasi
require_once 'database.php';
requireAdminMfa();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Data tidak valid"]);
    exit;
}

$id_transaksi = $data['id_transaksi'];
$id_penonton = $data['id_penonton'];
$alasan = $data['alasan'];

// Cek transaksi dengan prepared statement
$check_sql = "SELECT * FROM transaksi WHERE ID_Transaksi = ? AND ID_Penonton = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("ss", $id_transaksi, $id_penonton);
$check_stmt->execute();
$check = $check_stmt->get_result();

if ($check->num_rows == 0) {
    $check_stmt->close();
    echo json_encode(["success" => false, "error" => "Transaksi tidak ditemukan"]);
    exit;
}

$transaksi = $check->fetch_assoc();
$check_stmt->close();

// Cek jadwal
$jadwal_sql = "SELECT Tanggal FROM jadwal WHERE ID_Jadwal = ?";
$jadwal_stmt = $conn->prepare($jadwal_sql);
$jadwal_stmt->bind_param("s", $transaksi['ID_Jadwal']);
$jadwal_stmt->execute();
$jadwal = $jadwal_stmt->get_result();

if ($jadwal->num_rows > 0) {
    $jadwalData = $jadwal->fetch_assoc();
    $showDate = new DateTime($jadwalData['Tanggal']);
    $today = new DateTime();
    
    if ($showDate <= $today) {
        $jadwal_stmt->close();
        echo json_encode(["success" => false, "error" => "Tiket tidak dapat dibatalkan karena sudah melewati jadwal tayang"]);
        exit;
    }
}
$jadwal_stmt->close();

$conn->begin_transaction();

try {
    $kursi_list = explode(',', $transaksi['Kursi']);
    foreach ($kursi_list as $kursi) {
        $kursi = trim($kursi);
        preg_match('/([A-E])(\d+)/', $kursi, $matches);
        if (count($matches) == 3) {
            $baris = $matches[1];
            $nomor = intval($matches[2]);
            
            $updateTiket = "UPDATE tiket t 
                            JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
                            SET t.Status = 'tersedia'
                            WHERE t.ID_Jadwal = ? 
                            AND k.Baris = ? 
                            AND k.Nomor_Kursi = ?";
            $update_stmt = $conn->prepare($updateTiket);
            $update_stmt->bind_param("ssi", $transaksi['ID_Jadwal'], $baris, $nomor);
            $update_stmt->execute();
            $update_stmt->close();
        }
    }
    
    $refund_id = "REF" . time();
    $insertRefund = "INSERT INTO refund (ID_Refund, ID_Transaksi, ID_Penonton, Alasan, Status, Tanggal_Refund) 
                     VALUES (?, ?, ?, ?, 'pending', NOW())";
    $refund_stmt = $conn->prepare($insertRefund);
    $refund_stmt->bind_param("ssss", $refund_id, $id_transaksi, $id_penonton, $alasan);
    $refund_stmt->execute();
    $refund_stmt->close();
    
    $conn->commit();
    
    // Kirim notifikasi
    require_once 'notifikasi.php';
    sendNotification(
        $id_penonton,
        'Pembatalan Tiket',
        "Tiket dengan kursi " . $transaksi['Kursi'] . " telah dibatalkan. Refund sedang diproses.",
        'warning'
    );
    
    echo json_encode([
        "success" => true, 
        "message" => "Tiket berhasil dibatalkan",
        "refund_id" => $refund_id
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>