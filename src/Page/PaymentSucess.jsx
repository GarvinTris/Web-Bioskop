import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const lastTrx = localStorage.getItem("lastTransaction");
    if (lastTrx) {
      setTransaction(JSON.parse(lastTrx));
    }

    // 🔴 AUTO REDIRECT setelah 5 detik
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/riwayat-tiket");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="success-container" style={{ 
      maxWidth: "600px", 
      margin: "50px auto", 
      textAlign: "center", 
      padding: "40px", 
      backgroundColor: "#f8f9fa", 
      borderRadius: "20px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
    }}>
      <div style={{ fontSize: "80px", color: "#28a745", marginBottom: "20px" }}>✅</div>
      <h2 style={{ color: "#333", marginBottom: "10px" }}>Pembayaran Berhasil!</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Terima kasih telah memesan tiket di bioskop kami.
      </p>
      
      {transaction && (
        <div style={{ 
          textAlign: "left", 
          marginTop: "20px", 
          padding: "25px", 
          backgroundColor: "white", 
          borderRadius: "15px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#007bff" }}>
            Detail Transaksi
          </h3>
          
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>ID Transaksi:</span>
              <strong>{transaction.id}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Film:</span>
              <strong>{transaction.jadwal?.Judul_Film || "-"}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Tanggal:</span>
              <strong>{formatTanggal(transaction.jadwal?.Tanggal)}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Jam:</span>
              <strong>{transaction.jadwal?.Jam_Mulai?.substring(0, 5)} WIB</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Studio:</span>
              <strong>{transaction.jadwal?.Nama_Studio || `Studio ${transaction.jadwal?.No_Studio}`}</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Kursi:</span>
              <strong>{transaction.seats?.join(", ") || "-"}</strong>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              borderTop: "2px dashed #ddd",
              paddingTop: "15px",
              marginTop: "10px"
            }}>
              <span style={{ color: "#666", fontWeight: "bold" }}>Total:</span>
              <strong style={{ color: "#28a745", fontSize: "18px" }}>
                {formatRupiah(transaction.total)}
              </strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Metode:</span>
              <strong>{transaction.paymentMethod || "Transfer Bank"}</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: "30px", 
        display: "flex", 
        gap: "15px", 
        justifyContent: "center" 
      }}>
        <button
          onClick={() => navigate("/riwayat-tiket")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          📋 Lihat Riwayat Tiket
        </button>
        
        <button
          onClick={() => window.print()}
          style={{
            padding: "12px 25px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"}
        >
          🖨️ Cetak Tiket
        </button>
      </div>

      <p style={{ marginTop: "20px", color: "#999", fontSize: "14px" }}>
        Akan dialihkan ke halaman riwayat dalam {countdown} detik...
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "15px",
          padding: "8px 20px",
          backgroundColor: "transparent",
          color: "#666",
          border: "1px solid #ddd",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "13px"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#f8f9fa";
          e.target.style.color = "#333";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = "#666";
        }}
      >
        ← Kembali ke Beranda
      </button>
    </div>
  );
}

export default PaymentSuccess;