<?php
// toggleTrailerActive.php
require_once 'database.php';
requireAdminMfa();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Method tidak diizinkan"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Data tidak valid"]);
    exit;
}

$id_film = isset($data['id_film']) ? intval($data['id_film']) : 0;
$is_active = isset($data['is_active']) ? intval($data['is_active']) : 0;

if ($id_film <= 0) {
    echo json_encode(["success" => false, "error" => "ID Film tidak valid"]);
    exit;
}

$film_query = "SELECT Judul_Film, Trailer_URL FROM film WHERE ID_Film = ?";
$film_stmt = $conn->prepare($film_query);
$film_stmt->bind_param("i", $id_film);
$film_stmt->execute();
$film_result = $film_stmt->get_result();
$film = $film_result->fetch_assoc();
$film_stmt->close();

if (!$film) {
    echo json_encode(["success" => false, "error" => "Film tidak ditemukan"]);
    exit;
}

if (empty($film['Trailer_URL'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Film '{$film['Judul_Film']}' tidak memiliki URL trailer."
    ]);
    exit;
}

$conn->begin_transaction();

try {
    // Jika mengaktifkan, nonaktifkan SEMUA trailer lain (hanya 1 yang aktif)
    if ($is_active == 1) {
        $conn->query("UPDATE trailer SET is_Active = 0");
    }
    
    $check_sql = "SELECT ID_Trailer FROM trailer WHERE ID_Film = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $id_film);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    $check_stmt->close();
    
    if ($check_result->num_rows > 0) {
        $sql = "UPDATE trailer SET is_Active = ? WHERE ID_Film = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $is_active, $id_film);
    } else {
        $sql = "INSERT INTO trailer (ID_Film, Link_Video, is_Active, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isi", $id_film, $film['Trailer_URL'], $is_active);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Gagal menyimpan: " . $stmt->error);
    }
    $stmt->close();
    
    $conn->commit();
    
    $status_text = $is_active ? "diaktifkan" : "dinonaktifkan";
    echo json_encode([
        "success" => true,
        "message" => "Trailer film '{$film['Judul_Film']}' telah {$status_text}",
        "is_active" => $is_active
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>