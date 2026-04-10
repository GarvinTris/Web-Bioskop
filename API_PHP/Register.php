<?php
// register.php
require_once 'database.php';

// Hapus header yang sudah ada di database.php, cukup tambahkan yang diperlukan
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Debug: Log data yang diterima
error_log("Register data: " . print_r($data, true));

if (!isset($data['nama_lengkap']) || !isset($data['email']) || !isset($data['no_hp']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Semua field harus diisi!'
    ]);
    exit;
}

$nama_lengkap = mysqli_real_escape_string($conn, $data['nama_lengkap']);
$email = mysqli_real_escape_string($conn, $data['email']);
$no_hp = mysqli_real_escape_string($conn, $data['no_hp']);
$password = $data['password'];

// Validasi email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Format email tidak valid!'
    ]);
    exit;
}

// Validasi nomor HP
if (!preg_match('/^(08|8|\+62|62)(\d{8,12})$/', $no_hp)) {
    echo json_encode([
        'success' => false,
        'message' => 'Format nomor HP tidak valid! Contoh: 081234567890'
    ]);
    exit;
}

// Validasi password
if (strlen($password) < 6) {
    echo json_encode([
        'success' => false,
        'message' => 'Password minimal 6 karakter!'
    ]);
    exit;
}

// Format nomor HP
$no_hp = preg_replace('/\D/', '', $no_hp);
if (substr($no_hp, 0, 2) == '62') {
    $no_hp = '0' . substr($no_hp, 2);
} elseif (substr($no_hp, 0, 1) == '8' && strlen($no_hp) == 11) {
    $no_hp = '0' . $no_hp;
}

// Cek nama tabel yang digunakan
// Coba cek apakah tabel 'penonton' atau 'web_bioskop penonton' yang ada
$table_check = mysqli_query($conn, "SHOW TABLES LIKE 'penonton'");
if (mysqli_num_rows($table_check) == 0) {
    $table_check2 = mysqli_query($conn, "SHOW TABLES LIKE 'web_bioskop penonton'");
    if (mysqli_num_rows($table_check2) > 0) {
        $table_name = "`web_bioskop penonton`";
    } else {
        // Cek semua tabel untuk debugging
        $all_tables = mysqli_query($conn, "SHOW TABLES");
        $tables_list = [];
        while ($row = mysqli_fetch_array($all_tables)) {
            $tables_list[] = $row[0];
        }
        echo json_encode([
            'success' => false,
            'message' => 'Tabel tidak ditemukan. Tabel yang ada: ' . implode(', ', $tables_list)
        ]);
        exit;
    }
} else {
    $table_name = "penonton";
}

// Cek email sudah terdaftar
$check_email = mysqli_query($conn, "SELECT ID_Penonton FROM $table_name WHERE Email = '$email'");
if (mysqli_num_rows($check_email) > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Email sudah terdaftar!'
    ]);
    exit;
}

// Cek no HP sudah terdaftar
$check_phone = mysqli_query($conn, "SELECT ID_Penonton FROM $table_name WHERE No_HP = '$no_hp'");
if (mysqli_num_rows($check_phone) > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Nomor HP sudah terdaftar!'
    ]);
    exit;
}

// Generate ID_Penonton
$result = mysqli_query($conn, "SELECT ID_Penonton FROM $table_name ORDER BY ID_Penonton DESC LIMIT 1");
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    $last_id = $row['ID_Penonton'];
    $number = (int)substr($last_id, 1) + 1;
    $new_id = 'P' . str_pad($number, 3, '0', STR_PAD_LEFT);
} else {
    $new_id = 'P001';
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert ke database
$query = "INSERT INTO $table_name (ID_Penonton, Nama_Lengkap, Email, No_HP, Password) 
          VALUES ('$new_id', '$nama_lengkap', '$email', '$no_hp', '$hashed_password')";

// Debug: Log query
error_log("Query: " . $query);

if (mysqli_query($conn, $query)) {
    echo json_encode([
        'success' => true,
        'message' => 'Pendaftaran berhasil!',
        'user' => [
            'ID_Penonton' => $new_id,
            'Nama_Lengkap' => $nama_lengkap,
            'Email' => $email,
            'No_HP' => $no_hp
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Pendaftaran gagal: ' . mysqli_error($conn)
    ]);
}

mysqli_close($conn);
?>