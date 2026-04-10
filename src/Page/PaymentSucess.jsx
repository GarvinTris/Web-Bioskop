import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Payment.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // PaymentSuccess.jsx - update useEffect
useEffect(() => {
  const lastTrx = localStorage.getItem("lastTransaction");
  console.log("Last transaction from localStorage:", lastTrx);
  
  if (lastTrx) {
      const trxData = JSON.parse(lastTrx);
      console.log("Transaction data:", trxData);
      setTransaction(trxData);
      
      // Pastikan transaksi tersimpan dengan benar
      const userId = localStorage.getItem("userId");
      if (userId && trxData.id) {
          const transactionKey = `transaction_${userId}_${trxData.id}`;
          const existingTrx = localStorage.getItem(transactionKey);
          
          if (!existingTrx) {
              // Jika belum tersimpan, simpan sekarang
              localStorage.setItem(transactionKey, lastTrx);
              console.log("Transaction saved on success page:", transactionKey);
          } else {
              console.log("Transaction already exists:", transactionKey);
          }
      }
  } else {
      // Jika tidak ada lastTransaction, coba cari transaksi terbaru
      const userId = localStorage.getItem("userId");
      if (userId) {
          let latestTransaction = null;
          let latestKey = null;
          
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`transaction_${userId}_`)) {
                  const trx = JSON.parse(localStorage.getItem(key));
                  if (!latestTransaction || new Date(trx.date) > new Date(latestTransaction.date)) {
                      latestTransaction = trx;
                      latestKey = key;
                  }
              }
          }
          
          if (latestTransaction) {
              console.log("Found latest transaction:", latestKey);
              setTransaction(latestTransaction);
          } else {
              navigate("/riwayat-tiket");
          }
      } else {
          navigate("/riwayat-tiket");
      }
  }

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

  if (!transaction) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-icon">✅</div>
      <h2>Pembayaran Berhasil!</h2>
      <p className="success-subtitle">
        Terima kasih telah memesan tiket di bioskop kami.
      </p>
      
      <div className="transaction-card">
        <h3>Detail Transaksi</h3>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>🆔</i> ID Transaksi
          </span>
          <span className="detail-value transaction-id">{transaction.id}</span>
        </div>
        
        
      <div className="transaction-detail">
        <span className="detail-label">
          <i>🎬</i> Film
        </span>
        <span className="detail-value">
          {transaction.jadwal?.Judul_Film || transaction.jadwal?.judul_film || "Film Tidak Diketahui"}
        </span>
      </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>📅</i> Tanggal
          </span>
          <span className="detail-value">{formatTanggal(transaction.jadwal?.Tanggal)}</span>
        </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>⏰</i> Jam
          </span>
          <span className="detail-value">{transaction.jadwal?.Jam_Mulai?.substring(0, 5)} WIB</span>
        </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>🎥</i> Studio
          </span>
          <span className="detail-value">
            {transaction.jadwal?.Nama_Studio || `Studio ${transaction.jadwal?.No_Studio}`}
          </span>
        </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>💺</i> Kursi
          </span>
          <span className="detail-value">
            {transaction.seats?.join(", ") || "-"}
          </span>
        </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>💰</i> Total
          </span>
          <span className="detail-value total-amount">
            {formatRupiah(transaction.total)}
          </span>
        </div>
        
        <div className="transaction-detail">
          <span className="detail-label">
            <i>💳</i> Metode
          </span>
          <span className="detail-value">{transaction.paymentMethod || "Transfer Bank"}</span>
        </div>
      </div>

      <div className="success-actions">
        <button
          onClick={() => navigate("/riwayat-tiket")}
          className="success-button primary"
        >
          📋 Lihat Riwayat Tiket
        </button>
        
        <button
          onClick={() => window.print()}
          className="success-button secondary"
        >
          🖨️ Cetak Tiket
        </button>
      </div>

      <div className="countdown-timer">
        Akan dialihkan ke halaman riwayat dalam 
        <span className="countdown-number">{countdown}</span> 
        detik...
      </div>

      <button
        onClick={() => navigate("/")}
        className="back-button"
      >
        ← Kembali ke Beranda
      </button>
    </div>
  );
}

export default PaymentSuccess;