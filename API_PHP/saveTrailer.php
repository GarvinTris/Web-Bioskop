<?php
require_once 'database.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_trailer = isset($_POST['id_trailer']) ? $_POST['id_trailer'] : null;
    $id_film = $_POST['id_film'];
    $link_video = mysqli_real_escape_string($conn, $_POST['link_video']);
    $is_active = isset($_POST['is_active']) ? 1 : 0;
    
    // Validasi URL
    if (!filter_var($link_video, FILTER_VALIDATE_URL)) {
        echo json_encode(['success' => false, 'error' => 'URL video tidak valid']);
        exit;
    }
    
    // Jika trailer ini diaktifkan, nonaktifkan yang lain
    if ($is_active == 1) {
        mysqli_query($conn, "UPDATE trailer SET is_Active = 0");
    }
    
    if ($id_trailer) {
        // Update
        $query = "UPDATE trailer SET 
                  ID_Film = '$id_film',
                  Link_Video = '$link_video',
                  is_Active = '$is_active'
                  WHERE ID_Trailer = '$id_trailer'";
    } else {
        // Insert
        $query = "INSERT INTO trailer (ID_Film, Link_Video, is_Active) 
                  VALUES ('$id_film', '$link_video', '$is_active')";
    }
    
    if (mysqli_query($conn, $query)) {
        echo json_encode(['success' => true, 'message' => $id_trailer ? 'Trailer berhasil diupdate' : 'Trailer berhasil ditambahkan']);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }
}

$conn->close();
?>