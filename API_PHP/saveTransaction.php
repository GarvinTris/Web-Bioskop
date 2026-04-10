<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

// Baca input JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Debug: log input
error_log("saveTransaction received: " . $input);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON data"]);
    exit;
}

// Validasi data
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

// Mulai transaksi database
$conn->begin_transaction();

try {
    // CEK STRUKTUR TABEL transaksi terlebih dahulu
    $check_columns = $conn->query("SHOW COLUMNS FROM transaksi");
    $columns = [];
    while ($col = $check_columns->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    // 1. Insert ke tabel transaksi (sesuaikan dengan kolom yang ada)
    if (in_array('Status', $columns)) {
        $sql_transaksi = "INSERT INTO transaksi (ID_Transaksi, ID_Penonton, ID_Jadwal, Tanggal_Pemesanan, Total_Harga, Metode_Pembayaran, Status) 
                          VALUES (?, ?, ?, ?, ?, ?, 'completed')";
        $stmt = $conn->prepare($sql_transaksi);
        // Perbaikan: 6 parameter (s,s,s,s,i,s) - 6 huruf untuk 6 variabel
        $stmt->bind_param("ssssis", $id_transaksi, $id_penonton, $id_jadwal, $tanggal, $total_harga, $metode_pembayaran);
    } else {
        $sql_transaksi = "INSERT INTO transaksi (ID_Transaksi, ID_Penonton, ID_Jadwal, Tanggal_Pemesanan, Total_Harga, Metode_Pembayaran) 
                          VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql_transaksi);
        // Perbaikan: 6 parameter (s,s,s,s,i,s) - 6 huruf untuk 6 variabel
        $stmt->bind_param("ssssis", $id_transaksi, $id_penonton, $id_jadwal, $tanggal, $total_harga, $metode_pembayaran);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Gagal insert transaksi: " . $stmt->error);
    }
    $stmt->close();
    
    // 2. Update status kursi menjadi terisi (jika ada tabel tiket)
    $kursi_array = explode(',', $kursi);
    foreach ($kursi_array as $kursi_id) {
        $kursi_id = trim($kursi_id);
        
        // Format kursi seperti "A1", "B2", dll
        preg_match('/([A-E])(\d+)/', $kursi_id, $matches);
        if (count($matches) == 3) {
            $baris = $matches[1];
            $nomor = intval($matches[2]);
            
            // Cek apakah tabel tiket dan kursi ada
            $check_tiket = $conn->query("SHOW TABLES LIKE 'tiket'");
            if ($check_tiket->num_rows > 0) {
                // Update status kursi di tabel tiket
                $update_tiket = "UPDATE tiket t 
                                JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
                                SET t.Status = 'terjual'
                                WHERE t.ID_Jadwal = ? 
                                AND k.Baris = ? 
                                AND k.Nomor_Kursi = ?";
                
                $update_stmt = $conn->prepare($update_tiket);
                if ($update_stmt) {
                    $update_stmt->bind_param("ssi", $id_jadwal, $baris, $nomor);
                    $update_stmt->execute();
                    $update_stmt->close();
                }
            }
        }
    }
    
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

$conn->close();
?>