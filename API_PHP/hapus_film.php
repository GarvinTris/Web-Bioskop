<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]));
}

// CEK APAKAH ADA PARAMETER ID
if (!isset($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID film tidak ditemukan"]);
    exit;
}

$id_film = intval($_GET['id']);

// CEK METODE REQUEST
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'DELETE' || ($method === 'GET' && isset($_GET['confirm']))) {
    
    // Mulai transaksi
    $conn->begin_transaction();
    
    try {
        // CEK APAKAH FILM DIPAKAI DI TABEL JADWAL
        $check_sql = "SELECT COUNT(*) as total FROM jadwal WHERE ID_Film = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("i", $id_film);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $check_row = $check_result->fetch_assoc();
        
        if ($check_row['total'] > 0) {
            throw new Exception("Film tidak bisa dihapus karena masih memiliki jadwal tayang");
        }
        $check_stmt->close();
        
        // CEK APAKAH FILM DIPAKAI DI TABEL TRAILER
        $check_trailer = "SELECT COUNT(*) as total FROM trailer WHERE ID_Film = ?";
        $trailer_stmt = $conn->prepare($check_trailer);
        $trailer_stmt->bind_param("i", $id_film);
        $trailer_stmt->execute();
        $trailer_result = $trailer_stmt->get_result();
        $trailer_row = $trailer_result->fetch_assoc();
        
        if ($trailer_row['total'] > 0) {
            // Hapus trailer terlebih dahulu
            $delete_trailer = "DELETE FROM trailer WHERE ID_Film = ?";
            $del_trailer_stmt = $conn->prepare($delete_trailer);
            $del_trailer_stmt->bind_param("i", $id_film);
            $del_trailer_stmt->execute();
            $del_trailer_stmt->close();
        }
        $trailer_stmt->close();
        
        // AMBIL NAMA FILE GAMBAR SEBELUM DIHAPUS
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
        
        if (!$delete_stmt->execute()) {
            throw new Exception("Gagal menghapus film: " . $delete_stmt->error);
        }
        
        // HAPUS FILE GAMBAR
        if (!empty($image_file)) {
            $file_path = "uploads/" . $image_file;
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }
        
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Film berhasil dihapus"]);
        
        $delete_stmt->close();
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    
} else {
    echo json_encode(["success" => false, "error" => "Method tidak diizinkan"]);
}

$conn->close();
?>