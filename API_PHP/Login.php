<?php
// login.php
session_start();
require_once 'database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['identifier']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Email/Nomor HP dan password harus diisi!'
    ]);
    exit;
}

$identifier = mysqli_real_escape_string($conn, $data['identifier']);
$password = $data['password'];

// Cek apakah identifier email atau nomor HP
if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
    $query = "SELECT * FROM penonton WHERE Email = '$identifier'";
} else {
    $no_hp = preg_replace('/\D/', '', $identifier);
    $query = "SELECT * FROM penonton WHERE No_HP = '$no_hp'";
}

$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) == 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Email/Nomor HP atau password salah!'
    ]);
    exit;
}

$user = mysqli_fetch_assoc($result);

if (password_verify($password, $user['Password'])) {
    $_SESSION['user_id'] = $user['ID_Penonton'];
    $_SESSION['user_name'] = $user['Nama_Lengkap'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login berhasil!',
        'user' => [
            'ID_Penonton' => $user['ID_Penonton'],
            'Nama_Lengkap' => $user['Nama_Lengkap'],
            'Email' => $user['Email'],
            'No_HP' => $user['No_HP']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Email/Nomor HP atau password salah!'
    ]);
}

mysqli_close($conn);
?>