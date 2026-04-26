<?php
// getUsers.php
require_once 'database.php';
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

if (!empty($search)) {
    $searchParam = "%{$search}%";
    $sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
            FROM penonton 
            WHERE Nama_Lengkap LIKE ? 
               OR Email LIKE ? 
               OR No_HP LIKE ?
            ORDER BY Tanggal_Daftar DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $sql = "SELECT ID_Penonton, Nama_Lengkap, Email, No_HP, Tanggal_Daftar 
            FROM penonton 
            ORDER BY Tanggal_Daftar DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
}

if (!$result) {
    echo json_encode([
        "success" => false, 
        "error" => "Query error: " . $conn->error
    ]);
    if (isset($stmt)) $stmt->close();
    exit;
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

if (isset($stmt)) $stmt->close();

echo json_encode([
    "success" => true, 
    "users" => $users,
    "total" => count($users)
]);
?>