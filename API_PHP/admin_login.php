<?php
// admin_login.php - Login khusus admin dengan MFA
require_once 'database.php';
require_once 'send_email.php';

checkRateLimit('admin_login', 10, 60);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    sendResponse(false, [], 'Email dan password harus diisi!');
}

$email = mysqli_real_escape_string($conn, $data['email']);
$password = $data['password'];

if (!checkLoginAttempts($email)) {
    logSecurityEvent('LOGIN_BLOCKED', "Too many attempts for admin: $email");
    sendResponse(false, [], 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.', 429);
}

$query = "SELECT * FROM admin WHERE Email = ?";
$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    recordLoginAttempt($email, false);
    logSecurityEvent('ADMIN_LOGIN_FAILED', "Admin not found: $email");
    sendResponse(false, [], 'Email atau password salah!');
}

$admin = mysqli_fetch_assoc($result);

if (password_verify($password, $admin['Password'])) {
    recordLoginAttempt($email, true);
    
    // 🔐 GENERATE MFA CODE
    $mfa_code = sprintf("%06d", mt_rand(0, 999999));
    $hashed_code = password_hash($mfa_code, PASSWORD_DEFAULT);
    
    $_SESSION['pending_admin'] = [
        'user_id' => $admin['ID_Admin'],
        'user_name' => $admin['Nama_Lengkap'],
        'user_email' => $admin['Email'],
        'user_role' => $admin['Role'] ?? 'admin',
        'mfa_code' => $hashed_code,
        'mfa_code_time' => time()
    ];
    
    // 📧 KIRIM EMAIL
    $emailSent = sendMfaEmail(
        $admin['Email'],
        $admin['Nama_Lengkap'],
        $mfa_code
    );
    
    logSecurityEvent('MFA_SENT', "MFA code sent to admin: {$admin['Email']} - Email sent: " . ($emailSent ? 'YES' : 'NO'));
    
    sendResponse(false, ['requires_mfa' => true], 'Kode verifikasi MFA telah dikirim ke email Anda', 401);
    
} else {
    recordLoginAttempt($email, false);
    logSecurityEvent('ADMIN_LOGIN_FAILED', "Wrong password for admin: $email");
    sendResponse(false, [], 'Email atau password salah!');
}

mysqli_stmt_close($stmt);
?>