<?php
// getTrailer.php
require_once 'database.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);

// Cek apakah tabel trailer ada
$table_check = $conn->query("SHOW TABLES LIKE 'trailer'");
if ($table_check->num_rows == 0) {
    echo json_encode(["error" => "Tabel trailer belum dibuat", "data" => []]);
    exit;
}

$query = "SELECT t.*, 
          f.Judul_Film, 
          f.Deskripsi, 
          f.Rating_Usia,
          f.Durasi,
          f.Rating
          FROM trailer t
          LEFT JOIN film f ON t.ID_Film = f.ID_Film
          ORDER BY t.is_Active DESC, t.created_at DESC";

$result = $conn->query($query);

if (!$result) {
    echo json_encode(["error" => "Query error: " . $conn->error, "data" => []]);
    exit;
}

$trailers = [];
while ($row = $result->fetch_assoc()) {
    // Extract YouTube video ID untuk embed
    $video_id = '';
    if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/', $row['Link_Video'] ?? '', $matches)) {
        $video_id = $matches[1];
    }
    $row['Embed_URL'] = $video_id ? "https://www.youtube.com/embed/{$video_id}" : ($row['Link_Video'] ?? '');
    $trailers[] = $row;
}

echo json_encode($trailers);
?>