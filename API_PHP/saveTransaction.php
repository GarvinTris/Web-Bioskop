<?php
// saveTransaction.php - FULLY FIXED
require_once 'database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');

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

$kursi_list = explode(',', $kursi);
$jumlah_tiket = count($kursi_list);

$conn->begin_transaction();

try {
    // Cek transaksi sudah ada
    $check_stmt = $conn->prepare("SELECT ID_Transaksi FROM transaksi WHERE ID_Transaksi = ?");
    $check_stmt->bind_param("s", $id_transaksi);
    $check_stmt->execute();
    if ($check_stmt->get_result()->num_rows > 0) {
        throw new Exception("Transaksi sudah ada");
    }
    $check_stmt->close();
    
    // Simpan transaksi
    $insert_stmt = $conn->prepare("INSERT INTO transaksi (ID_Transaksi, ID_Penonton, ID_Jadwal, Jumlah, Total_Harga, Metode_Pembayaran, Tanggal_Pemesanan, Kursi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $insert_stmt->bind_param("sssiisss", $id_transaksi, $id_penonton, $id_jadwal, $jumlah_tiket, $total_harga, $metode_pembayaran, $tanggal, $kursi);
    
    if (!$insert_stmt->execute()) {
        throw new Exception("Gagal simpan transaksi: " . $insert_stmt->error);
    }
    $insert_stmt->close();
    
    // Update status tiket menjadi 'terjual'
    $updatedCount = 0;
    
    foreach ($kursi_list as $kursi_nama) {
        $kursi_nama = trim($kursi_nama);
        
        if (preg_match('/([A-E])(\d+)/', $kursi_nama, $matches)) {
            $baris = $matches[1];
            $nomor = intval($matches[2]);
            
            // Update status tiket
            $update_stmt = $conn->prepare("
                UPDATE tiket t 
                JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
                SET t.Status = 'terjual'
                WHERE t.ID_Jadwal = ? AND k.Baris = ? AND k.Nomor_Kursi = ? AND t.Status = 'tersedia'
            ");
            $update_stmt->bind_param("ssi", $id_jadwal, $baris, $nomor);
            
            if ($update_stmt->execute() && $update_stmt->affected_rows > 0) {
                $updatedCount++;
            }
            $update_stmt->close();
        }
    }
    
    if ($updatedCount == 0) {
        throw new Exception("Tidak ada kursi yang berhasil dipesan. Kursi mungkin sudah dipesan sebelumnya.");
    }
    
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Transaksi berhasil! $updatedCount kursi dipesan.",
        "transaction_id" => $id_transaksi,
        "updated_seats" => $updatedCount
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>