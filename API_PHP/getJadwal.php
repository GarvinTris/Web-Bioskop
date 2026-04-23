<?php
// getJadwal.php
require_once 'database.php';
requireAdminMfa();
// Langsung pakai $conn dari database.php, jangan buat baru
$sql = "SELECT j.*, f.Judul_Film 
        FROM jadwal j
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        ORDER BY j.Tanggal DESC, j.Jam_Mulai DESC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Query error: " . $conn->error, "data" => []]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
// Jangan tutup koneksi karena sudah di database.php
?>