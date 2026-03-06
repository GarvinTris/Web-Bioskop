import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/SeatSelection.css"

function SeatSelection() {
  const navigate = useNavigate();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  // Data kursi contoh (biasanya dari database)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  useEffect(() => {
    const jadwalData = localStorage.getItem("selectedJadwal");
    if (jadwalData) {
      setSelectedJadwal(JSON.parse(jadwalData));
    } else {
      navigate(-1);
    }
  }, [navigate]);

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length < 5) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        showAlertMessage("Maksimal 5 kursi per transaksi");
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      showAlertMessage("Pilih kursi terlebih dahulu");
      return;
    }

    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    navigate("/payment");
  };

  const getSeatPrice = () => {
    return 50000;
  };

  const totalPrice = selectedSeats.length * getSeatPrice();

  if (!selectedJadwal) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="seat-selection-container">
      {showAlert && <div className="alert-message">{alertMessage}</div>}
      
      <div className="selection-header">
        <h2>Pilih Kursi</h2>
      </div>
      
      {/* Info Film dan Jadwal */}
      <div className="movie-info-card">
        <h3>{selectedJadwal.Judul_Film || "Film"}</h3>
        <div className="movie-info-details">
          <p><strong>Tanggal:</strong> {selectedJadwal.Tanggal}</p>
          <p><strong>Jam:</strong> {selectedJadwal.Jam_Mulai}</p>
          <p><strong>Studio:</strong> {selectedJadwal.No_Studio || "Studio 1"}</p>
        </div>
      </div>

      {/* Screen */}
      <div className="screen-container">
        <div className="screen">LAYAR</div>
      </div>

      {/* Kursi */}
      <div className="seats-container">
        {rows.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {[...Array(seatsPerRow)].map((_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row}${seatNumber}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              
              let seatClass = "seat-button";
              if (isBooked) seatClass += " booked";
              if (isSelected) seatClass += " selected";
              
              return (
                <button
                  key={seatId}
                  onClick={() => !isBooked && toggleSeat(seatId)}
                  disabled={isBooked}
                  className={seatClass}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend-container">
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Tersedia</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Dipilih</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Terpesan</span>
        </div>
      </div>

      {/* Ringkasan & Tombol */}
      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-info">
            <p>
              <strong>Kursi dipilih:</strong> {selectedSeats.join(", ") || "Belum ada"}
            </p>
            <p>
              <strong>Total:</strong> <span className="total-price">Rp {totalPrice.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="continue-button"
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;