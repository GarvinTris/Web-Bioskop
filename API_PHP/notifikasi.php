<?php
// notifikasi.php
require_once 'database.php';
requireAdminMfa();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$film_id = $data['film_id'];
$film_title = $data['film_title'];
$user_email = $data['user_email'];
$release_date = isset($data['release_date']) ? $data['release_date'] : null;

// Cek apakah sudah terdaftar dengan prepared statement
$check_sql = "SELECT * FROM notifications WHERE film_id = ? AND user_email = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("ss", $film_id, $user_email);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    $check_stmt->close();
    echo json_encode(['success' => false, 'message' => 'Anda sudah terdaftar untuk notifikasi film ini']);
    exit;
}
$check_stmt->close();

// Simpan notifikasi dengan prepared statement
$insert_sql = "INSERT INTO notifications (film_id, film_title, user_email, release_date, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
$insert_stmt = $conn->prepare($insert_sql);
$insert_stmt->bind_param("ssss", $film_id, $film_title, $user_email, $release_date);

if ($insert_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Berhasil mendaftarkan notifikasi']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan: ' . $insert_stmt->error]);
}

$insert_stmt->close();
?>