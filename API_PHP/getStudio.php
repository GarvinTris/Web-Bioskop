<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek: " . $conn->connect_error]));
}

// Ambil semua data studio, urut berdasarkan nomor studio
$sql = "SELECT No_Studio, Nama_Studio FROM studio ORDER BY No_Studio";
$result = $conn->query($sql);

$studio = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $studio[] = $row;
    }
}

echo json_encode($studio);
$conn->close();
?>