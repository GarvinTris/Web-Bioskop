<?php
// database.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Koneksi database
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'web_bioskop';

$conn = mysqli_connect($host, $user, $password, $database);

// Set charset
if ($conn) {
    mysqli_set_charset($conn, "utf8");
}

// FUNGSI RESPONSE - WAJIB ADA!
function sendResponse($success, $data = [], $message = '') {
    header('Content-Type: application/json');
    $response = ['success' => $success];
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    if (!empty($message)) {
        $response['message'] = $message;
    }
    echo json_encode($response);
    exit();
}

// Catatan: Jangan tutup koneksi di sini
?>