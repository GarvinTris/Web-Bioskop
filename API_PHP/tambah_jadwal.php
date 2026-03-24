<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek"]));
}

// CEK DATA POST
$ID_Jadwal = $_POST['ID_Jadwal'] ?? '';
$Tanggal = $_POST['Tanggal'] ?? '';
$Jam_Mulai = $_POST['Jam_Mulai'] ?? '';
$ID_Film = $_POST['ID_Film'] ?? '';
$No_Studio = $_POST['No_Studio'] ?? '';

if (empty($ID_Jadwal) || empty($Tanggal) || empty($Jam_Mulai) || empty($ID_Film) || empty($No_Studio)) {
    echo json_encode(["success" => false, "error" => "Semua field harus diisi"]);
    exit;
}

// CEK APAKAH ID_Jadwal SUDAH ADA
$check = $conn->prepare("SELECT ID_Jadwal FROM jadwal WHERE ID_Jadwal = ?");
$check->bind_param("s", $ID_Jadwal);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "ID Jadwal sudah digunakan"]);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// INSERT JADWAL BARU (dengan studio)
$sql = "INSERT INTO jadwal (ID_Jadwal, Tanggal, Jam_Mulai, No_Studio, ID_Film) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssii", $ID_Jadwal, $Tanggal, $Jam_Mulai, $No_Studio, $ID_Film);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Jadwal berhasil ditambahkan"]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>