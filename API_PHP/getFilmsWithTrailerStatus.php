<?php
// getFilmsWithTrailerStatus.php
require_once 'database.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$sql = "SELECT 
            f.ID_Film,
            f.Judul_Film,
            f.Nama_Kategori,
            f.Director,
            f.Deskripsi,
            f.Durasi,
            f.Rating_Usia,
            f.Rating,
            f.Trailer_URL,
            f.image,
            t.ID_Trailer,
            COALESCE(t.is_Active, 0) as trailer_active
        FROM film f
        LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
        LEFT JOIN trailer t ON f.ID_Film = t.ID_Film
        ORDER BY f.ID_Film DESC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query error: " . $conn->error]);
    exit;
}

$films = [];
while ($row = $result->fetch_assoc()) {
    // Konversi durasi ke format readable
    if (!empty($row['Durasi']) && $row['Durasi'] != '00:00:00') {
        $parts = explode(':', $row['Durasi']);
        $jam = (int)$parts[0];
        $menit = (int)$parts[1];
        if ($jam > 0 && $menit > 0) {
            $row['Durasi_Readable'] = $jam . ' jam ' . $menit . ' menit';
        } elseif ($jam > 0) {
            $row['Durasi_Readable'] = $jam . ' jam';
        } else {
            $row['Durasi_Readable'] = $menit . ' menit';
        }
    } else {
        $row['Durasi_Readable'] = 'Belum tersedia';
    }
    
    $row['has_trailer'] = !empty($row['Trailer_URL']);
    $row['trailer_active'] = ($row['trailer_active'] == 1);
    
    $films[] = $row;
}

echo json_encode([
    "success" => true,
    "films" => $films,
    "total_films" => count($films)
]);
?>