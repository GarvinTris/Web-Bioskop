import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const jadwal = localStorage.getItem("selectedJadwal");
    const seats = localStorage.getItem("selectedSeats");
    
    if (jadwal && seats) {
      setSelectedJadwal(JSON.parse(jadwal));
      setSelectedSeats(JSON.parse(seats));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const ticketPrice = 50000;
  const totalPrice = selectedSeats.length * ticketPrice;
  const adminFee = 2000;
  const grandTotal = totalPrice + adminFee;

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const transactionId = "TRX" + Date.now();
      
      const transactionData = {
        id: transactionId,
        jadwal: selectedJadwal,
        seats: selectedSeats,
        total: grandTotal,
        paymentMethod,
        date: new Date().toISOString(),
        status: "success"
      };
      
      // 🔴 SIMPAN DI DUA TEMPAT
      localStorage.setItem("lastTransaction", JSON.stringify(transactionData));
      
      // 🔴 JUGA SIMPAN DENGAN KEY transaction_ UNTUK RIWAYAT
      const transactionKey = `transaction_${transactionId}`;
      localStorage.setItem(transactionKey, JSON.stringify(transactionData));
      
      setIsProcessing(false);
      navigate("/payment-success");
    }, 2000);
  };

  if (!selectedJadwal || selectedSeats.length === 0) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
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
            <span className="summary-value">{selectedJadwal.Judul_Film || "Film"}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>📅</i> Tanggal
            </span>
            <span className="summary-value">{selectedJadwal.Tanggal}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">
              <i>⏰</i> Jam
            </span>
            <span className="summary-value">{selectedJadwal.Jam_Mulai}</span>
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
            <span>Harga Tiket ({selectedSeats.length} x Rp {ticketPrice.toLocaleString()})</span>
            <span>Rp {totalPrice.toLocaleString()}</span>
          </div>
          <div className="price-item">
            <span>Biaya Admin</span>
            <span>Rp {adminFee.toLocaleString()}</span>
          </div>
          <div className="price-item total">
            <span>Total</span>
            <span className="amount">Rp {grandTotal.toLocaleString()}</span>
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