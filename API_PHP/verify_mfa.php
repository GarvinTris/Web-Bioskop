<?php
// verify_mfa.php - Verifikasi kode MFA untuk admin
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

if (!isset($_SESSION['mfa_code']) || !isset($_SESSION['mfa_code_time'])) {
    sendResponse(false, [], 'Sesi MFA tidak valid. Silakan login kembali.');
}

if (time() - $_SESSION['mfa_code_time'] > 300) {
    unset($_SESSION['mfa_code']);
    unset($_SESSION['mfa_code_time']);
    sendResponse(false, [], 'Kode MFA sudah kadaluarsa. Silakan login kembali.');
}

if (password_verify($code, $_SESSION['mfa_code'])) {
    $_SESSION['mfa_verified'] = true;
    unset($_SESSION['mfa_code']);
    unset($_SESSION['mfa_code_time']);
    
    logSecurityEvent('MFA_SUCCESS', "User {$_SESSION['user_id']} verified MFA");
    
    sendResponse(true, [
        'user' => [
            'ID_Penonton' => $_SESSION['user_id'],
            'Nama_Lengkap' => $_SESSION['user_name'],
            'Email' => $_SESSION['user_email'],
            'No_HP' => $_SESSION['user_no_hp'],
            'is_admin' => true
        ]
    ], 'Verifikasi berhasil');
} else {
    logSecurityEvent('MFA_FAILED', "User {$_SESSION['user_id']} failed MFA");
    sendResponse(false, [], 'Kode verifikasi salah');
}
?>