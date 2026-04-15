import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0); // State untuk harga tiket

  useEffect(() => {
    // Ambil data dari localStorage
    const jadwal = localStorage.getItem("selectedJadwal");
    const seats = localStorage.getItem("selectedSeats");
    const paymentData = localStorage.getItem("paymentData");
    
    if (jadwal && seats) {
      const parsedJadwal = JSON.parse(jadwal);
      const parsedSeats = JSON.parse(seats);
      
      setSelectedJadwal(parsedJadwal);
      setSelectedSeats(parsedSeats);
      
      // Ambil harga dari paymentData terlebih dahulu
      if (paymentData) {
        const parsedPaymentData = JSON.parse(paymentData);
        if (parsedPaymentData.seatPrice) {
          setTicketPrice(parsedPaymentData.seatPrice);
          console.log("Harga dari paymentData:", parsedPaymentData.seatPrice);
        } else if (parsedJadwal.Harga) {
          setTicketPrice(parsedJadwal.Harga);
          console.log("Harga dari jadwal:", parsedJadwal.Harga);
        } else {
          setTicketPrice(50000);
          console.log("Harga default: 50000");
        }
      } else if (parsedJadwal.Harga) {
        setTicketPrice(parsedJadwal.Harga);
        console.log("Harga dari jadwal:", parsedJadwal.Harga);
      } else {
        setTicketPrice(50000);
        console.log("Harga default: 50000");
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


  // Payment.jsx - update handlePayment function
// Payment.jsx - bagian handlePayment
// Payment.jsx - update handlePayment function
// Payment.jsx - bagian handlePayment
// Payment.jsx - Update handlePayment function
const handlePayment = () => {
  if (!paymentMethod) {
      alert("Pilih metode pembayaran");
      return;
  }

  setIsProcessing(true);

  const processPayment = async () => {
      const transactionId = "TRX" + Date.now();
      const userId = localStorage.getItem("userId");
      
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
      
      console.log("Sending to URL:", apiUrl);
      console.log("Data being sent:", requestData);
      
      try {
          const response = await fetch(apiUrl, {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData)
          });
          
          console.log("Response status:", response.status);
          
          // 🔴 BACA RESPONSE SEBAGAI TEXT DULU
          const textResponse = await response.text();
          console.log("Raw response:", textResponse);
          
          // 🔴 COBA PARSE JSON
          let result;
          try {
              result = JSON.parse(textResponse);
          } catch (e) {
              console.error("Response is not valid JSON:", textResponse);
              throw new Error("Server error: " + textResponse.substring(0, 200));
          }
          
          if (result.success) {
              // Simpan ke localStorage untuk backup
              const transactionData = {
                  id: transactionId,
                  userId: userId,
                  jadwal: selectedJadwal,
                  seats: selectedSeats,
                  total: grandTotal,
                  paymentMethod: paymentMethod,
                  date: new Date().toISOString()
              };
              
              localStorage.setItem(`transaction_${userId}_${transactionId}`, JSON.stringify(transactionData));
              localStorage.setItem("lastTransaction", JSON.stringify(transactionData));
              
              const existingTransactions = JSON.parse(localStorage.getItem(`user_transactions_${userId}`) || "[]");
              existingTransactions.push(transactionId);
              localStorage.setItem(`user_transactions_${userId}`, JSON.stringify(existingTransactions));
              
              localStorage.removeItem("paymentData");
              
              setIsProcessing(false);
              navigate("/payment-success");
          } else {
              alert("Gagal menyimpan transaksi: " + (result.message || result.error));
              setIsProcessing(false);
          }
      } catch (error) {
          console.error("Error saving transaction:", error);
          alert("Terjadi kesalahan saat menyimpan transaksi: " + error.message);
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
      
      {/* Ringkasan Pesanan */}
      <div className="order-summary">
        <h3>Ringkasan Pesanan</h3>
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label">
              <i>🎬</i> Film
            </span>
            <span className="summary-value">{selectedJadwal.Judul_Film || selectedJadwal.judul_film || "Film"}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>📅</i> Tanggal
            </span>
            <span className="summary-value">{formatDate(selectedJadwal.Tanggal)}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>⏰</i> Jam
            </span>
            <span className="summary-value">{selectedJadwal.Jam_Mulai} WIB</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>🎪</i> Studio
            </span>
            <span className="summary-value">{selectedJadwal.Nama_Studio || `Studio ${selectedJadwal.No_Studio}`}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>💺</i> Kursi
            </span>
            <span className="summary-value">
              {selectedSeats.map(seat => (
                <span key={seat} className="seat-badge">{seat}</span>
              ))}
            </span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>🎟️</i> Jumlah Tiket
            </span>
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

      {/* Metode Pembayaran */}
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

      {/* Tombol Bayar */}
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