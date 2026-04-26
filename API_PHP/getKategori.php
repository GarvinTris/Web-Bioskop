<?php
// getKategori.php
require_once 'database.php';
$sql = "SELECT ID_Kategori, Nama_Kategori FROM kategori ORDER BY Nama_Kategori";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Query gagal: " . $conn->error]);
    exit;
}

$kategori = [];
while ($row = $result->fetch_assoc()) {
    $kategori[] = $row;
}

echo json_encode($kategori);
?>