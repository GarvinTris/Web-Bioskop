<?php
// reset_password.php - SIMPLE WORKING VERSION
require_once 'database.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ambil data dari request
$input = file_get_contents("php://input");
$data = json_decode($input, true);

$token = isset($data['token']) ? trim($data['token']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$newPassword = isset($data['new_password']) ? $data['new_password'] : '';
$confirmPassword = isset($data['confirm_password']) ? $data['confirm_password'] : '';

// Validasi input
if (empty($token) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Token atau email tidak valid']);
    exit();
}

if (strlen($newPassword) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password minimal 8 karakter']);
    exit();
}

if ($newPassword !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Password tidak cocok']);
    exit();
}

// Cek token di database
$currentDateTime = date('Y-m-d H:i:s');
$sql = "SELECT * FROM password_resets WHERE email = '$email' AND token = '$token' AND expires_at > '$currentDateTime' AND used = 0";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    // Token valid, update password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateSql = "UPDATE penonton SET Password = '$hashedPassword' WHERE Email = '$email'";
    
    if ($conn->query($updateSql)) {
        // Tandai token sudah digunakan
        $row = $result->fetch_assoc();
        $updateToken = "UPDATE password_resets SET used = 1 WHERE id = " . $row['id'];
        $conn->query($updateToken);
        
        echo json_encode(['success' => true, 'message' => 'Password berhasil direset! Silakan login.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal mengupdate password: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Token tidak valid atau sudah kadaluarsa']);
}

$conn->close();
?>