<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

$id_film = $_POST['ID_Film'] ?? '';
$judul = $_POST['Judul_Film'] ?? '';
$durasi = $_POST['Durasi'] ?? '';
$id_kategori = $_POST['ID_Kategori'] ?? '';
$director = $_POST['Director'] ?? '';
$rating = $_POST['Rating'] ?? '';
$deskripsi = $_POST['Deskripsi'] ?? ''; 
$trailer_url = $_POST['Trailer_URL'] ?? ''; 

// Cek apakah ada upload gambar baru
if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    // Upload gambar baru
    $imageName = time() . "_" . str_replace(' ', '_', $_FILES['image']['name']);
    $tmp = $_FILES['image']['tmp_name'];
    $uploadPath = "uploads/" . $imageName;
    
    if (move_uploaded_file($tmp, $uploadPath)) {
        // Update dengan gambar baru
        $sql = "UPDATE film SET 
                Judul_Film=?, Durasi=?, ID_Kategori=?, image=?, Director=?, Deskripsi=?, Trailer_URL=?, Rating=? 
                WHERE ID_Film=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissssdi", $judul, $durasi, $id_kategori, $imageName, $director, $deskripsi, $trailer_url, $rating, $id_film);
    } else {
        echo json_encode(["error" => "Gagal upload file"]);
        exit;
    }
} else {
    // Update tanpa gambar
    $sql = "UPDATE film SET 
            Judul_Film=?, Durasi=?, ID_Kategori=?, Director=?, Deskripsi=?, Trailer_URL=?, Rating=? 
            WHERE ID_Film=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssisssdi", $judul, $durasi, $id_kategori, $director, $deskripsi, $trailer_url, $rating, $id_film);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Film berhasil diupdate"]);
} else {
    echo json_encode(["error" => "Gagal update database: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>