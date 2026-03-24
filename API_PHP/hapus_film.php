<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Koneksi database
$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek"]));
}

// CEK APAKAH ADA PARAMETER ID
if (!isset($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID film tidak ditemukan"]);
    exit;
}

$id_film = intval($_GET['id']);

// CEK METODE REQUEST (bisa DELETE atau GET dengan parameter delete=1)
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'DELETE' || ($method === 'GET' && isset($_GET['confirm']))) {
    
    // CEK APAKAH FILM DIPAKAI DI TABEL LAIN (jadwal, tiket, transaksi)
    $check_sql = "SELECT COUNT(*) as total FROM jadwal WHERE ID_Film = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $id_film);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    $check_row = $check_result->fetch_assoc();
    
    if ($check_row['total'] > 0) {
        echo json_encode([
            "success" => false, 
            "error" => "Film tidak bisa dihapus karena masih memiliki jadwal tayang"
        ]);
        $check_stmt->close();
        $conn->close();
        exit;
    }
    
    // AMBIL NAMA FILE GAMBAR SEBELUM DIHAPUS (untuk hapus file)
    $img_sql = "SELECT image FROM film WHERE ID_Film = ?";
    $img_stmt = $conn->prepare($img_sql);
    $img_stmt->bind_param("i", $id_film);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();
    $img_row = $img_result->fetch_assoc();
    $image_file = $img_row['image'] ?? '';
    $img_stmt->close();
    
    // HAPUS DATA FILM
    $delete_sql = "DELETE FROM film WHERE ID_Film = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $id_film);
    
    if ($delete_stmt->execute()) {
        // HAPUS FILE GAMBAR DARI FOLDER UPLOADS
        if (!empty($image_file)) {
            $file_path = "uploads/" . $image_file;
            if (file_exists($file_path)) {
                unlink($file_path); // Hapus file
            }
        }
        
        echo json_encode(["success" => true, "message" => "Film berhasil dihapus"]);
    } else {
        echo json_encode(["success" => false, "error" => $delete_stmt->error]);
    }
    
    $delete_stmt->close();
    
} else {
    echo json_encode(["success" => false, "error" => "Method tidak diizinkan"]);
}

$conn->close();
?>