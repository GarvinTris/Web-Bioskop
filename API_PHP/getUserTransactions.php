<?php
// getUserTransactions.php
require_once 'database.php';

header('Access-Control-Allow-Methods: GET, OPTIONS');

if (!$conn) {
    sendResponse(false, [], 'Koneksi database gagal');
    exit;
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    sendResponse(false, [], 'ID user tidak ditemukan');
    exit;
}

$id = mysqli_real_escape_string($conn, $_GET['id']);

// Tambahkan kolom Kursi (simpan sebagai JSON atau string)
$sql = "SELECT t.*, 
        f.Judul_Film, 
        j.Tanggal, 
        j.Jam_Mulai, 
        s.Nama_Studio, 
        s.Harga_Tiket as Harga,
        '' as Kursi,
        '' as Metode_Pembayaran
        FROM transaksi t
        LEFT JOIN jadwal j ON t.ID_Jadwal = j.ID_Jadwal
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        LEFT JOIN studio s ON j.No_Studio = s.No_Studio
        WHERE t.ID_Penonton = '$id'
        ORDER BY t.Tanggal_Pemesanan DESC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    sendResponse(false, [], 'Query error: ' . mysqli_error($conn));
    exit;
}

$transactions = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Tambahkan kursi dari localStorage jika tidak ada di DB
    $transactions[] = $row;
}

sendResponse(true, ['transactions' => $transactions]);
mysqli_close($conn);
?>