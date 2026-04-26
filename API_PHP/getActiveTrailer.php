<?php
// getActiveTrailer.php
require_once 'database.php';

// Hapus header manual karena database.php sudah mengatur

$sql = "SELECT 
            t.ID_Trailer,
            t.ID_Film,
            t.Link_Video,
            t.is_Active,
            f.Judul_Film,
            f.Deskripsi,
            f.Rating_Usia,
            f.Durasi,
            f.Rating,
            f.image
        FROM trailer t
        LEFT JOIN film f ON t.ID_Film = f.ID_Film
        WHERE t.is_Active = 1
        ORDER BY t.created_at DESC
        LIMIT 5";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query error: " . $conn->error]);
    exit;
}

$trailers = [];
while ($row = $result->fetch_assoc()) {
    // Extract YouTube video ID
    $video_id = '';
    if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/', $row['Link_Video'] ?? '', $matches)) {
        $video_id = $matches[1];
    }
    $row['Embed_URL'] = $video_id ? "https://www.youtube.com/embed/{$video_id}" : ($row['Link_Video'] ?? '');
    
    // Konversi durasi
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
    
    $trailers[] = $row;
}

echo json_encode([
    "success" => true,
    "trailers" => $trailers,
    "count" => count($trailers)
]);
?>