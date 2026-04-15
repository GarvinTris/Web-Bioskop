<?php
// jadwal.php
require_once 'database.php';

// 🔴 JANGAN TAMBAHKAN HEADER MANUAL APAPUN!
// Karena database.php sudah mengatur semua header CORS

// Langsung ke kode
$sql = "SELECT 
            j.ID_Jadwal,
            j.ID_Film,
            j.Tanggal,
            j.Jam_Mulai,
            j.No_Studio,
            f.Judul_Film as judul_film,
            f.Durasi
        FROM jadwal j
        LEFT JOIN film f ON j.ID_Film = f.ID_Film
        ORDER BY j.Tanggal DESC, j.Jam_Mulai ASC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Query error: " . $conn->error, "data" => []]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    if ($row['Jam_Mulai']) {
        $row['Jam_Mulai'] = substr($row['Jam_Mulai'], 0, 5);
    }
    
    $row['Harga'] = 50000;
    $row['Nama_Studio'] = "Studio " . $row['No_Studio'];
    
    if (!empty($row['Durasi']) && $row['Durasi'] != '00:00:00') {
        $parts = explode(':', $row['Durasi']);
        $jam = (int)$parts[0];
        $menit = (int)$parts[1];
        if ($jam > 0 && $menit > 0) {
            $row['Durasi'] = $jam . ' jam ' . $menit . ' menit';
        } elseif ($jam > 0) {
            $row['Durasi'] = $jam . ' jam';
        } else {
            $row['Durasi'] = $menit . ' menit';
        }
    } else {
        $row['Durasi'] = 'Belum tersedia';
    }
    
    $data[] = $row;
}

echo json_encode($data);
exit;
?>