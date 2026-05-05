<?php
// pesanan.php - FINAL VERSION
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// ========== CEK SESSION ADMIN ==========
$is_admin = false;

// Debug: Log session (hapus setelah berhasil)
$debug_info = [];

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $is_admin = true;
    $debug_info['check1'] = 'admin_logged_in = true';
} elseif (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true) {
    $is_admin = true;
    $debug_info['check2'] = 'is_admin = true';
} elseif (isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id'])) {
    $is_admin = true;
    $debug_info['check3'] = 'admin_id exists';
} elseif (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
    $is_admin = true;
    $debug_info['check4'] = 'user_role = admin';
}

// Untuk testing - HAPUS SETELAH SEMUA BERJALAN
// Jika session masih belum terbaca, uncomment baris di bawah:
// $is_admin = true;

if (!$is_admin) {
    http_response_code(401);
    echo json_encode([
        "error" => "Unauthorized. Silakan login sebagai admin.",
        "debug_session" => array_keys($_SESSION),
        "session_id" => session_id()
    ]);
    exit;
}

// ========== KONEKSI DATABASE ==========
$conn = new mysqli('localhost', 'root', '', 'web_bioskop');

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Tambah kolom Status jika belum ada
$conn->query("ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS Status ENUM('pending', 'paid', 'cancelled', 'completed') DEFAULT 'pending'");

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ========== GET ALL ORDERS ==========
if ($action === 'get' || ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['action']))) {
    
    $query = "SELECT 
                t.ID_Transaksi,
                t.Jumlah,
                t.Total_Harga,
                t.Metode_Pembayaran,
                t.Tanggal_Pemesanan,
                t.Kursi,
                IFNULL(t.Status, 'pending') as Status,
                IFNULL(p.Nama_Lengkap, 'Pengguna Tidak Diketahui') as nama_penonton,
                IFNULL(p.Email, 'email@tidak.diketahui') as email_penonton,
                IFNULL(f.Judul_Film, 'Film Tidak Diketahui') as judul_film,
                IFNULL(s.Nama_Studio, CONCAT('Studio ', j.No_Studio)) as nama_studio,
                j.Tanggal as Tanggal_Jadwal,
                j.Jam_Mulai
              FROM transaksi t
              LEFT JOIN penonton p ON t.ID_Penonton = p.ID_Penonton
              LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
              LEFT JOIN film f ON j.ID_Film = f.ID_Film
              LEFT JOIN studio s ON j.No_Studio = s.No_Studio
              ORDER BY t.Tanggal_Pemesanan DESC, t.ID_Transaksi DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        echo json_encode(["error" => "Query error: " . $conn->error]);
        exit;
    }
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    echo json_encode($orders);
}

// ========== UPDATE STATUS ==========
elseif ($action === 'update_status') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_transaksi = $input['id_transaksi'] ?? '';
    $status = $input['status'] ?? '';
    
    $allowed = ['pending', 'paid', 'cancelled', 'completed'];
    if (!in_array($status, $allowed)) {
        echo json_encode(["error" => "Status tidak valid", "success" => false]);
        exit;
    }
    
    $stmt = $conn->prepare("UPDATE transaksi SET Status = ? WHERE ID_Transaksi = ?");
    $stmt->bind_param("ss", $status, $id_transaksi);
    
    $success = $stmt->execute();
    echo json_encode([
        "success" => $success,
        "message" => $success ? "Status berhasil diupdate" : $stmt->error
    ]);
    $stmt->close();
}

// ========== DELETE ORDER ==========
elseif ($action === 'delete') {
    $id = $_GET['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM transaksi WHERE ID_Transaksi = ?");
    $stmt->bind_param("s", $id);
    
    $success = $stmt->execute();
    echo json_encode([
        "success" => $success,
        "message" => $success ? "Pesanan dihapus" : $stmt->error
    ]);
    $stmt->close();
}

else {
    // Default: ambil semua data
    $query = "SELECT * FROM transaksi ORDER BY Tanggal_Pemesanan DESC";
    $result = $conn->query($query);
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    echo json_encode($orders);
}

$conn->close();
?>