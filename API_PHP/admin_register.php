<?php
// admin_register.php - Registrasi admin (khusus untuk membuat admin pertama)
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

checkRateLimit('admin_register', 3, 3600);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    sendResponse(false, [], 'Data tidak diterima');
}

$required = ['nama_lengkap', 'email', 'password'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        sendResponse(false, [], "Field $field harus diisi!");
    }
}

$nama_lengkap = trim($data['nama_lengkap']);
$email = trim($data['email']);
$password = $data['password'];

// Validasi
if (!preg_match('/^[a-zA-Z\s]{3,50}$/', $nama_lengkap)) {
    sendResponse(false, [], 'Nama lengkap hanya boleh berisi huruf dan spasi (3-50 karakter)');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Format email tidak valid!');
}

if (strlen($password) < 8) {
    sendResponse(false, [], 'Password minimal 8 karakter!');
}
if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    sendResponse(false, [], 'Password harus mengandung huruf dan angka!');
}

// Cek email sudah terdaftar
$check_email = $conn->prepare("SELECT ID_Admin FROM admin WHERE Email = ?");
$check_email->bind_param("s", $email);
$check_email->execute();
if ($check_email->get_result()->num_rows > 0) {
    sendResponse(false, [], 'Email sudah terdaftar sebagai admin!');
}

// Generate ID_Admin
$result = $conn->query("SELECT ID_Admin FROM admin ORDER BY ID_Admin DESC LIMIT 1");
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $number = (int)substr($row['ID_Admin'], 3) + 1;
    $new_id = 'ADM' . str_pad($number, 3, '0', STR_PAD_LEFT);
} else {
    $new_id = 'ADM001';
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);

$query = "INSERT INTO admin (ID_Admin, Nama_Lengkap, Email, Password, Created_At) 
          VALUES (?, ?, ?, ?, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssss", $new_id, $nama_lengkap, $email, $hashed_password);

if ($stmt->execute()) {
    logSecurityEvent('ADMIN_REGISTER_SUCCESS', "New admin: $new_id");
    sendResponse(true, [
        'admin' => [
            'ID_Admin' => $new_id,
            'Nama_Lengkap' => $nama_lengkap,
            'Email' => $email
        ]
    ], 'Registrasi admin berhasil! Silakan login.');
} else {
    logSecurityEvent('ADMIN_REGISTER_FAILED', "Error: " . $stmt->error);
    sendResponse(false, [], 'Registrasi gagal: ' . $stmt->error);
}

$conn->close();
?>