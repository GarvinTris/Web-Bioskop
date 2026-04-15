<?php
// notifikasi.php - Sistem notifikasi internal
require_once 'database.php';

// Buat tabel notifikasi jika belum ada
$createTable = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20),
    title VARCHAR(100),
    message TEXT,
    type ENUM('success', 'info', 'warning', 'error') DEFAULT 'info',
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
)";
$conn->query($createTable);

function sendNotification($user_id, $title, $message, $type = 'info') {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user_id, $title, $message, $type);
    return $stmt->execute();
}

function getUserNotifications($user_id, $limit = 20) {
    global $conn;
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
    $stmt->bind_param("si", $user_id, $limit);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function markAsRead($notification_id, $user_id) {
    global $conn;
    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("is", $notification_id, $user_id);
    return $stmt->execute();
}

// API endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireLogin();
    $user_id = $_SESSION['user_id'];
    $notifications = getUserNotifications($user_id);
    echo json_encode(['success' => true, 'notifications' => $notifications]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireLogin();
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['mark_read'])) {
        markAsRead($data['notification_id'], $_SESSION['user_id']);
        echo json_encode(['success' => true]);
    }
}
?>