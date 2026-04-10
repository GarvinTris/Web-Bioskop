<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek"]);
    exit;
}

if (isset($_GET['id_jadwal'])) {
    $id_jadwal = $_GET['id_jadwal'];
    
    // Ambil kursi yang sudah dipesan dari tabel tiket (status = terjual/terpesan)
    $query = "SELECT k.ID_Kursi, k.Baris, k.Nomor_Kursi 
              FROM tiket t
              JOIN kursi k ON t.ID_Kursi = k.ID_Kursi
              WHERE t.ID_Jadwal = ? AND t.Status = 'terjual'";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $id_jadwal);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookedSeats = [];
    while ($row = $result->fetch_assoc()) {
        // Format kursi seperti "A1", "B2", dll
        $bookedSeats[] = $row['Baris'] . $row['Nomor_Kursi'];
    }
    
    echo json_encode(["success" => true, "booked_seats" => $bookedSeats]);
} else {
    echo json_encode(["success" => false, "error" => "ID Jadwal tidak ditemukan"]);
}

$conn->close();
?>