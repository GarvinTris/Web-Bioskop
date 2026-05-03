<?php
// reset_password.php - SECURE VERSION with Prepared Statements
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
    sendResponse(false, [], 'Token atau email tidak valid');
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Format email tidak valid');
    exit();
}

if (strlen($newPassword) < 8) {
    sendResponse(false, [], 'Password minimal 8 karakter');
    exit();
}

if (!preg_match('/[A-Za-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
    sendResponse(false, [], 'Password harus mengandung huruf dan angka');
    exit();
}

if ($newPassword !== $confirmPassword) {
    sendResponse(false, [], 'Password tidak cocok');
    exit();
}

// 🔐 AMAN: Gunakan Prepared Statement untuk SELECT
$currentDateTime = date('Y-m-d H:i:s');

$sql = "SELECT id, email FROM password_resets WHERE email = ? AND token = ? AND expires_at > ? AND used = 0";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    sendResponse(false, [], 'Terjadi kesalahan sistem');
    exit();
}

$stmt->bind_param("sss", $email, $token, $currentDateTime);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stmt->close();
    
    // 🔐 AMAN: Gunakan Prepared Statement untuk UPDATE password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $updateSql = "UPDATE penonton SET Password = ? WHERE Email = ?";
    $updateStmt = $conn->prepare($updateSql);
    
    if (!$updateStmt) {
        error_log("Prepare update failed: " . $conn->error);
        sendResponse(false, [], 'Terjadi kesalahan sistem');
        exit();
    }
    
    $updateStmt->bind_param("ss", $hashedPassword, $email);
    
    if ($updateStmt->execute()) {
        $updateStmt->close();
        
        // 🔐 AMAN: Gunakan Prepared Statement untuk UPDATE token status
        $updateTokenSql = "UPDATE password_resets SET used = 1 WHERE id = ?";
        $tokenStmt = $conn->prepare($updateTokenSql);
        
        if ($tokenStmt) {
            $tokenStmt->bind_param("i", $row['id']);
            $tokenStmt->execute();
            $tokenStmt->close();
        }
        
        sendResponse(true, [], 'Password berhasil direset! Silakan login.');
    } else {
        $updateStmt->close();
        error_log("Update password failed: " . $updateStmt->error);
        sendResponse(false, [], 'Gagal mengupdate password');
    }
} else {
    $stmt->close();
    // 🔐 AMAN: Beri response yang sama untuk keamanan (user enumeration protection)
    sendResponse(false, [], 'Token tidak valid atau sudah kadaluarsa');
}

$conn->close();
?>