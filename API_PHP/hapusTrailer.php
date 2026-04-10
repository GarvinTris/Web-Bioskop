<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

// Terima request dari method GET, POST, atau DELETE
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']); // Konversi ke integer untuk keamanan
    
    // Gunakan prepared statement untuk keamanan
    $query = "DELETE FROM trailer WHERE ID_Trailer = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Trailer berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Data trailer tidak ditemukan']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Gagal menghapus: ' . $stmt->error]);
    }
    
    $stmt->close();
    
} elseif ($method === 'POST' && isset($_POST['id'])) {
    // Jika menggunakan method POST
    $id = intval($_POST['id']);
    
    $query = "DELETE FROM trailer WHERE ID_Trailer = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Trailer berhasil dihapus']);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    
    $stmt->close();
    
} elseif ($method === 'DELETE') {
    // Jika menggunakan method DELETE
    parse_str(file_get_contents("php://input"), $delete_vars);
    $id = isset($delete_vars['id']) ? intval($delete_vars['id']) : 0;
    
    if ($id > 0) {
        $query = "DELETE FROM trailer WHERE ID_Trailer = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Trailer berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'ID tidak valid']);
    }
    
} else {
    echo json_encode(['success' => false, 'error' => 'Parameter ID tidak ditemukan. Gunakan ?id=angka']);
}

$conn->close();
?>