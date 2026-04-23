<?php
// getTransaction.php
require_once 'database.php';
requireAdminMfa();
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    exit;
}

$id = $_GET['id'];

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
        WHERE t.ID_Penonton = ?
        ORDER BY t.Tanggal_Pemesanan DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query error: " . $conn->error]);
    exit;
}

$transactions = [];
while ($row = $result->fetch_assoc()) {
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

$stmt->close();
echo json_encode(["success" => true, "transactions" => $transactions]);
?>