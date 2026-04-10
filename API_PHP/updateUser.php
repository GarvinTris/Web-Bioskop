<?php
// updateUser.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database gagal konek: " . $conn->connect_error]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON data"]);
    $conn->close();
    exit;
}

if (!isset($data['id_penonton']) || empty($data['id_penonton'])) {
    echo json_encode(["success" => false, "error" => "ID user tidak ditemukan"]);
    $conn->close();
    exit;
}

$id = $conn->real_escape_string($data['id_penonton']);
$nama = $conn->real_escape_string($data['nama_lengkap']);
$email = $conn->real_escape_string($data['email']);
$no_hp = $conn->real_escape_string($data['no_hp']);

if (empty($nama) || empty($email) || empty($no_hp)) {
    echo json_encode(["success" => false, "error" => "Nama, Email, dan No HP harus diisi"]);
    $conn->close();
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Format email tidak valid"]);
    $conn->close();
    exit;
}

// Cek email duplikat
$checkEmail = "SELECT ID_Penonton FROM penonton WHERE Email = '$email' AND ID_Penonton != '$id'";
$result = $conn->query($checkEmail);
if ($result && $result->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "Email sudah digunakan user lain"]);
    $conn->close();
    exit;
}

// Update password jika diisi
if (isset($data['password']) && !empty($data['password'])) {
    if (strlen($data['password']) < 6) {
        echo json_encode(["success" => false, "error" => "Password minimal 6 karakter"]);
        $conn->close();
        exit;
    }
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $hashedPassword = $conn->real_escape_string($hashedPassword);
    
    $sql = "UPDATE penonton SET 
            Nama_Lengkap = '$nama',
            Email = '$email',
            No_HP = '$no_hp',
            Password = '$hashedPassword'
            WHERE ID_Penonton = '$id'";
} else {
    $sql = "UPDATE penonton SET 
            Nama_Lengkap = '$nama',
            Email = '$email',
            No_HP = '$no_hp'
            WHERE ID_Penonton = '$id'";
}

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "User berhasil diupdate"]);
} else {
    echo json_encode(["success" => false, "error" => "Update gagal: " . $conn->error]);
}

$conn->close();
?>