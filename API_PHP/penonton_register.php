<?php
// penonton_register.php - Registrasi penonton biasa
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';

checkRateLimit('register', 5, 3600);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    sendResponse(false, [], 'Data tidak diterima');
}

$required = ['nama_lengkap', 'email', 'no_hp', 'password'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        sendResponse(false, [], "Field $field harus diisi!");
    }
}

$nama_lengkap = trim($data['nama_lengkap']);
$email = trim($data['email']);
$no_hp = trim($data['no_hp']);
$password = $data['password'];

// Validasi
if (!preg_match('/^[a-zA-Z\s]{3,50}$/', $nama_lengkap)) {
    sendResponse(false, [], 'Nama lengkap hanya boleh berisi huruf dan spasi (3-50 karakter)');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Format email tidak valid!');
}

if (!preg_match('/^(08|8|\+62|62)(\d{8,12})$/', $no_hp)) {
    sendResponse(false, [], 'Format nomor HP tidak valid! Contoh: 081234567890');
}

if (strlen($password) < 8) {
    sendResponse(false, [], 'Password minimal 8 karakter!');
}
if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    sendResponse(false, [], 'Password harus mengandung huruf dan angka!');
}

// Format nomor HP
$no_hp = preg_replace('/\D/', '', $no_hp);
if (substr($no_hp, 0, 2) == '62') {
    $no_hp = '0' . substr($no_hp, 2);
} elseif (substr($no_hp, 0, 1) == '8' && strlen($no_hp) == 11) {
    $no_hp = '0' . $no_hp;
}

// Cek email
$check_email = $conn->prepare("SELECT ID_Penonton FROM penonton WHERE Email = ?");
$check_email->bind_param("s", $email);
$check_email->execute();
if ($check_email->get_result()->num_rows > 0) {
    sendResponse(false, [], 'Email sudah terdaftar!');
}

// Cek No_HP
$check_phone = $conn->prepare("SELECT ID_Penonton FROM penonton WHERE No_HP = ?");
$check_phone->bind_param("s", $no_hp);
$check_phone->execute();
if ($check_phone->get_result()->num_rows > 0) {
    sendResponse(false, [], 'Nomor HP sudah terdaftar!');
}

// Generate ID_Penonton
$result = $conn->query("SELECT ID_Penonton FROM penonton ORDER BY ID_Penonton DESC LIMIT 1");
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $number = (int)substr($row['ID_Penonton'], 1) + 1;
    $new_id = 'P' . str_pad($number, 3, '0', STR_PAD_LEFT);
} else {
    $new_id = 'P001';
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);

$query = "INSERT INTO penonton (ID_Penonton, Nama_Lengkap, Email, No_HP, Password, Tanggal_Daftar) 
          VALUES (?, ?, ?, ?, ?, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param("sssss", $new_id, $nama_lengkap, $email, $no_hp, $hashed_password);

if ($stmt->execute()) {
    logSecurityEvent('REGISTER_SUCCESS', "New user: $new_id");
    sendResponse(true, [
        'user' => [
            'ID_Penonton' => $new_id,
            'Nama_Lengkap' => $nama_lengkap,
            'Email' => $email,
            'No_HP' => $no_hp
        ]
    ], 'Pendaftaran berhasil! Silakan login.');
} else {
    logSecurityEvent('REGISTER_FAILED', "Error: " . $stmt->error);
    sendResponse(false, [], 'Pendaftaran gagal: ' . $stmt->error);
}

$conn->close();
?>