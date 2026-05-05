import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0);

  useEffect(() => {
    const jadwal = localStorage.getItem("selectedJadwal");
    const seats = localStorage.getItem("selectedSeats");
    const paymentData = localStorage.getItem("paymentData");
    
    if (jadwal && seats) {
      const parsedJadwal = JSON.parse(jadwal);
      const parsedSeats = JSON.parse(seats);
      
      setSelectedJadwal(parsedJadwal);
      setSelectedSeats(parsedSeats);
      
      if (paymentData) {
        const parsedPaymentData = JSON.parse(paymentData);
        if (parsedPaymentData.seatPrice) {
          setTicketPrice(parsedPaymentData.seatPrice);
        } else if (parsedJadwal.Harga) {
          setTicketPrice(parsedJadwal.Harga);
        } else {
          setTicketPrice(50000);
        }
      } else if (parsedJadwal.Harga) {
        setTicketPrice(parsedJadwal.Harga);
      } else {
        setTicketPrice(50000);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const totalPrice = selectedSeats.length * ticketPrice;
  const adminFee = 2000;
  const grandTotal = totalPrice + adminFee;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
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

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran");
      return;
    }

    setIsProcessing(true);

    const processPayment = async () => {
      const transactionId = "TRX" + Date.now();
      
      const userData = localStorage.getItem("user");
      let userId = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.ID_Penonton;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      if (!userId) {
        const userIdFromStorage = localStorage.getItem("userId");
        if (userIdFromStorage) {
          userId = userIdFromStorage;
        }
      }
      
      if (!userId) {
        alert("Silakan login terlebih dahulu");
        setIsProcessing(false);
        navigate("/login");
        return;
      }
      
      const apiUrl = "http://localhost/Web_Bioskop/API_PHP/saveTransaction.php";
      
      const requestData = {
        id_transaksi: transactionId,
        id_penonton: userId,
        id_jadwal: selectedJadwal.ID_Jadwal,
        kursi: selectedSeats.join(","),
        total_harga: grandTotal,
        metode_pembayaran: paymentMethod,
        tanggal: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      console.log("Sending data:", requestData);
      
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        console.log("SaveTransaction response:", result);
        
        if (result.success) {
          // 🔴 SIMPAN DATA TRANSAKSI KE LOCALSTORAGE
          const transactionData = {
            id: transactionId,
            jadwal: selectedJadwal,
            seats: selectedSeats,
            total: grandTotal,
            paymentMethod: paymentMethod,
            date: new Date().toISOString()
          };
          
          localStorage.setItem("lastTransaction", JSON.stringify(transactionData));
          localStorage.removeItem("paymentData");
          localStorage.removeItem("selectedSeats");
          
          // 🔴 LANGSUNG KE PAYMENT SUCCESS
          navigate("/payment-success");
        } else {
          alert("Gagal: " + (result.error || result.message));
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan: " + error.message);
        setIsProcessing(false);
      }
    };
    
    processPayment();
  };

  if (!selectedJadwal || selectedSeats.length === 0) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Memuat data pembayaran...</p>
      </div>
    );
  }

  const paymentMethods = [
    { id: "bank", name: "Transfer Bank", icon: "🏦", desc: "BCA, Mandiri, BNI, BRI" },
    { id: "ovo", name: "OVO", icon: "🟣", desc: "Cashback 5%" },
    { id: "gopay", name: "GoPay", icon: "🔵", desc: "PayLater tersedia" },
    { id: "dana", name: "DANA", icon: "🟢", desc: "Promo khusus" },
    { id: "credit", name: "Credit Card", icon: "💳", desc: "Visa/Mastercard/JCB" }
  ];

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Pembayaran</h2>
      </div>
      
      <div className="order-summary">
        <h3>Ringkasan Pesanan</h3>
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label"><i>🎬</i> Film</span>
            <span className="summary-value">{selectedJadwal.Judul_Film || selectedJadwal.judul_film || "Film"}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label"><i>📅</i> Tanggal</span>
            <span className="summary-value">{formatDate(selectedJadwal.Tanggal)}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label"><i>⏰</i> Jam</span>
            <span className="summary-value">{selectedJadwal.Jam_Mulai} WIB</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label"><i>🎪</i> Studio</span>
            <span className="summary-value">{selectedJadwal.Nama_Studio || `Studio ${selectedJadwal.No_Studio}`}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label"><i>💺</i> Kursi</span>
            <span className="summary-value">
              {selectedSeats.map(seat => (
                <span key={seat} className="seat-badge">{seat}</span>
              ))}
            </span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label"><i>🎟️</i> Jumlah Tiket</span>
            <span className="summary-value">{selectedSeats.length} tiket</span>
          </div>
        </div>
        
        <div className="summary-divider"></div>
        
        <div className="price-breakdown">
          <div className="price-item">
            <span>Harga Tiket ({selectedSeats.length} x Rp {formatRupiah(ticketPrice)})</span>
            <span>Rp {formatRupiah(totalPrice)}</span>
          </div>
          <div className="price-item">
            <span>Biaya Admin</span>
            <span>Rp {formatRupiah(adminFee)}</span>
          </div>
          <div className="price-item total">
            <span>Total</span>
            <span className="amount">Rp {formatRupiah(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="payment-methods">
        <h3>Metode Pembayaran</h3>
        <div className="methods-grid">
          {paymentMethods.map(method => (
            <label key={method.id} className="method-card">
              <input
                type="radio"
                name="payment"
                value={method.name}
                checked={paymentMethod === method.name}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-label">
                <span className={`method-icon ${method.id}`}>{method.icon}</span>
                <div className="method-info">
                  <div className="method-name">{method.name}</div>
                  <div className="method-desc">{method.desc}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing || !paymentMethod}
        className="payment-button"
      >
        {isProcessing ? "Memproses Pembayaran..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}

export default Payment;