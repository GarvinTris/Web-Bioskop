<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]));
}

// Ambil data dari POST
$id_film = isset($_POST['ID_Film']) ? intval($_POST['ID_Film']) : 0;
$judul = isset($_POST['Judul_Film']) ? $conn->real_escape_string($_POST['Judul_Film']) : '';
$durasi = isset($_POST['Durasi']) ? $_POST['Durasi'] : '';
$id_kategori = isset($_POST['ID_Kategori']) ? $conn->real_escape_string($_POST['ID_Kategori']) : '';
$director = isset($_POST['Director']) ? $conn->real_escape_string($_POST['Director']) : '';
$rating = isset($_POST['Rating']) ? floatval($_POST['Rating']) : 0;
$rating_usia = isset($_POST['Rating_Usia']) ? $conn->real_escape_string($_POST['Rating_Usia']) : '';
$deskripsi = isset($_POST['Deskripsi']) ? $conn->real_escape_string($_POST['Deskripsi']) : ''; 
$trailer_url = isset($_POST['Trailer_URL']) ? $conn->real_escape_string($_POST['Trailer_URL']) : '';

// Validasi ID film
if ($id_film <= 0) {
    echo json_encode(["success" => false, "error" => "ID Film tidak valid"]);
    exit;
}

// Validasi field wajib
if (empty($judul) || empty($id_kategori) || empty($director) || empty($deskripsi) || empty($durasi)) {
    echo json_encode(["success" => false, "error" => "Semua field wajib harus diisi!"]);
    exit;
}

// Validasi Rating_Usia
$allowed_ratings = ['SU', 'P', 'A', 'R', 'D', 'BO'];
if (!empty($rating_usia) && !in_array($rating_usia, $allowed_ratings)) {
    echo json_encode(["success" => false, "error" => "Klasifikasi usia tidak valid"]);
    exit;
}

// Konversi durasi ke format time jika perlu
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

$durasi_formatted = convertToTimeFormat($durasi);

// Cek apakah ada upload gambar baru
if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    // Validasi file gambar
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, $allowed)) {
        echo json_encode(["success" => false, "error" => "Tipe file harus JPG, JPEG, PNG, GIF, atau WEBP"]);
        exit;
    }
    
    if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
        echo json_encode(["success" => false, "error" => "Ukuran file maksimal 5MB"]);
        exit;
    }
    
    // Ambil gambar lama untuk dihapus
    $old_img_query = "SELECT image FROM film WHERE ID_Film = ?";
    $old_stmt = $conn->prepare($old_img_query);
    $old_stmt->bind_param("i", $id_film);
    $old_stmt->execute();
    $old_result = $old_stmt->get_result();
    $old_img = $old_result->fetch_assoc();
    $old_stmt->close();
    
    // Upload gambar baru
    $imageName = time() . "_" . uniqid() . "." . $ext;
    $uploadPath = "uploads/" . $imageName;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
        // Hapus gambar lama
        if ($old_img && !empty($old_img['image']) && file_exists("uploads/" . $old_img['image'])) {
            unlink("uploads/" . $old_img['image']);
        }
        
        // Update dengan gambar baru
        $sql = "UPDATE film SET 
                Judul_Film=?, Durasi=?, ID_Kategori=?, image=?, Director=?, Deskripsi=?, Trailer_URL=?, Rating=?, Rating_Usia=? 
                WHERE ID_Film=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssdsi", $judul, $durasi_formatted, $id_kategori, $imageName, $director, $deskripsi, $trailer_url, $rating, $rating_usia, $id_film);
    } else {
        echo json_encode(["success" => false, "error" => "Gagal upload file"]);
        exit;
    }
} else {
    // Update tanpa gambar
    $sql = "UPDATE film SET 
            Judul_Film=?, Durasi=?, ID_Kategori=?, Director=?, Deskripsi=?, Trailer_URL=?, Rating=?, Rating_Usia=? 
            WHERE ID_Film=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssdsi", $judul, $durasi_formatted, $id_kategori, $director, $deskripsi, $trailer_url, $rating, $rating_usia, $id_film);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Film berhasil diupdate"]);
} else {
    echo json_encode(["success" => false, "error" => "Gagal update database: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>