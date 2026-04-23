<?php
// verify_mfa.php - Verifikasi kode MFA untuk admin SAJA
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    sendResponse(false, [], 'Method tidak diizinkan', 405);
}

checkRateLimit('mfa', 5, 60);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['code'])) {
    sendResponse(false, [], 'Kode verifikasi diperlukan');
}

$code = $data['code'];

// Hanya cek untuk admin pending
if (!isset($_SESSION['pending_admin'])) {
    sendResponse(false, [], 'Sesi tidak valid. Silakan login kembali.');
}

$pending = $_SESSION['pending_admin'];

// Cek kadaluarsa (5 menit)
if (time() - $pending['mfa_code_time'] > 300) {
    unset($_SESSION['pending_admin']);
    sendResponse(false, [], 'Kode MFA sudah kadaluarsa. Silakan login kembali.', 401);
}

// Verifikasi kode
if (password_verify($code, $pending['mfa_code'])) {
    // Login sukses - buat session admin
    session_regenerate_id(true);
    
    $_SESSION['user_id'] = $pending['user_id'];
    $_SESSION['user_name'] = $pending['user_name'];
    $_SESSION['user_email'] = $pending['user_email'];
    $_SESSION['user_role'] = $pending['user_role'];
    $_SESSION['user_type'] = 'admin';
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    $_SESSION['mfa_verified'] = true; // Tanda MFA sudah terverifikasi
    
    // Hapus data pending
    unset($_SESSION['pending_admin']);
    
    // Update last login
    $conn->query("UPDATE admin SET Last_Login = NOW() WHERE ID_Admin = '{$_SESSION['user_id']}'");
    
    logSecurityEvent('ADMIN_LOGIN_SUCCESS', "Admin: {$_SESSION['user_id']} - MFA verified");
    
    sendResponse(true, [
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role'],
            'is_admin' => true
        ]
    ], 'Login admin berhasil!');
    
} else {
    logSecurityEvent('MFA_FAILED', "Admin failed MFA - wrong code");
    sendResponse(false, [], 'Kode verifikasi salah');
}
?>