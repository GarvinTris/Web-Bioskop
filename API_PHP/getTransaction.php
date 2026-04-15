<?php
// getUserTransactions.php
require_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    $conn->close();
    exit;
}

$id = $conn->real_escape_string($_GET['id']);

// Query transaksi dengan join ke jadwal, film, studio
// Sesuaikan dengan nama kolom di schema:
// transaksi: ID_Transaksi, ID_Penonton, ID_Jadwal, Total_Harga, Metode_Pembayaran, Tanggal_Pemesanan
// jadwal: ID_Jadwal, ID_Film, Tanggal, Jam_Mulai, No_Studio
// film: ID_Film, Judul_Film
// studio: No_Studio, Nama_Studio, Harga_Tiket

$sql = "SELECT 
            t.ID_Transaksi,
            t.Total_Harga,
            t.Metode_Pembayaran,
            t.Tanggal_Pemesanan,
            t.Kursi,
            f.Judul_Film,
            j.Tanggal as Tanggal_Tayang,
            j.Jam_Mulai,
            s.Nama_Studio,
            s.No_Studio,
            s.Harga_Tiket
        FROM transaksi t
        LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        LEFT JOIN studio s ON j.No_Studio = s.No_Studio
        WHERE t.ID_Penonton = '$id'
        ORDER BY t.Tanggal_Pemesanan DESC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query error: " . mysqli_error($conn)]);
    $conn->close();
    exit;
}

$transactions = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Format data untuk frontend
    $transactions[] = [
        'ID_Transaksi' => $row['ID_Transaksi'],
        'Total_Harga' => $row['Total_Harga'],
        'Metode_Pembayaran' => $row['Metode_Pembayaran'],
        'Tanggal_Pemesanan' => $row['Tanggal_Pemesanan'],
        'Kursi' => $row['Kursi'],
        'Judul_Film' => $row['Judul_Film'],
        'Tanggal' => $row['Tanggal_Tayang'],
        'Jam_Mulai' => $row['Jam_Mulai'],
        'Nama_Studio' => $row['Nama_Studio'],
        'No_Studio' => $row['No_Studio'],
        'Harga' => $row['Harga_Tiket']
    ];
}

echo json_encode(["success" => true, "transactions" => $transactions]);

$conn->close();
?>