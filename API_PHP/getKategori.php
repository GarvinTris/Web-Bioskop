<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

$sql = "SELECT ID_Kategori, Nama_Kategori FROM kategori ORDER BY Nama_Kategori";
$result = $conn->query($sql);

$kategori = [];
while ($row = $result->fetch_assoc()) {
    $kategori[] = $row;
}

echo json_encode($kategori);
$conn->close();
?>