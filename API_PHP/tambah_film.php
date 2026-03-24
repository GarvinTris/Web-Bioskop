<?php
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
    die(json_encode(["error" => "Database gagal konek"]));
}

// Cek apakah ada data POST
if (empty($_POST)) {
    file_put_contents($log_file, "Error: No POST data\n", FILE_APPEND);
    echo json_encode(["error" => "Tidak ada data yang diterima"]);
    exit;
}

// Log data yang diterima
file_put_contents($log_file, "POST data: " . json_encode($_POST) . "\n", FILE_APPEND);
file_put_contents($log_file, "FILES data: " . json_encode($_FILES) . "\n", FILE_APPEND);

// Cek field yang diperlukan
$required = ['Judul_Film', 'ID_Kategori', 'Director', 'Deskripsi', 'Durasi'];
$missing = [];

foreach ($required as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    echo json_encode(["error" => "Field berikut kosong: " . implode(", ", $missing)]);
    exit;
}

// Ambil data dari POST
$Judul_Film = $_POST['Judul_Film'];
$ID_Kategori = $_POST['ID_Kategori'];
$Director = $_POST['Director'];
$Deskripsi = $_POST['Deskripsi'];
$Durasi = $_POST['Durasi'];
$Rating = isset($_POST['Rating']) ? floatval($_POST['Rating']) : 0;
$Trailer_URL = $_POST['Trailer_URL'] ?? '';

// Proses upload gambar
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["error" => "Gambar harus diupload"]);
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
$allowed = ['jpg', 'jpeg', 'png', 'gif'];
if (!in_array(strtolower($ext), $allowed)) {
    echo json_encode(["error" => "Tipe file harus JPG, JPEG, PNG, atau GIF"]);
    exit;
}

if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
    
    // Insert ke database
    $sql = "INSERT INTO film (Judul_Film, Durasi, ID_Kategori, image, Director, Deskripsi, Trailer_URL, Rating) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssd", $Judul_Film, $Durasi, $ID_Kategori, $imageName, $Director, $Deskripsi, $Trailer_URL, $Rating);
    
    if ($stmt->execute()) {
        $last_id = $conn->insert_id;
        file_put_contents($log_file, "Success: Film ID " . $last_id . " added\n", FILE_APPEND);
        echo json_encode(["success" => true, "message" => "Film berhasil ditambahkan", "id" => $last_id]);
    } else {
        file_put_contents($log_file, "SQL Error: " . $stmt->error . "\n", FILE_APPEND);
        echo json_encode(["error" => "Gagal simpan ke database: " . $stmt->error]);
    }
    
    $stmt->close();
} else {
    file_put_contents($log_file, "Failed to move uploaded file\n", FILE_APPEND);
    echo json_encode(["error" => "Gagal upload file"]);
}

$conn->close();
?>