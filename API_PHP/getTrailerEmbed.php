<?php
// getTrailerEmbed.php - Ambil embed trailer berdasarkan ID film
require_once 'database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");

if (!isset($_GET['id_film']) || empty($_GET['id_film'])) {
    echo json_encode(["success" => false, "error" => "ID Film diperlukan"]);
    exit;
}

$id_film = intval($_GET['id_film']);

$sql = "SELECT Trailer_URL FROM film WHERE ID_Film = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_film);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Film tidak ditemukan"]);
    exit;
}

$row = $result->fetch_assoc();
$trailer_url = $row['Trailer_URL'];
$stmt->close();

// Konversi ke embed URL
function getYouTubeEmbedUrl($url) {
    if (empty($url)) return '';
    
    $patterns = [
        '/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\?]+)/',
        '/youtube\.com\/shorts\/([^&\?]+)/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            $video_id = $matches[1];
            return "https://www.youtube.com/embed/{$video_id}?autoplay=0&rel=0&modestbranding=1&showinfo=0";
        }
    }
    
    return $url;
}

$embed_url = getYouTubeEmbedUrl($trailer_url);

echo json_encode([
    "success" => true,
    "embed_url" => $embed_url,
    "has_trailer" => !empty($embed_url)
]);
?>