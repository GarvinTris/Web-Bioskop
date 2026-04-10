<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: *"); // Izinkan semua header
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rest of your code remains the same...
$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database gagal konek: " . $conn->connect_error, "data" => []]);
    exit;
}

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
    $conn->close();
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
$conn->close();
?>