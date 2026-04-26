<?php
// saveTransaction.php - Simpan transaksi dan update status tiket
require_once 'database.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Log untuk debugging
error_log("=== saveTransaction.php called ===");
error_log("Raw input: " . $input);

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

error_log("Processing transaction: $id_transaksi, Kursi: $kursi");

$conn->begin_transaction();

try {
    // 1. Cek apakah transaksi sudah ada
    $check_sql = "SELECT ID_Transaksi FROM transaksi WHERE ID_Transaksi = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $id_transaksi);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        throw new Exception("Transaksi dengan ID $id_transaksi sudah ada");
    }
    $check_stmt->close();
    
    // 2. Simpan transaksi
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
    
    // 3. UPDATE STATUS TIKET MENJADI 'terjual' - INI YANG PENTING!
    $kursi_list = explode(',', $kursi);
    $updatedCount = 0;
    
    foreach ($kursi_list as $kursi_nama) {
        $kursi_nama = trim($kursi_nama);
        error_log("Processing seat: " . $kursi_nama);
        
        // Parse baris dan nomor kursi (contoh: "A1" -> baris="A", nomor=1)
        preg_match('/([A-E])(\d+)/', $kursi_nama, $matches);
        if (count($matches) == 3) {
            $baris = $matches[1];
            $nomor = intval($matches[2]);
            
            error_log("Updating ticket: Jadwal=$id_jadwal, Baris=$baris, Nomor=$nomor");
            
            // Update status tiket
            $updateTiket = "UPDATE tiket t 
                            JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
                            SET t.Status = 'terjual'
                            WHERE t.ID_Jadwal = ? 
                            AND k.Baris = ? 
                            AND k.Nomor_Kursi = ?";
            
            $update_stmt = $conn->prepare($updateTiket);
            if (!$update_stmt) {
                throw new Exception("Prepare update failed: " . $conn->error);
            }
            
            $update_stmt->bind_param("ssi", $id_jadwal, $baris, $nomor);
            
            if (!$update_stmt->execute()) {
                throw new Exception("Execute update failed: " . $update_stmt->error);
            }
            
            if ($update_stmt->affected_rows > 0) {
                $updatedCount++;
                error_log("Successfully updated seat: $kursi_nama");
            } else {
                error_log("No rows updated for seat: $kursi_nama");
            }
            $update_stmt->close();
        } else {
            error_log("Failed to parse seat name: $kursi_nama");
        }
    }
    
    if ($updatedCount != count($kursi_list)) {
        error_log("Warning: Only $updatedCount out of " . count($kursi_list) . " seats updated");
        // Jangan throw exception, tetap lanjutkan karena transaksi sudah tersimpan
    }
    
    $conn->commit();
    
    error_log("Transaction completed successfully. Updated $updatedCount seats.");
    
    echo json_encode([
        "success" => true, 
        "message" => "Transaksi berhasil disimpan, $updatedCount kursi berhasil dipesan",
        "transaction_id" => $id_transaksi,
        "updated_seats" => $updatedCount
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("Transaction failed: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>