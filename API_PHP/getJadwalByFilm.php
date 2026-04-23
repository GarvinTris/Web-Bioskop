<?php
// getJadwalByFilm.php
require_once 'database.php';
requireAdminMfa();
if (isset($_GET['ID_Film'])) {
    $ID_Film = $_GET['ID_Film'];
    
    $sql = "SELECT j.*, s.Nama_Studio 
            FROM jadwal j
            LEFT JOIN studio s ON j.No_Studio = s.No_Studio
            WHERE j.ID_Film = ?
            ORDER BY j.Tanggal, j.Jam_Mulai";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $ID_Film);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $jadwal = [];
    while ($row = $result->fetch_assoc()) {
        $jadwal[] = $row;
    }
    
    echo json_encode($jadwal);
    $stmt->close();
} else {
    echo json_encode(["error" => "ID_Film tidak ditemukan"]);
}
?>