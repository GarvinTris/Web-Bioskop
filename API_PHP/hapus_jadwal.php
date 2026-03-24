<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek"]));
}

if (!isset($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID jadwal tidak ditemukan"]);
    exit;
}

$id_jadwal = $_GET['id'];

// CEK APAKAH JADWAL DIPAKAI DI TIKET ATAU TRANSAKSI
$check_sql = "SELECT COUNT(*) as total FROM tiket WHERE ID_Jadwal = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $id_jadwal);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
$check_row = $check_result->fetch_assoc();

if ($check_row['total'] > 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Jadwal tidak bisa dihapus karena masih memiliki tiket"
    ]);
    $check_stmt->close();
    $conn->close();
    exit;
}

// HAPUS JADWAL
$delete_sql = "DELETE FROM jadwal WHERE ID_Jadwal = ?";
$delete_stmt = $conn->prepare($delete_sql);
$delete_stmt->bind_param("s", $id_jadwal);

if ($delete_stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Jadwal berhasil dihapus"]);
} else {
    echo json_encode(["success" => false, "error" => $delete_stmt->error]);
}

$delete_stmt->close();
$conn->close();
?>