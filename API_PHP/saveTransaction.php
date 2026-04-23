<?php
// saveTransaction.php - Simpan transaksi
require_once 'database.php';
// requireAdminMfa();
// Matikan error display
error_reporting(E_ALL);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON data"]);
    exit;
}

$required = ['id_transaksi', 'id_penonton', 'id_jadwal', 'kursi', 'total_harga', 'metode_pembayaran'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(["success" => false, "error" => "Field $field tidak boleh kosong"]);
        exit;
    }
}

$id_transaksi = $conn->real_escape_string($data['id_transaksi']);
$id_penonton = $conn->real_escape_string($data['id_penonton']);
$id_jadwal = $conn->real_escape_string($data['id_jadwal']);
$kursi = $conn->real_escape_string($data['kursi']);
$total_harga = intval($data['total_harga']);
$metode_pembayaran = $conn->real_escape_string($data['metode_pembayaran']);
$tanggal = $data['tanggal'] ?? date('Y-m-d H:i:s');

$jumlah_tiket = count(explode(',', $kursi));

$conn->begin_transaction();

try {
    $sql_transaksi = "INSERT INTO transaksi (ID_Transaksi, ID_Penonton, ID_Jadwal, Jumlah, Total_Harga, Metode_Pembayaran, Tanggal_Pemesanan, Kursi) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql_transaksi);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("sssiisss", $id_transaksi, $id_penonton, $id_jadwal, $jumlah_tiket, $total_harga, $metode_pembayaran, $tanggal, $kursi);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $stmt->close();
    
    $conn->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Transaksi berhasil disimpan",
        "transaction_id" => $id_transaksi
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>