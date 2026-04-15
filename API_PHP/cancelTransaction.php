<?php
// cancelTransaction.php - Batalkan transaksi dengan notifikasi
require_once 'database.php';

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

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Data tidak valid"]);
    $conn->close();
    exit;
}

$id_transaksi = $conn->real_escape_string($data['id_transaksi']);
$id_penonton = $conn->real_escape_string($data['id_penonton']);
$alasan = $conn->real_escape_string($data['alasan']);

$check = $conn->query("SELECT * FROM transaksi WHERE ID_Transaksi = '$id_transaksi' AND ID_Penonton = '$id_penonton'");

if ($check->num_rows == 0) {
    echo json_encode(["success" => false, "error" => "Transaksi tidak ditemukan"]);
    $conn->close();
    exit;
}

$transaksi = $check->fetch_assoc();

$jadwal = $conn->query("SELECT Tanggal FROM jadwal WHERE ID_Jadwal = '{$transaksi['ID_Jadwal']}'");
if ($jadwal->num_rows > 0) {
    $jadwalData = $jadwal->fetch_assoc();
    $showDate = new DateTime($jadwalData['Tanggal']);
    $today = new DateTime();
    
    if ($showDate <= $today) {
        echo json_encode(["success" => false, "error" => "Tiket tidak dapat dibatalkan karena sudah melewati jadwal tayang"]);
        $conn->close();
        exit;
    }
}

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
                            WHERE t.ID_Jadwal = '{$transaksi['ID_Jadwal']}' 
                            AND k.Baris = '$baris' 
                            AND k.Nomor_Kursi = $nomor";
            $conn->query($updateTiket);
        }
    }
    
    $refund_id = "REF" . time();
    $insertRefund = "INSERT INTO refund (ID_Refund, ID_Transaksi, ID_Penonton, Alasan, Status, Tanggal_Refund) 
                     VALUES ('$refund_id', '$id_transaksi', '$id_penonton', '$alasan', 'pending', NOW())";
    $conn->query($insertRefund);
    
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

$conn->close();
?>