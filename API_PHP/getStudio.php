<?php
// getStudio.php
require_once 'database.php';

$sql = "SELECT No_Studio, Nama_Studio, Harga_Tiket FROM studio ORDER BY No_Studio";
$result = $conn->query($sql);

$studio = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $studio[] = $row;
    }
}

echo json_encode($studio);
?>