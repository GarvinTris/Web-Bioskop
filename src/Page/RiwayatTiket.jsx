// RiwayatTiket.jsx - Dengan fitur Batalkan Tiket yang berfungsi
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/RiwayatTiket.css";

function RiwayatTiket() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/Login");
      return;
    }
    fetchTransactions();
  }, []);

  // Fetch transaksi dari API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/getUserTransactions.php?id=${userId}&t=${timestamp}`, {
    credentials: 'include' // Tambahkan ini
});
      const data = await response.json();
      
      if (data.success) {
        const formattedTransactions = data.transactions.map((trx) => {
          // Ambil kursi dari response API
          let seats = [];
          
          // Coba parse kursi dari database
          if (trx.Kursi) {
            if (typeof trx.Kursi === 'string') {
              seats = trx.Kursi.split(',').map(s => s.trim());
            } else if (Array.isArray(trx.Kursi)) {
              seats = trx.Kursi;
            }
          }
          
          // Jika kursi masih kosong, coba dari localStorage
          if (seats.length === 0) {
            const storageKey = `transaction_${userId}_${trx.ID_Transaksi}`;
            const storedTrx = localStorage.getItem(storageKey);
            if (storedTrx) {
              const parsed = JSON.parse(storedTrx);
              seats = parsed.seats || [];
            }
          }
          
          return {
            id: trx.ID_Transaksi,
            userId: userId,
            jadwal: {
              ID_Jadwal: trx.ID_Jadwal,
              Judul_Film: trx.Judul_Film,
              Tanggal: trx.Tanggal,
              Jam_Mulai: trx.Jam_Mulai,
              Nama_Studio: trx.Nama_Studio,
              No_Studio: trx.No_Studio,
              Harga: trx.Harga_Per_Tiket
            },
            seats: seats,
            total: trx.Total_Harga,
            paymentMethod: trx.Metode_Pembayaran,
            date: trx.Tanggal_Pemesanan,
            status: "success",
            isCancelled: trx.isCancelled || false  // tambahkan status batal
          };
        });
        
        console.log("Formatted transactions:", formattedTransactions);
        setTransactions(formattedTransactions);
      } else {
        console.error("API error:", data.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membatalkan tiket
  const handleCancelTicket = async () => {
    if (!selectedTransaction) return;
    
    if (!cancelReason.trim()) {
      alert("Mohon berikan alasan pembatalan");
      return;
    }
    
    setIsCancelling(true);
    
    try {
      const userId = localStorage.getItem("userId");
      
      // Panggil API untuk membatalkan tiket
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/cancelTransaction.php", {
    method: "POST",
    credentials: 'include', // Tambahkan ini
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        id_transaksi: selectedTransaction.id,
        id_penonton: userId,
        alasan: cancelReason
    })
});
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Tiket berhasil dibatalkan!\n\nRefund akan diproses dalam 3-7 hari kerja ke metode pembayaran Anda.\nID Refund: ${result.refund_id || '-'}`);
        
        // Update status di localStorage
        const storageKey = `transaction_${userId}_${selectedTransaction.id}`;
        const storedTrx = localStorage.getItem(storageKey);
        if (storedTrx) {
          const parsed = JSON.parse(storedTrx);
          parsed.isCancelled = true;
          parsed.cancelReason = cancelReason;
          parsed.cancelledAt = new Date().toISOString();
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
        
        // Refresh daftar transaksi
        fetchTransactions();
        setShowCancelModal(false);
        setSelectedTransaction(null);
        setCancelReason("");
      } else {
        alert("Gagal membatalkan tiket: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      alert("Gagal membatalkan tiket. Silakan coba lagi.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Cek apakah tiket bisa dibatalkan (H-1 sebelum tayang)
  // Cek apakah tiket bisa dibatalkan (H-1 sebelum tayang)
const canCancelTicket = (jadwal, isCancelled) => {
  console.log("Checking cancel eligibility:", { jadwal, isCancelled });
  
  if (isCancelled) {
    console.log("Already cancelled");
    return false;
  }
  if (!jadwal || !jadwal.Tanggal) {
    console.log("No jadwal or tanggal");
    return false;
  }
  
  const showDate = new Date(jadwal.Tanggal);
  const today = new Date();
  
  // Reset waktu ke 00:00:00 untuk perbandingan tanggal saja
  today.setHours(0, 0, 0, 0);
  showDate.setHours(0, 0, 0, 0);
  
  const daysDiff = (showDate - today) / (1000 * 3600 * 24);
  console.log(`Show date: ${showDate}, Today: ${today}, Days diff: ${daysDiff}`);
  
  // Bisa batal jika masih H-1 atau lebih (daysDiff >= 1)
  // Atau jika masih hari yang sama tapi belum jam tayang? Sesuaikan kebutuhan
  const isCancellable = daysDiff >= 1; // UBAH SEMENTARA KE >= 0 UNTUK TESTING
  
  console.log("Is cancellable:", isCancellable);
  return isCancellable;
};

  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggalShort = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getMovieTitle = (trx) => {
    if (trx.jadwal?.Judul_Film) return trx.jadwal.Judul_Film;
    if (trx.jadwal?.judul_film) return trx.jadwal.judul_film;
    return "Film Tidak Diketahui";
  };

  const getStudioName = (trx) => {
    if (trx.jadwal?.Nama_Studio) return trx.jadwal.Nama_Studio;
    if (trx.jadwal?.No_Studio) return `Studio ${trx.jadwal.No_Studio}`;
    return "Studio Tidak Diketahui";
  };

  const getShowTime = (trx) => {
    if (trx.jadwal?.Jam_Mulai) {
      return trx.jadwal.Jam_Mulai.substring(0, 5);
    }
    return "Jam tidak tersedia";
  };

  const getShowDate = (trx) => {
    if (trx.jadwal?.Tanggal) return trx.jadwal.Tanggal;
    return null;
  };

  const filterTransactions = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "mingguini":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter((t) => new Date(t.date) >= weekAgo);
      case "bulanini":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter((t) => new Date(t.date) >= monthAgo);
      default:
        return data;
    }
  };

  const handleViewTicket = (transaction) => {
    localStorage.setItem("viewTicket", JSON.stringify(transaction));
    navigate("/detail-tiket");
  };

  const filteredTransactions = filterTransactions(transactions);

  if (loading) {
    return (
      <div className="riwayat-container" style={{ minHeight: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p>Memuat riwayat tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="riwayat-container">
      <h1>Riwayat Tiket Saya</h1>

      {/* Filter buttons */}
      <div className="riwayat-filters">
        <button className={`filter-btn ${filter === "semua" ? "active" : ""}`} onClick={() => setFilter("semua")}>
          Semua Transaksi
        </button>
        <button className={`filter-btn ${filter === "mingguini" ? "active" : ""}`} onClick={() => setFilter("mingguini")}>
          Minggu Ini
        </button>
        <button className={`filter-btn ${filter === "bulanini" ? "active" : ""}`} onClick={() => setFilter("bulanini")}>
          Bulan Ini
        </button>
      </div>

      {/* Statistics */}
      <div className="riwayat-stats">
        <div className="stat-card">
          <span className="stat-label">Total Transaksi</span>
          <span className="stat-value">{filteredTransactions.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tiket</span>
          <span className="stat-value">{filteredTransactions.reduce((sum, t) => sum + (t.seats?.length || 0), 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pengeluaran</span>
          <span className="stat-value">{formatRupiah(filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0))}</span>
        </div>
      </div>

      {/* Transactions list */}
      {filteredTransactions.length === 0 ? (
        <div className="no-transactions">
          <div className="empty-icon">🎫</div>
          <p>Belum ada transaksi</p>
          <button onClick={() => navigate("/")} className="btn-cari-film">
            Cari Film
          </button>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map((trx, index) => {
            const isCancellable = canCancelTicket(trx.jadwal, trx.isCancelled);
            const movieTitle = getMovieTitle(trx);
            const studioName = getStudioName(trx);
            const showTime = getShowTime(trx);
            const showDate = getShowDate(trx);
            const isCancelled = trx.isCancelled;
            
            return (
              <div key={index} className={`transaction-card ${isCancelled ? 'cancelled' : ''}`}>
                <div className="transaction-header">
                  <div>
                    <span className="transaction-id">{trx.id}</span>
                    <span className={`transaction-badge ${isCancelled ? 'cancelled-badge' : 'success-badge'}`}>
                      {isCancelled ? 'DIBATALKAN' : 'LUNAS'}
                    </span>
                  </div>
                  <span className="transaction-date">{new Date(trx.date).toLocaleDateString("id-ID")}</span>
                </div>

                <div className="transaction-body">
                  <div className="movie-info">
                    <h3>{movieTitle}</h3>
                    <p className="studio-info">
                      <span>🎪 {studioName}</span>
                      {showDate && <span>📅 {formatTanggalShort(showDate)}</span>}
                      <span>⏰ {showTime} WIB</span>
                    </p>
                  </div>

                  <div className="seats-info">
                    <span className="seats-label">Kursi:</span>
                    <div className="seats-value">
                      {trx.seats?.length > 0 ? (
                        trx.seats.map((seat, i) => (
                          <span key={i} className="seat-badge">
                            {seat}
                          </span>
                        ))
                      ) : (
                        <span className="no-seats">-</span>
                      )}
                    </div>
                  </div>

                  <div className="transaction-footer">
                    <div className="price-detail">
                      <span className="price-label">Total</span>
                      <span className="total-price">{formatRupiah(trx.total)}</span>
                    </div>
                    <div className="action-buttons">
                      <button className="view-ticket-btn" onClick={() => handleViewTicket(trx)}>
                        Lihat Tiket
                      </button>
                      
                      {!isCancelled && isCancellable && (
                        <button 
                          className="cancel-ticket-btn"
                          onClick={() => {
                            setSelectedTransaction(trx);
                            setShowCancelModal(true);
                          }}
                        >
                          Batalkan Tiket
                        </button>
                      )}
                      
                      {isCancelled && (
                        <span className="cancelled-label">✓ Tiket telah dibatalkan</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Konfirmasi Pembatalan */}
      {showCancelModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)} style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "450px",
            maxWidth: "90%"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#ef4444" }}>⚠️ Batalkan Tiket</h3>
            
            <p style={{ marginBottom: "16px", color: "#666" }}>
              Apakah Anda yakin ingin membatalkan tiket untuk film:
            </p>
            <p style={{ fontWeight: "bold", marginBottom: "16px" }}>
              {getMovieTitle(selectedTransaction)} - {getShowTime(selectedTransaction)} WIB
            </p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Alasan Pembatalan:
              </label>
              <textarea
                rows="3"
                placeholder="Mohon berikan alasan pembatalan..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  resize: "vertical"
                }}
              />
            </div>
            
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                style={{
                  padding: "10px 20px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                onClick={handleCancelTicket}
                disabled={isCancelling || !cancelReason.trim()}
                style={{
                  padding: "10px 24px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isCancelling || !cancelReason.trim() ? "not-allowed" : "pointer",
                  opacity: isCancelling || !cancelReason.trim() ? 0.6 : 1
                }}
              >
                {isCancelling ? "Memproses..." : "Ya, Batalkan Tiket"}
              </button>
            </div>
            
            <p style={{ fontSize: "12px", color: "#999", marginTop: "16px", textAlign: "center" }}>
              * Refund akan diproses dalam 3-7 hari kerja ke metode pembayaran Anda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiwayatTiket;