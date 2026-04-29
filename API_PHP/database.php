<?php
// database.php - Core keamanan lengkap

// ==================== KONFIGURASI SESSION ====================
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.gc_maxlifetime', 1800);
ini_set('session.cookie_lifetime', 1800);
ini_set('session.cookie_samesite', 'Strict');

// Matikan error display (ubah ke 1 untuk debug)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// ==================== START SESSION ====================
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ==================== HEADER KEAMANAN ====================
$allowed_origin = "http://localhost:5173";
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

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

if (!$conn) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

mysqli_set_charset($conn, "utf8mb4");

// ==================== FUNGSI KEAMANAN ====================

function isAdmin() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';
}

function isLoggedIn() {
    if (!checkSessionTimeout()) {
        return false;
    }
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function checkSessionTimeout() {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        session_unset();
        session_destroy();
        return false;
    }
    $_SESSION['last_activity'] = time();
    return true;
}

function checkRateLimit($key, $limit = 100, $window = 60) {
    $cacheFile = __DIR__ . '/rate_cache.json';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $requestKey = md5($ip . '_' . $key);
    
    $cache = [];
    if (file_exists($cacheFile)) {
        $cache = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    $now = time();
    foreach ($cache as $k => $data) {
        if ($data['timestamp'] < $now - $window) {
            unset($cache[$k]);
        }
    }
    
    if (!isset($cache[$requestKey])) {
        $cache[$requestKey] = ['count' => 1, 'timestamp' => $now];
    } else {
        $cache[$requestKey]['count']++;
    }
    
    file_put_contents($cacheFile, json_encode($cache));
    
    if ($cache[$requestKey]['count'] > $limit) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many requests. Silakan coba lagi nanti.']);
        exit;
    }
    return true;
}

function checkLoginAttempts($identifier) {
    $cacheFile = __DIR__ . '/login_attempts.json';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = md5($ip . '_' . $identifier);
    
    $attempts = [];
    if (file_exists($cacheFile)) {
        $attempts = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    $now = time();
    if (isset($attempts[$key])) {
        if ($attempts[$key]['timestamp'] < $now - 900) {
            unset($attempts[$key]);
        } elseif ($attempts[$key]['count'] >= 5) {
            return false;
        }
    }
    return true;
}

function recordLoginAttempt($identifier, $success = false) {
    $cacheFile = __DIR__ . '/login_attempts.json';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = md5($ip . '_' . $identifier);
    
    $attempts = [];
    if (file_exists($cacheFile)) {
        $attempts = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    $now = time();
    if ($success) {
        unset($attempts[$key]);
    } else {
        if (!isset($attempts[$key])) {
            $attempts[$key] = ['count' => 1, 'timestamp' => $now];
        } else {
            $attempts[$key]['count']++;
        }
    }
    file_put_contents($cacheFile, json_encode($attempts));
}

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

function requireLogin() {
    if (!isLoggedIn()) {
        sendResponse(false, [], 'Silakan login terlebih dahulu', 401);
    }
}

function requireAdmin() {
    requireLogin();
    
    if (!isAdmin()) {
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', "User {$_SESSION['user_id']} tried to access admin area");
        sendResponse(false, [], 'Anda tidak memiliki akses sebagai admin', 403);
    }
}

function requireAdminMfa() {
    requireLogin();
    
    if (!isAdmin()) {
        sendResponse(false, [], 'Anda tidak memiliki akses sebagai admin', 403);
    }
    
    if (!isset($_SESSION['mfa_verified']) || $_SESSION['mfa_verified'] !== true) {
        logSecurityEvent('MFA_REQUIRED', "Admin {$_SESSION['user_id']} attempted access without MFA");
        sendResponse(false, [], 'Verifikasi MFA diperlukan untuk akses ini', 403);
    }
}

function logSecurityEvent($event, $details = '') {
    $logFile = __DIR__ . '/security.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $logEntry = "[$timestamp] [$event] IP: $ip - $details" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}
?>