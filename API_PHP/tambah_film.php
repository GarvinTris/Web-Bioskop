<?php
// tambah_film.php
require_once 'database.php';
requireAdminMfa();

// HAPUS semua header manual

error_reporting(E_ALL);
ini_set('display_errors', 0);

if (empty($_POST)) {
    echo json_encode(["success" => false, "error" => "Tidak ada data yang diterima"]);
    exit;
}

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

$Judul_Film = $conn->real_escape_string($_POST['Judul_Film']);
$ID_Kategori = $conn->real_escape_string($_POST['ID_Kategori']);
$Director = $conn->real_escape_string($_POST['Director']);
$Deskripsi = $conn->real_escape_string($_POST['Deskripsi']);
$Durasi_raw = $_POST['Durasi'];
$Rating_Usia = $conn->real_escape_string($_POST['Rating_Usia']);
$Rating = isset($_POST['Rating']) ? floatval($_POST['Rating']) : 0;
$Trailer_URL = isset($_POST['Trailer_URL']) ? $conn->real_escape_string($_POST['Trailer_URL']) : '';

$allowed_ratings = ['SU', 'P', 'A', 'R', 'D', 'BO'];
if (!in_array($Rating_Usia, $allowed_ratings)) {
    echo json_encode(["success" => false, "error" => "Klasifikasi usia tidak valid"]);
    exit;
}

function convertToTimeFormat($durasi) {
    if (preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $durasi)) {
        if (substr_count($durasi, ':') == 1) {
            $durasi .= ':00';
        }
        return $durasi;
    }
    
    $jam = 0;
    $menit = 0;
    
    if (preg_match('/(\d+)\s*jam/', $durasi, $matches)) {
        $jam = (int)$matches[1];
    }
    
    if (preg_match('/(\d+)\s*menit/', $durasi, $matches)) {
        $menit = (int)$matches[1];
    }
    
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

$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array(strtolower($ext), $allowed)) {
    echo json_encode(["success" => false, "error" => "Tipe file harus JPG, JPEG, PNG, GIF, atau WEBP"]);
    exit;
}

if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "Ukuran file maksimal 5MB"]);
    exit;
}

if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
    $sql = "INSERT INTO film (Judul_Film, Durasi, ID_Kategori, image, Director, Deskripsi, Trailer_URL, Rating, Rating_Usia) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssds", $Judul_Film, $Durasi, $ID_Kategori, $imageName, $Director, $Deskripsi, $Trailer_URL, $Rating, $Rating_Usia);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Film berhasil ditambahkan", "id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "error" => "Gagal simpan ke database: " . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Gagal upload file"]);
}
?>