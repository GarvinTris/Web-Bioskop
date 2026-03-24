<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

$sql = "SELECT j.*, f.Judul_Film 
        FROM jadwal j
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        ORDER BY j.Tanggal DESC, j.Jam_Mulai DESC";

$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>