<?php
// getUserTransactions.php
require_once 'database.php';

// 🔴 HAPUS semua header manual!
// HAPUS: header("Access-Control-Allow-Origin: *");
// HAPUS: header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 0);

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    exit;
}

$id = $conn->real_escape_string($_GET['id']);

$sql = "SELECT 
            t.ID_Transaksi,
            t.ID_Jadwal,
            t.Total_Harga,
            t.Metode_Pembayaran,
            t.Tanggal_Pemesanan,
            t.Kursi,
            t.Jumlah,
            f.Judul_Film,
            j.Tanggal as Tanggal_Tayang,
            j.Jam_Mulai,
            s.Nama_Studio,
            s.No_Studio,
            s.Harga_Tiket as Harga
        FROM transaksi t
        LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        LEFT JOIN studio s ON j.No_Studio = s.No_Studio
        WHERE t.ID_Penonton = '$id'
        ORDER BY t.Tanggal_Pemesanan DESC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query error: " . mysqli_error($conn)]);
    exit;
}

$transactions = [];
while ($row = mysqli_fetch_assoc($result)) {
    $kursi_list = [];
    if (!empty($row['Kursi'])) {
        $kursi_list = explode(',', $row['Kursi']);
        $kursi_list = array_map('trim', $kursi_list);
    }
    
    $transactions[] = [
        'ID_Transaksi' => $row['ID_Transaksi'],
        'ID_Jadwal' => $row['ID_Jadwal'],
        'Total_Harga' => (int)$row['Total_Harga'],
        'Metode_Pembayaran' => $row['Metode_Pembayaran'] ?? 'Transfer Bank',
        'Tanggal_Pemesanan' => $row['Tanggal_Pemesanan'],
        'Kursi' => implode(', ', $kursi_list),
        'Jumlah' => (int)($row['Jumlah'] ?? count($kursi_list)),
        'Judul_Film' => $row['Judul_Film'] ?? 'Film Tidak Diketahui',
        'Tanggal' => $row['Tanggal_Tayang'],
        'Jam_Mulai' => $row['Jam_Mulai'],
        'Nama_Studio' => $row['Nama_Studio'] ?? "Studio {$row['No_Studio']}",
        'No_Studio' => $row['No_Studio'],
        'Harga' => (int)($row['Harga'] ?? 50000)
    ];
}

echo json_encode(["success" => true, "transactions" => $transactions]);
?>