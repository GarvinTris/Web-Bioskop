<?php
// clearAllTrailers.php
require_once 'database.php';
requireAdminMfa();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Method tidak diizinkan"]);
    exit;
}

$sql = "UPDATE trailer SET is_Active = 0";
$result = $conn->query($sql);

if ($result) {
    $affected = $conn->affected_rows;
    echo json_encode([
        "success" => true,
        "message" => "Semua trailer telah dinonaktifkan",
        "affected" => $affected
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => "Gagal menonaktifkan trailer: " . $conn->error
    ]);
}
?>