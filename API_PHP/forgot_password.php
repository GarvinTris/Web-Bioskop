<?php
// forgot_password.php - WORKING VERSION
require_once 'database.php';
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ambil data
$input = file_get_contents("php://input");
$data = json_decode($input, true);
$email = isset($data['email']) ? trim($data['email']) : '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email harus diisi']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Format email tidak valid']);
    exit();
}

// Cek email di tabel penonton
$stmt = $conn->prepare("SELECT ID_Penonton, Nama_Lengkap, Email FROM penonton WHERE Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Aman: jangan kasih tahu email tidak terdaftar
    echo json_encode(['success' => true, 'message' => 'Jika email terdaftar, link reset akan dikirim']);
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

// Generate token
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Hapus token lama untuk email ini
$delete = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
$delete->bind_param("s", $email);
$delete->execute();
$delete->close();

// Simpan token baru
$insert = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
$insert->bind_param("sss", $email, $token, $expires);

if (!$insert->execute()) {
    error_log("Failed to save token: " . $insert->error);
    echo json_encode(['success' => true, 'message' => 'Jika email terdaftar, link reset akan dikirim']);
    exit();
}
$insert->close();

// Buat link reset
$resetLink = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($email);

// Kirim email
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'garvintriskie15@gmail.com';
    $mail->Password   = 'lgkwgqztpavuhdvd';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->setFrom('garvintriskie15@gmail.com', 'Bioskop System');
    $mail->addAddress($user['Email'], $user['Nama_Lengkap']);
    
    $mail->isHTML(true);
    $mail->Subject = 'Reset Password - Web Bioskop';
    $mail->Body = "
    <html>
    <body>
        <h2>Reset Password</h2>
        <p>Halo <strong>{$user['Nama_Lengkap']}</strong>,</p>
        <p>Klik link di bawah untuk mereset password Anda:</p>
        <p><a href='{$resetLink}' style='background:#e50914;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>Reset Password</a></p>
        <p>Atau copy link ini: <br>{$resetLink}</p>
        <p>Link ini berlaku 1 jam.</p>
        <p>Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
    </body>
    </html>
    ";
    
    $mail->AltBody = "Reset password: {$resetLink}\n\nLink berlaku 1 jam.";
    $mail->send();
    
    echo json_encode(['success' => true, 'message' => 'Link reset password telah dikirim ke email Anda']);
    
} catch (Exception $e) {
    error_log("Email failed: " . $mail->ErrorInfo);
    echo json_encode(['success' => true, 'message' => 'Jika email terdaftar, link reset akan dikirim']);
}
?>