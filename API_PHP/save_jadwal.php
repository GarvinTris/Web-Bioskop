<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "web_bioskop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Database gagal konek"]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_jadwal = $_POST['ID_Jadwal'] ?? null;
    $id_film = $_POST['ID_Film'] ?? null;
    $tanggal = $_POST['Tanggal'] ?? null;
    $jam_mulai = $_POST['Jam_Mulai'] ?? null;
    $no_studio = $_POST['No_Studio'] ?? null;
    
    // Validasi (HAPUS validasi harga)
    if (!$id_film || !$tanggal || !$jam_mulai || !$no_studio) {
        echo json_encode(["error" => "Semua field harus diisi", "success" => false]);
        exit;
    }
    
    // Ambil harga dari tabel studio
    $harga_query = "SELECT Harga_Tiket FROM studio WHERE No_Studio = ?";
    $harga_stmt = $conn->prepare($harga_query);
    $harga_stmt->bind_param("i", $no_studio);
    $harga_stmt->execute();
    $harga_result = $harga_stmt->get_result();
    $harga_row = $harga_result->fetch_assoc();
    
    if (!$harga_row) {
        echo json_encode(["error" => "Studio tidak ditemukan", "success" => false]);
        exit;
    }
    
    $harga = (int)$harga_row['Harga_Tiket'];
    
    // Cek apakah ID_Jadwal sudah ada
    if ($id_jadwal) {
        // Update existing schedule
        $query = "UPDATE jadwal SET 
                  ID_Film = ?, 
                  Tanggal = ?, 
                  Jam_Mulai = ?, 
                  No_Studio = ? 
                  WHERE ID_Jadwal = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $id_film, $tanggal, $jam_mulai, $no_studio, $id_jadwal);
        
        if ($stmt->execute()) {
            // Update harga tiket
            $update_tiket = "UPDATE tiket SET Harga = ? WHERE ID_Jadwal = ?";
            $update_stmt = $conn->prepare($update_tiket);
            $update_stmt->bind_param("is", $harga, $id_jadwal);
            $update_stmt->execute();
            $update_stmt->close();
            
            echo json_encode(["success" => true, "message" => "Jadwal berhasil diupdate"]);
        } else {
            echo json_encode(["error" => "Gagal update jadwal: " . $stmt->error, "success" => false]);
        }
        $stmt->close();
    } else {
        // Insert new schedule
        // Generate ID_Jadwal otomatis
        $query_id = "SELECT MAX(CAST(SUBSTRING(ID_Jadwal, 5) AS UNSIGNED)) as max_id FROM jadwal";
        $result = $conn->query($query_id);
        $row = $result->fetch_assoc();
        $next_id = ($row['max_id'] ?? 0) + 1;
        $new_id = "JDWL" . str_pad($next_id, 3, "0", STR_PAD_LEFT);
        
        $query = "INSERT INTO jadwal (ID_Jadwal, ID_Film, Tanggal, Jam_Mulai, No_Studio) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $new_id, $id_film, $tanggal, $jam_mulai, $no_studio);
        
        if ($stmt->execute()) {
            // Insert tiket untuk setiap kursi
            $tiket_id = "TKT" . str_pad($next_id, 3, "0", STR_PAD_LEFT);
            
            $kursi_query = "SELECT ID_Kursi FROM kursi WHERE No_Studio = ?";
            $kursi_stmt = $conn->prepare($kursi_query);
            $kursi_stmt->bind_param("i", $no_studio);
            $kursi_stmt->execute();
            $kursi_result = $kursi_stmt->get_result();
            
            $tiket_insert = "INSERT INTO tiket (ID_Tiket, ID_Jadwal, Harga, Stok, ID_Kursi, Status) VALUES (?, ?, ?, ?, ?, 'tersedia')";
            $tiket_stmt = $conn->prepare($tiket_insert);
            
            $counter = 1;
            while ($kursi = $kursi_result->fetch_assoc()) {
                $tiket_id_full = $tiket_id . str_pad($counter, 2, "0", STR_PAD_LEFT);
                $stok = 1;
                
                $tiket_stmt->bind_param("ssiis", $tiket_id_full, $new_id, $harga, $stok, $kursi['ID_Kursi']);
                $tiket_stmt->execute();
                $counter++;
            }
            
            $tiket_stmt->close();
            $kursi_stmt->close();
            
            echo json_encode(["success" => true, "message" => "Jadwal berhasil ditambahkan", "id" => $new_id]);
        } else {
            echo json_encode(["error" => "Gagal tambah jadwal: " . $stmt->error, "success" => false]);
        }
        $stmt->close();
    }
}

$conn->close();
?>