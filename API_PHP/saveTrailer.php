<?php
// saveTrailer.php
require_once 'database.php';
requireAdminMfa();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_trailer = isset($_POST['id_trailer']) ? $_POST['id_trailer'] : null;
    $id_film = $_POST['id_film'];
    $link_video = $_POST['link_video'];
    $is_active = isset($_POST['is_active']) ? 1 : 0;
    
    // Validasi URL
    if (!filter_var($link_video, FILTER_VALIDATE_URL)) {
        echo json_encode(['success' => false, 'error' => 'URL video tidak valid']);
        exit;
    }
    
    // Jika trailer ini diaktifkan, nonaktifkan yang lain
    if ($is_active == 1) {
        $update_active = "UPDATE trailer SET is_Active = 0";
        $conn->query($update_active);
    }
    
    if ($id_trailer) {
        // Update dengan prepared statement
        $query = "UPDATE trailer SET 
                  ID_Film = ?,
                  Link_Video = ?,
                  is_Active = ?
                  WHERE ID_Trailer = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssi", $id_film, $link_video, $is_active, $id_trailer);
    } else {
        // Insert dengan prepared statement
        $query = "INSERT INTO trailer (ID_Film, Link_Video, is_Active) 
                  VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssi", $id_film, $link_video, $is_active);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => $id_trailer ? 'Trailer berhasil diupdate' : 'Trailer berhasil ditambahkan']);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    
    $stmt->close();
}
?>