<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

// CEK DATA POST
$Judul_Film = $_POST['Judul_Film'] ?? '';
$Durasi = $_POST['Durasi'] ?? '';
$ID_Kategori = $_POST['ID_Kategori'] ?? '';
$Director = $_POST['Director'] ?? '';
$Rating = $_POST['Rating'] ?? '';
$Deskripsi = $_POST['Deskripsi'] ?? ''; 
$Trailer_URL = $_POST['Trailer_URL'] ?? ''; 

// CEK FILE GAMBAR
if (!isset($_FILES['image'])) {
    echo json_encode(["error" => "Image tidak ditemukan"]);
    exit;
}

// UPLOAD GAMBAR
$imageName = time() . "_" . str_replace(' ', '_', $_FILES['image']['name']);
$tmp = $_FILES['image']['tmp_name'];
$uploadPath = "uploads/" . $imageName;

if (move_uploaded_file($tmp, $uploadPath)) {
    
    // INSERT KE DATABASE (dengan deskripsi & trailer)
    $sql = "INSERT INTO film 
            (Judul_Film, Durasi, ID_Kategori, image, Director, Deskripsi, Trailer_URL, Rating) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssd", $Judul_Film, $Durasi, $ID_Kategori, $imageName, $Director, $Deskripsi, $Trailer_URL, $Rating);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Upload success"]);
    } else {
        echo json_encode(["error" => "Gagal simpan ke database: " . $stmt->error]);
    }
    
    $stmt->close();
    
} else {
    echo json_encode(["error" => "Gagal upload file"]);
}

$conn->close();
?>