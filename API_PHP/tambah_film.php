<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Aktifkan error reporting untuk debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log untuk debugging
$log_file = 'upload_debug.log';
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Request received\n", FILE_APPEND);

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    file_put_contents($log_file, "Database error: " . $conn->connect_error . "\n", FILE_APPEND);
    die(json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]));
}

// Cek apakah ada data POST
if (empty($_POST)) {
    file_put_contents($log_file, "Error: No POST data\n", FILE_APPEND);
    echo json_encode(["success" => false, "error" => "Tidak ada data yang diterima"]);
    exit;
}

// Log data yang diterima
file_put_contents($log_file, "POST data: " . json_encode($_POST) . "\n", FILE_APPEND);
file_put_contents($log_file, "FILES data: " . json_encode($_FILES) . "\n", FILE_APPEND);

// Cek field yang diperlukan
$required = ['Judul_Film', 'ID_Kategori', 'Director', 'Deskripsi', 'Durasi', 'Rating_Usia'];
$missing = [];

foreach ($required as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    echo json_encode(["success" => false, "error" => "Field berikut kosong: " . implode(", ", $missing)]);
    exit;
}

// Ambil data dari POST
$Judul_Film = $conn->real_escape_string($_POST['Judul_Film']);
$ID_Kategori = $conn->real_escape_string($_POST['ID_Kategori']);
$Director = $conn->real_escape_string($_POST['Director']);
$Deskripsi = $conn->real_escape_string($_POST['Deskripsi']);
$Durasi_raw = $_POST['Durasi'];
$Rating_Usia = $conn->real_escape_string($_POST['Rating_Usia']);
$Rating = isset($_POST['Rating']) ? floatval($_POST['Rating']) : 0;
$Trailer_URL = isset($_POST['Trailer_URL']) ? $conn->real_escape_string($_POST['Trailer_URL']) : '';

// Validasi Rating_Usia
$allowed_ratings = ['SU', 'P', 'A', 'R', 'D', 'BO'];
if (!in_array($Rating_Usia, $allowed_ratings)) {
    echo json_encode(["success" => false, "error" => "Klasifikasi usia tidak valid"]);
    exit;
}

// ========== KONVERSI DURASI KE FORMAT TIME ==========
function convertToTimeFormat($durasi) {
    // Jika sudah dalam format HH:MM:SS
    if (preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $durasi)) {
        if (substr_count($durasi, ':') == 1) {
            $durasi .= ':00';
        }
        return $durasi;
    }
    
    // Format: "2 jam 30 menit" atau "2 jam" atau "30 menit"
    $jam = 0;
    $menit = 0;
    
    // Cari jam
    if (preg_match('/(\d+)\s*jam/', $durasi, $matches)) {
        $jam = (int)$matches[1];
    }
    
    // Cari menit
    if (preg_match('/(\d+)\s*menit/', $durasi, $matches)) {
        $menit = (int)$matches[1];
    }
    
    // Jika tidak ada pola, coba parsing angka saja
    if ($jam == 0 && $menit == 0) {
        $angka = preg_replace('/[^0-9]/', '', $durasi);
        if (strlen($angka) <= 2) {
            $menit = (int)$angka;
        } else {
            $jam = (int)substr($angka, 0, -2);
            $menit = (int)substr($angka, -2);
        }
    }
    
    return sprintf("%02d:%02d:00", $jam, $menit);
}

$Durasi = convertToTimeFormat($Durasi_raw);
file_put_contents($log_file, "Converted duration: $Durasi_raw -> $Durasi\n", FILE_APPEND);

// Proses upload gambar
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "error" => "Gambar harus diupload"]);
    exit;
}

$upload_dir = "uploads/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
$imageName = time() . "_" . uniqid() . "." . $ext;
$uploadPath = $upload_dir . $imageName;

// Validasi tipe file
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array(strtolower($ext), $allowed)) {
    echo json_encode(["success" => false, "error" => "Tipe file harus JPG, JPEG, PNG, GIF, atau WEBP"]);
    exit;
}

// Validasi ukuran file (max 5MB)
if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "Ukuran file maksimal 5MB"]);
    exit;
}

if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
    
    // Insert ke database dengan Rating_Usia
    $sql = "INSERT INTO film (Judul_Film, Durasi, ID_Kategori, image, Director, Deskripsi, Trailer_URL, Rating, Rating_Usia) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssds", $Judul_Film, $Durasi, $ID_Kategori, $imageName, $Director, $Deskripsi, $Trailer_URL, $Rating, $Rating_Usia);
    
    if ($stmt->execute()) {
        $last_id = $conn->insert_id;
        file_put_contents($log_file, "Success: Film ID " . $last_id . " added\n", FILE_APPEND);
        echo json_encode(["success" => true, "message" => "Film berhasil ditambahkan", "id" => $last_id]);
    } else {
        file_put_contents($log_file, "SQL Error: " . $stmt->error . "\n", FILE_APPEND);
        echo json_encode(["success" => false, "error" => "Gagal simpan ke database: " . $stmt->error]);
    }
    
    $stmt->close();
} else {
    file_put_contents($log_file, "Failed to move uploaded file\n", FILE_APPEND);
    echo json_encode(["success" => false, "error" => "Gagal upload file"]);
}

$conn->close();
?>