<?php
// penonton_login.php - Login untuk penonton biasa
require_once 'database.php';

checkRateLimit('login', 10, 60);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['identifier']) || !isset($data['password'])) {
    sendResponse(false, [], 'Email/Nomor HP dan password harus diisi!');
}

$identifier = mysqli_real_escape_string($conn, $data['identifier']);
$password = $data['password'];

if (!checkLoginAttempts($identifier)) {
    logSecurityEvent('LOGIN_BLOCKED', "Too many attempts for: $identifier");
    sendResponse(false, [], 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.', 429);
}

// Cek login dengan email atau No_HP
if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
    $query = "SELECT * FROM penonton WHERE Email = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $identifier);
} else {
    $no_hp = preg_replace('/\D/', '', $identifier);
    $query = "SELECT * FROM penonton WHERE No_HP = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $no_hp);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    recordLoginAttempt($identifier, false);
    logSecurityEvent('LOGIN_FAILED', "User not found: $identifier");
    sendResponse(false, [], 'Email/Nomor HP atau password salah!');
}

$user = mysqli_fetch_assoc($result);

if (password_verify($password, $user['Password'])) {
    recordLoginAttempt($identifier, true);
    session_regenerate_id(true);
    
    $_SESSION['user_id'] = $user['ID_Penonton'];
    $_SESSION['user_name'] = $user['Nama_Lengkap'];
    $_SESSION['user_email'] = $user['Email'];
    $_SESSION['user_no_hp'] = $user['No_HP'];
    $_SESSION['user_type'] = 'penonton';
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    
    logSecurityEvent('LOGIN_SUCCESS', "User: {$user['ID_Penonton']}");
    
    sendResponse(true, [
        'user' => [
            'ID_Penonton' => $user['ID_Penonton'],
            'Nama_Lengkap' => $user['Nama_Lengkap'],
            'Email' => $user['Email'],
            'No_HP' => $user['No_HP'],
            'is_admin' => false
        ]
    ], 'Login berhasil!');
} else {
    recordLoginAttempt($identifier, false);
    logSecurityEvent('LOGIN_FAILED', "Wrong password for: $identifier");
    sendResponse(false, [], 'Email/Nomor HP atau password salah!');
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>