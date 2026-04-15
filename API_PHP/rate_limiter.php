<?php
// rate_limiter.php - Membatasi request per IP (mencegah DDoS)
function checkRateLimit($key, $limit = 100, $window = 60) {
    // $limit = maksimal request per $window detik
    // Default: 100 request per 60 detik
    
    $logFile = __DIR__ . '/rate_limit.log';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $requestKey = $ip . '_' . $key;
    
    // Simpan di memory cache atau file sederhana
    $cacheFile = __DIR__ . '/rate_cache.json';
    $cache = [];
    
    if (file_exists($cacheFile)) {
        $cache = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    $now = time();
    
    // Clean old entries
    foreach ($cache as $k => $data) {
        if ($data['timestamp'] < $now - $window) {
            unset($cache[$k]);
        }
    }
    
    if (!isset($cache[$requestKey])) {
        $cache[$requestKey] = [
            'count' => 1,
            'timestamp' => $now
        ];
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

// Untuk GET request yang cepat
function checkApiRateLimit() {
    $endpoint = $_SERVER['REQUEST_URI'] ?? 'unknown';
    checkRateLimit($endpoint, 200, 60); // 200 request per menit
}

// Untuk POST request (lebih strict)
function checkPostRateLimit() {
    $endpoint = $_SERVER['REQUEST_URI'] ?? 'unknown';
    checkRateLimit($endpoint, 50, 60); // 50 request per menit
}
?>