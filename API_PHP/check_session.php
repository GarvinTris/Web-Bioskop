<?php
// check_session.php - Validasi session
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'database.php';

// Pastikan session sudah dimulai
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Fungsi sendResponse jika belum ada di database.php
if (!function_exists('sendResponse')) {
    function sendResponse($success, $data = [], $message = '', $statusCode = 200) {
        http_response_code($statusCode);
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
}

// Fungsi isLoggedIn jika belum ada
if (!function_exists('isLoggedIn')) {
    function isLoggedIn() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
}

// Fungsi isAdmin jika belum ada
if (!function_exists('isAdmin')) {
    function isAdmin() {
        return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';
    }
}

// Fungsi checkSessionTimeout jika belum ada
if (!function_exists('checkSessionTimeout')) {
    function checkSessionTimeout() {
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
            session_unset();
            session_destroy();
            return false;
        }
        $_SESSION['last_activity'] = time();
        return true;
    }
}

if (!checkSessionTimeout()) {
    sendResponse(false, ['expired' => true], 'Session expired, silakan login kembali', 401);
    exit();
}

if (isLoggedIn()) {
    if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
        session_unset();
        session_destroy();
        sendResponse(false, [], 'Session tidak valid. IP address berubah.', 401);
        exit();
    }
    
    if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
        session_unset();
        session_destroy();
        sendResponse(false, [], 'Session tidak valid. Browser berubah.', 401);
        exit();
    }
    
    sendResponse(true, [
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'is_admin' => isAdmin()
        ]
    ], 'Session aktif');
} else {
    sendResponse(false, [], 'Belum login', 401);
}
?>