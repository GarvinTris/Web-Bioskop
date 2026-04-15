<?php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

// Cek apakah ada parameter ID_Penonton (untuk user tertentu)
$id_penonton = isset($_GET['id_penonton']) ? $_GET['id_penonton'] : '';

if ($id_penonton) {
    // Ambil transaksi untuk user tertentu
    $sql = "SELECT t.*, p.Nama_Penonton, p.Email, 
                   f.Judul_Film, j.Tanggal, j.Jam_Mulai, s.Nama_Studio,
                   tk.ID_Kursi, tk.Harga
            FROM transaksi t
            LEFT JOIN penonton p ON t.ID_Penonton = p.ID_Penonton
            LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
            LEFT JOIN film f ON j.ID_Film = f.ID_Film
            LEFT JOIN studio s ON j.No_Studio = s.No_Studio
            LEFT JOIN tiket tk ON t.ID_Tiket = tk.ID_Tiket
            WHERE t.ID_Penonton = ?
            ORDER BY t.Tanggal_Pemesanan DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id_penonton);
} else {
    // Ambil semua transaksi (untuk admin)
    $sql = "SELECT t.*, p.Nama_Penonton, p.Email, 
                   f.Judul_Film, j.Tanggal, j.Jam_Mulai, s.Nama_Studio,
                   tk.ID_Kursi, tk.Harga
            FROM transaksi t
            LEFT JOIN penonton p ON t.ID_Penonton = p.ID_Penonton
            LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
            LEFT JOIN film f ON j.ID_Film = f.ID_Film
            LEFT JOIN studio s ON j.No_Studio = s.No_Studio
            LEFT JOIN tiket tk ON t.ID_Tiket = tk.ID_Tiket
            ORDER BY t.Tanggal_Pemesanan DESC";
    
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$transaksi = [];
while ($row = $result->fetch_assoc()) {
    $transaksi[] = $row;
}

echo json_encode($transaksi);
$conn->close();
?>