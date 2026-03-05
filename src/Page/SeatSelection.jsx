import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SeatSelection() {
  const navigate = useNavigate();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  
  // Data kursi contoh (biasanya dari database)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  useEffect(() => {
    // Ambil data jadwal yang dipilih dari localStorage
    const jadwalData = localStorage.getItem("selectedJadwal");
    if (jadwalData) {
      setSelectedJadwal(JSON.parse(jadwalData));
    } else {
      // Kalau tidak ada, kembali ke halaman sebelumnya
      navigate(-1);
    }

    // Ambil data kursi yang sudah dipesan (dari API nanti)
    // fetchBookedSeats();
  }, []);

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length < 5) { // Maksimal 5 kursi
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert("Maksimal 5 kursi per transaksi");
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Pilih kursi terlebih dahulu");
      return;
    }

    // Simpan kursi yang dipilih
    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    
    // Lanjut ke halaman payment
    navigate("/payment");
  };

  const getSeatPrice = () => {
    // Harga bisa beda per studio/jadwal
    return 50000; // Contoh harga Rp 50.000
  };

  const totalPrice = selectedSeats.length * getSeatPrice();

  if (!selectedJadwal) return <div>Loading...</div>;

  return (
    <div className="seat-selection-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Pilih Kursi</h2>
      
      {/* Info Film dan Jadwal */}
      <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
        <h3>{selectedJadwal.Judul_Film || "Film"}</h3>
        <p>Tanggal: {selectedJadwal.Tanggal} | Jam: {selectedJadwal.Jam_Mulai}</p>
        <p>Studio: {selectedJadwal.No_Studio || "Studio 1"}</p>
      </div>

      {/* Screen */}
      <div style={{ 
        backgroundColor: "#333", 
        color: "white", 
        textAlign: "center", 
        padding: "10px",
        marginBottom: "30px",
        borderRadius: "5px"
      }}>
        LAYAR
      </div>

      {/* Kursi */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
        {rows.map(row => (
          <div key={row} style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <span style={{ width: "30px", fontWeight: "bold" }}>{row}</span>
            {[...Array(seatsPerRow)].map((_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row}${seatNumber}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              
              return (
                <button
                  key={seatId}
                  onClick={() => !isBooked && toggleSeat(seatId)}
                  disabled={isBooked}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: isBooked ? "#ccc" : isSelected ? "#4CAF50" : "#fff",
                    border: `2px solid ${isBooked ? "#999" : "#ddd"}`,
                    borderRadius: "5px",
                    cursor: isBooked ? "not-allowed" : "pointer",
                    color: isBooked ? "#666" : "#000"
                  }}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#fff", border: "2px solid #ddd" }}></div>
          <span>Tersedia</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#4CAF50", border: "2px solid #4CAF50" }}></div>
          <span>Dipilih</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#ccc", border: "2px solid #999" }}></div>
          <span>Terpesan</span>
        </div>
      </div>

      {/* Ringkasan & Tombol */}
      <div style={{ 
        position: "sticky", 
        bottom: "20px", 
        backgroundColor: "white", 
        padding: "20px",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        borderRadius: "5px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p><strong>Kursi dipilih:</strong> {selectedSeats.join(", ") || "Belum ada"}</p>
            <p><strong>Total:</strong> Rp {totalPrice.toLocaleString()}</p>
          </div>
          <button
            onClick={handleContinue}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 30px",
              fontSize: "16px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;