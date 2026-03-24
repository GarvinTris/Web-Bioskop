<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

if (isset($_GET['judul'])) {
    $judul = $_GET['judul'];

    // Ambil data film dengan JOIN kategori
    $sqlFilm = "SELECT f.*, k.Nama_Kategori 
                FROM film f
                LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
                WHERE f.Judul_Film = ?";
    
    $stmt = $conn->prepare($sqlFilm);
    $stmt->bind_param("s", $judul);
    $stmt->execute();
    $resultFilm = $stmt->get_result();

    $data = [];
    if ($film = $resultFilm->fetch_assoc()) {

        // Ambil jadwal film ini berdasarkan ID_Film
        $sqlJadwal = "SELECT j.*, s.Nama_Studio 
                      FROM jadwal j
                      LEFT JOIN studio s ON j.No_Studio = s.No_Studio
                      WHERE j.ID_Film = ?
                      ORDER BY j.Tanggal, j.Jam_Mulai";
        
        $stmtJadwal = $conn->prepare($sqlJadwal);
        $stmtJadwal->bind_param("i", $film['ID_Film']);
        $stmtJadwal->execute();
        $resultJadwal = $stmtJadwal->get_result();

        $jadwal = [];
        while ($row = $resultJadwal->fetch_assoc()) {
            $jadwal[] = $row;
        }

        $film['jadwal'] = $jadwal;
        $data[] = $film;
        
        $stmtJadwal->close();
    }

    echo json_encode($data);
    $stmt->close();

} else {
    // Ambil semua film
    $sql = "SELECT f.*, k.Nama_Kategori 
            FROM film f
            LEFT JOIN kategori k ON f.ID_Kategori = k.ID_Kategori
            ORDER BY f.ID_Film DESC";
    
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

$conn->close();
?>