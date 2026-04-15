<?php
// admin_login.php - Login khusus admin
require_once 'database.php';

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
    session_regenerate_id(true);
    
    $_SESSION['user_id'] = $admin['ID_Admin'];
    $_SESSION['user_name'] = $admin['Nama_Lengkap'];
    $_SESSION['user_email'] = $admin['Email'];
    $_SESSION['user_role'] = $admin['Role'];
    $_SESSION['user_type'] = 'admin';
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    
    // Update last login
    $conn->query("UPDATE admin SET Last_Login = NOW() WHERE ID_Admin = '{$admin['ID_Admin']}'");
    
    logSecurityEvent('ADMIN_LOGIN_SUCCESS', "Admin: {$admin['ID_Admin']}");
    
    sendResponse(true, [
        'user' => [
            'id' => $admin['ID_Admin'],
            'name' => $admin['Nama_Lengkap'],
            'email' => $admin['Email'],
            'role' => $admin['Role'],
            'is_admin' => true
        ]
    ], 'Login admin berhasil!');
} else {
    recordLoginAttempt($email, false);
    logSecurityEvent('ADMIN_LOGIN_FAILED', "Wrong password for admin: $email");
    sendResponse(false, [], 'Email atau password salah!');
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>