<?php
// getTransaction.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek"]);
    exit;
}

// Ambil semua transaksi dengan join ke penonton, jadwal, film, studio
$sql = "SELECT t.*, 
               p.Nama_Lengkap, 
               p.Email, 
               p.No_HP,
               f.Judul_Film, 
               j.Tanggal, 
               j.Jam_Mulai, 
               s.Nama_Studio,
               s.No_Studio
        FROM transaksi t
        LEFT JOIN penonton p ON t.ID_Penonton = p.ID_Penonton
        LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        LEFT JOIN studio s ON j.No_Studio = s.No_Studio
        ORDER BY t.Tanggal_Pemesanan DESC";

$result = $conn->query($sql);

$transactions = [];
while ($row = $result->fetch_assoc()) {
    $transactions[] = $row;
}

echo json_encode(["success" => true, "transactions" => $transactions]);

$conn->close();
?>