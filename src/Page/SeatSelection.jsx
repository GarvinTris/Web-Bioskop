import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/SeatSelection.css"

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [seatPrice, setSeatPrice] = useState(50000);
  const [studioName, setStudioName] = useState("");
  
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  const getSeatDisplayName = (baris, nomor) => {
    return `${baris}${nomor}`;
  };

  // Fetch booked seats from database
  const fetchBookedSeats = async (idJadwal) => {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/get_booked_seats.php?id_jadwal=${idJadwal}&t=${timestamp}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        const data = await response.json();
        console.log("Response get_booked_seats:", data);
        
        if (data.success) {
            const booked = Array.isArray(data.booked_seats) ? data.booked_seats : [];
            setBookedSeats(booked);
            console.log("Booked seats loaded:", booked);
        } else {
            console.error("API Error:", data.error);
            setBookedSeats([]);
        }
    } catch (error) {
        console.error("Error fetching booked seats:", error);
        setBookedSeats([]);
    }
  };

  const fetchStudioName = async (noStudio) => {
    try {
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/getStudio.php`);
      const data = await response.json();
      const studio = data.find(s => s.No_Studio == noStudio);
      if (studio) {
        setStudioName(studio.Nama_Studio);
      } else {
        setStudioName(`Studio ${noStudio}`);
      }
    } catch (error) {
      console.error("Error fetching studio name:", error);
      setStudioName(`Studio ${noStudio}`);
    }
  };

  // Load semua data saat pertama kali halaman dimuat
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      let jadwalData = null;
      
      if (location.state && location.state.selectedJadwal) {
        jadwalData = location.state.selectedJadwal;
      } else {
        const storedData = localStorage.getItem("selectedJadwal");
        if (storedData) {
          jadwalData = JSON.parse(storedData);
        }
      }
      
      if (!jadwalData) {
        showAlertMessage("Data jadwal tidak ditemukan");
        setTimeout(() => navigate(-1), 2000);
        setLoading(false);
        return;
      }
      
      if (!jadwalData.Judul_Film && !jadwalData.judul_film) {
        jadwalData.Judul_Film = "Film Tidak Diketahui";
      }
      
      let harga = jadwalData.Harga;
      if (typeof harga === 'string') {
        harga = parseInt(harga);
      }
      
      if (harga && !isNaN(harga) && harga > 0) {
        setSeatPrice(harga);
      } else {
        setSeatPrice(50000);
      }
      
      setSelectedJadwal(jadwalData);
      
      if (jadwalData.No_Studio) {
        await fetchStudioName(jadwalData.No_Studio);
      }
      
      if (jadwalData.ID_Jadwal) {
        await fetchBookedSeats(jadwalData.ID_Jadwal);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [navigate, location]);

  // Auto refresh booked seats setiap 10 detik (tapi hanya jika halaman aktif)
  useEffect(() => {
    let intervalId;
    
    if (selectedJadwal?.ID_Jadwal && !loading) {
      intervalId = setInterval(() => {
        console.log("Auto refreshing booked seats...");
        fetchBookedSeats(selectedJadwal.ID_Jadwal);
      }, 10000); // Refresh setiap 10 detik
    }
    
    // Cleanup interval saat komponen unmount atau selectedJadwal berubah
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedJadwal, loading]); // Hanya bergantung pada selectedJadwal dan loading

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const toggleSeat = (seatId) => {
    // Cek apakah kursi sudah dipesan
    if (bookedSeats.includes(seatId)) {
        showAlertMessage(`Kursi ${seatId} sudah dipesan!`);
        return;
    }
    
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

    const paymentData = {
      selectedSeats: selectedSeats,
      jadwal: {
        ...selectedJadwal,
        Nama_Studio: studioName
      },
      totalPrice: totalPrice,
      seatPrice: seatPrice,
      id_jadwal: selectedJadwal.ID_Jadwal
    };
    
    localStorage.setItem("paymentData", JSON.stringify(paymentData));
    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    navigate("/payment");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const formattedHours = hours.padStart(2, '0');
      return `${formattedHours}:${minutes}`;
    }
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalPrice = selectedSeats.length * seatPrice;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat data kursi...</p>
      </div>
    );
  }

  if (!selectedJadwal) {
    return (
      <div className="loading-container">
        <p>Data jadwal tidak ditemukan</p>
        <button onClick={() => navigate(-1)}>Kembali</button>
      </div>
    );
  }

  return (
    <div className="seat-selection-container">
      {showAlert && <div className="alert-message">{alertMessage}</div>}
      
      <div className="selection-header">
        <h2>Pilih Kursi</h2>
      </div>
      
      <div className="movie-info-card">
        <h3>{selectedJadwal.Judul_Film || selectedJadwal.judul_film || "Film"}</h3>
        <div className="movie-info-details">
          <p><strong>📅 Tanggal:</strong> {formatDate(selectedJadwal.Tanggal)}</p>
          <p><strong>⏰ Jam:</strong> {formatTime(selectedJadwal.Jam_Mulai)} WIB</p>
          <p><strong>🎪 Studio:</strong> {studioName || `Studio ${selectedJadwal.No_Studio}`}</p>
          <p><strong>💰 Harga Tiket:</strong> Rp {seatPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="screen-container">
        <div className="screen">LAYAR</div>
      </div>

      <div className="seats-container">
        {rows.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {[...Array(seatsPerRow)].map((_, i) => {
              const seatNumber = i + 1;
              const seatDisplayId = `${row}${seatNumber}`;
              const isBooked = bookedSeats.includes(seatDisplayId);
              const isSelected = selectedSeats.includes(seatDisplayId);
              
              let seatClass = "seat-button";
              if (isBooked) seatClass += " booked";
              if (isSelected) seatClass += " selected";
              
              return (
                <button
                  key={seatDisplayId}
                  onClick={() => toggleSeat(seatDisplayId)}
                  disabled={isBooked}
                  className={seatClass}
                  title={isBooked ? "Kursi sudah dipesan" : "Klik untuk memilih kursi"}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

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

      <div className="summary-card">
        <div className="summary-content">
          <div className="summary-info">
            <p><strong>💺 Kursi dipilih:</strong> {selectedSeats.join(", ") || "Belum ada"}</p>
            <p><strong>🎟️ Jumlah kursi:</strong> {selectedSeats.length} kursi</p>
            <p><strong>💰 Harga per kursi:</strong> Rp {seatPrice.toLocaleString()}</p>
            <p><strong>💵 Total:</strong> <span className="total-price">Rp {totalPrice.toLocaleString()}</span></p>
          </div>
          <button
            onClick={handleContinue}
            className="continue-button"
            disabled={selectedSeats.length === 0}
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;