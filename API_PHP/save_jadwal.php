<?php
// save_jadwal.php - VERSION FIXED
// =============================================
// 1. CORS HEADERS (PALING ATAS)
// =============================================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================
// 2. ERROR REPORTING
// =============================================
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// =============================================
// 3. SESSION START
// =============================================
session_start();

// =============================================
// 4. CHECK ADMIN LOGIN (SEDERHANA)
// =============================================
// Cek berbagai kemungkinan session variable
$is_admin_logged_in = false;

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $is_admin_logged_in = true;
} elseif (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true) {
    $is_admin_logged_in = true;
} elseif (isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id'])) {
    $is_admin_logged_in = true;
} elseif (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
    $is_admin_logged_in = true;
}

if (!$is_admin_logged_in) {
    http_response_code(401);
    echo json_encode([
        "success" => false, 
        "error" => "Unauthorized. Silakan login sebagai admin.",
        "session_debug" => array_keys($_SESSION) // Hapus ini di production
    ]);
    exit;
}

// =============================================
// 5. KONEKSI DATABASE
// =============================================
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'web_bioskop';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "error" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Set charset
$conn->set_charset("utf8mb4");

// =============================================
// 6. PROSES REQUEST
// =============================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_jadwal = $_POST['ID_Jadwal'] ?? null;
    $id_film = $_POST['ID_Film'] ?? null;
    $tanggal = $_POST['Tanggal'] ?? null;
    $jam_mulai = $_POST['Jam_Mulai'] ?? null;
    $no_studio = $_POST['No_Studio'] ?? null;
    
    // Validasi input
    $errors = [];
    if (!$id_film) $errors[] = "Film harus dipilih";
    if (!$tanggal) $errors[] = "Tanggal harus diisi";
    if (!$jam_mulai) $errors[] = "Jam mulai harus diisi";
    if (!$no_studio) $errors[] = "Studio harus dipilih";
    
    if (!empty($errors)) {
        echo json_encode([
            "success" => false, 
            "error" => implode(", ", $errors)
        ]);
        exit;
    }
    
    // Ambil harga tiket dari studio
    $harga_query = "SELECT Harga_Tiket FROM studio WHERE No_Studio = ?";
    $harga_stmt = $conn->prepare($harga_query);
    $harga_stmt->bind_param("i", $no_studio);
    $harga_stmt->execute();
    $harga_result = $harga_stmt->get_result();
    $harga_row = $harga_result->fetch_assoc();
    $harga_stmt->close();
    
    if (!$harga_row) {
        echo json_encode([
            "success" => false, 
            "error" => "Studio dengan nomor $no_studio tidak ditemukan"
        ]);
        exit;
    }
    
    $harga = (int)$harga_row['Harga_Tiket'];
    
    // Mulai transaksi
    $conn->begin_transaction();
    
    try {
        if ($id_jadwal) {
            // =============================================
            // UPDATE JADWAL
            // =============================================
            $query = "UPDATE jadwal SET 
                      ID_Film = ?, 
                      Tanggal = ?, 
                      Jam_Mulai = ?, 
                      No_Studio = ? 
                      WHERE ID_Jadwal = ?";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sssss", $id_film, $tanggal, $jam_mulai, $no_studio, $id_jadwal);
            
            if (!$stmt->execute()) {
                throw new Exception("Gagal update jadwal: " . $stmt->error);
            }
            
            // Update harga tiket yang terkait
            $update_tiket = "UPDATE tiket SET Harga = ? WHERE ID_Jadwal = ?";
            $update_stmt = $conn->prepare($update_tiket);
            $update_stmt->bind_param("is", $harga, $id_jadwal);
            $update_stmt->execute();
            $update_stmt->close();
            $stmt->close();
            
            $conn->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Jadwal berhasil diupdate"
            ]);
            
        } else {
            // =============================================
            // INSERT JADWAL BARU
            // =============================================
            
            // Cek apakah jadwal sudah ada (tanggal + jam + studio)
            $check_query = "SELECT ID_Jadwal FROM jadwal 
                           WHERE Tanggal = ? AND Jam_Mulai = ? AND No_Studio = ?";
            $check_stmt = $conn->prepare($check_query);
            $check_stmt->bind_param("ssi", $tanggal, $jam_mulai, $no_studio);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            
            if ($check_result->num_rows > 0) {
                throw new Exception("Jadwal sudah ada untuk studio ini di tanggal dan jam tersebut");
            }
            $check_stmt->close();
            
            // Generate ID Jadwal otomatis
            $query_id = "SELECT MAX(CAST(SUBSTRING(ID_Jadwal, 5) AS UNSIGNED)) as max_id FROM jadwal";
            $result = $conn->query($query_id);
            $row = $result->fetch_assoc();
            $next_id = ($row['max_id'] ?? 0) + 1;
            $new_id = "JDWL" . str_pad($next_id, 3, "0", STR_PAD_LEFT);
            
            // Insert jadwal
            $query = "INSERT INTO jadwal (ID_Jadwal, ID_Film, Tanggal, Jam_Mulai, No_Studio) 
                      VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sssss", $new_id, $id_film, $tanggal, $jam_mulai, $no_studio);
            
            if (!$stmt->execute()) {
                throw new Exception("Gagal tambah jadwal: " . $stmt->error);
            }
            $stmt->close();
            
            // =============================================
            // GENERATE TIKET UNTUK SEMUA KURSI
            // =============================================
            
            // Cek apakah ada kursi untuk studio ini
            $kursi_query = "SELECT ID_Kursi FROM kursi WHERE No_Studio = ?";
            $kursi_stmt = $conn->prepare($kursi_query);
            $kursi_stmt->bind_param("i", $no_studio);
            $kursi_stmt->execute();
            $kursi_result = $kursi_stmt->get_result();
            
            if ($kursi_result->num_rows === 0) {
                throw new Exception("Tidak ada kursi untuk Studio " . $no_studio . ". Silakan tambahkan kursi terlebih dahulu.");
            }
            
            // Insert tiket untuk setiap kursi
            $tiket_insert = "INSERT INTO tiket (ID_Tiket, ID_Jadwal, Harga, ID_Kursi, Status) 
                            VALUES (?, ?, ?, ?, 'tersedia')";
            $tiket_stmt = $conn->prepare($tiket_insert);
            
            $counter = 1;
            $tiket_created = 0;
            $failed_kursi = [];
            
            while ($kursi = $kursi_result->fetch_assoc()) {
                $tiket_id_full = "TKT" . $new_id . "_" . str_pad($counter, 3, "0", STR_PAD_LEFT);
                
                $tiket_stmt->bind_param("ssis", $tiket_id_full, $new_id, $harga, $kursi['ID_Kursi']);
                if ($tiket_stmt->execute()) {
                    $tiket_created++;
                } else {
                    $failed_kursi[] = $kursi['ID_Kursi'];
                }
                $counter++;
            }
            
            $tiket_stmt->close();
            $kursi_stmt->close();
            
            if ($tiket_created === 0) {
                throw new Exception("Gagal membuat tiket untuk jadwal ini. " . 
                                   (!empty($failed_kursi) ? "Kursi bermasalah: " . implode(", ", $failed_kursi) : ""));
            }
            
            $conn->commit();
            
            echo json_encode([
                "success" => true, 
                "message" => "Jadwal berhasil ditambahkan dengan {$tiket_created} tiket",
                "id" => $new_id,
                "tiket_count" => $tiket_created,
                "studio" => $no_studio,
                "tanggal" => $tanggal,
                "jam_mulai" => $jam_mulai
            ]);
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            "success" => false, 
            "error" => $e->getMessage()
        ]);
    }
    
    $conn->close();
    
} else {
    echo json_encode([
        "success" => false, 
        "error" => "Method tidak diizinkan. Gunakan POST."
    ]);
}
?>