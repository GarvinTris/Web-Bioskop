<?php
// getFilmWithTrailer.php - Ambil semua film dengan embedded trailer
require_once 'database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");

// Fungsi untuk extract YouTube ID dari berbagai format URL
function getYouTubeEmbedUrl($url) {
    if (empty($url)) return '';
    
    // Pattern untuk berbagai format YouTube URL
    $patterns = [
        '/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\?]+)/',
        '/youtube\.com\/shorts\/([^&\?]+)/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            $video_id = $matches[1];
            return "https://www.youtube.com/embed/{$video_id}?autoplay=0&rel=0&modestbranding=1";
        }
    }
    
    return $url;
}

$sql = "SELECT 
            f.ID_Film,
            f.Judul_Film,
            f.Deskripsi,
            f.Durasi,
            f.image,
            f.Rating,
            f.Rating_Usia,
            f.Trailer_URL as Trailer_Link,
            k.Nama_Kategori
        FROM film f
        LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
        WHERE f.status = 'available' OR f.status IS NULL
        ORDER BY f.ID_Film DESC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Query error: " . $conn->error, "data" => []]);
    exit;
}

$films = [];
while ($row = $result->fetch_assoc()) {
    // Format durasi
    if (!empty($row['Durasi'])) {
        $parts = explode(':', $row['Durasi']);
        $jam = (int)$parts[0];
        $menit = (int)$parts[1];
        if ($jam > 0 && $menit > 0) {
            $row['Durasi_Format'] = $jam . ' jam ' . $menit . ' menit';
        } elseif ($jam > 0) {
            $row['Durasi_Format'] = $jam . ' jam';
        } else {
            $row['Durasi_Format'] = $menit . ' menit';
        }
    } else {
        $row['Durasi_Format'] = 'Belum tersedia';
    }
    
    // Konversi trailer ke embed URL
    $row['Trailer_Embed_URL'] = getYouTubeEmbedUrl($row['Trailer_Link']);
    $row['Has_Trailer'] = !empty($row['Trailer_Embed_URL']);
    
    // Tambahkan thumbnail trailer (opsional)
    if (!empty($row['Trailer_Link'])) {
        preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/', $row['Trailer_Link'], $matches);
        if (!empty($matches[1])) {
            $row['Trailer_Thumbnail'] = "https://img.youtube.com/vi/{$matches[1]}/mqdefault.jpg";
        } else {
            $row['Trailer_Thumbnail'] = '';
        }
    } else {
        $row['Trailer_Thumbnail'] = '';
    }
    
    $films[] = $row;
}

echo json_encode($films);
?>