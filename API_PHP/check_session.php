<?php
// check_session.php - Validasi session
require_once 'database.php';

if (!checkSessionTimeout()) {
    exit();
}

if (isLoggedIn()) {
    if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
        session_unset();
        session_destroy();
        sendResponse(false, [], 'Session tidak valid. IP address berubah.', 401);
    }
    
    if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
        session_unset();
        session_destroy();
        sendResponse(false, [], 'Session tidak valid. Browser berubah.', 401);
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