import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  }, []);

  const ticketPrice = 50000; // Harga per tiket
  const totalPrice = selectedSeats.length * ticketPrice;
  const adminFee = 2000;
  const grandTotal = totalPrice + adminFee;

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran");
      return;
    }

    setIsProcessing(true);

    // Simulasi proses payment
    setTimeout(() => {
      // Generate ID Transaksi
      const transactionId = "TRX" + Date.now();
      
      // Simpan data transaksi
      const transactionData = {
        id: transactionId,
        jadwal: selectedJadwal,
        seats: selectedSeats,
        total: grandTotal,
        paymentMethod,
        date: new Date().toISOString(),
        status: "success"
      };
      
      localStorage.setItem("lastTransaction", JSON.stringify(transactionData));
      
      setIsProcessing(false);
      navigate("/payment-success");
    }, 2000);
  };

  if (!selectedJadwal || selectedSeats.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="payment-container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Pembayaran</h2>
      
      {/* Ringkasan Pesanan */}
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px", marginBottom: "20px" }}>
        <h3>Ringkasan Pesanan</h3>
        <p><strong>Film:</strong> {selectedJadwal.Judul_Film || "Film"}</p>
        <p><strong>Tanggal:</strong> {selectedJadwal.Tanggal}</p>
        <p><strong>Jam:</strong> {selectedJadwal.Jam_Mulai}</p>
        <p><strong>Kursi:</strong> {selectedSeats.join(", ")}</p>
        <p><strong>Jumlah Tiket:</strong> {selectedSeats.length}</p>
        
        <hr />
        
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Harga Tiket ({selectedSeats.length} x Rp {ticketPrice.toLocaleString()})</span>
          <span>Rp {totalPrice.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Biaya Admin</span>
          <span>Rp {adminFee.toLocaleString()}</span>
        </div>
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px" }}>
          <span>Total</span>
          <span>Rp {grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Metode Pembayaran */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Metode Pembayaran</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {["Transfer Bank", "OVO", "GoPay", "DANA", "Credit Card"].map(method => (
            <label key={method} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      {/* Tombol Bayar */}
      <button
        onClick={handlePayment}
        disabled={isProcessing || !paymentMethod}
        style={{
          width: "100%",
          padding: "15px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.7 : 1
        }}
      >
        {isProcessing ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}

export default Payment;