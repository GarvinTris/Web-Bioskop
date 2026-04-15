<?php
// admin_auth.php - Middleware untuk admin
require_once 'database.php';

function requireAdmin() {
    requireLogin();
    
    if (!isAdmin()) {
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', "User {$_SESSION['user_id']} tried to access admin area");
        sendResponse(false, [], 'Anda tidak memiliki akses sebagai admin', 403);
    }
}
?>