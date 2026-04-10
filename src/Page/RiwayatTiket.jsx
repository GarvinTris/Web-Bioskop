// RiwayatTiket.jsx - Perbaiki bagian loading
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

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/getUserTransactions.php?id=${userId}&t=${timestamp}`);
      const data = await response.json();
      
      if (data.success) {
        const formattedTransactions = await Promise.all(data.transactions.map(async (trx) => {
          let seats = [];
          const storageKey = `transaction_${userId}_${trx.ID_Transaksi}`;
          const storedTrx = localStorage.getItem(storageKey);
          if (storedTrx) {
            const parsed = JSON.parse(storedTrx);
            seats = parsed.seats || [];
          }
          
          return {
            id: trx.ID_Transaksi,
            userId: trx.ID_Penonton,
            jadwal: {
              ID_Jadwal: trx.ID_Jadwal,
              Judul_Film: trx.Judul_Film,
              Tanggal: trx.Tanggal,
              Jam_Mulai: trx.Jam_Mulai,
              Nama_Studio: trx.Nama_Studio,
              No_Studio: trx.No_Studio,
              Harga: trx.Harga
            },
            seats: seats,
            total: trx.Total_Harga,
            paymentMethod: trx.Metode_Pembayaran || "Transfer Bank",
            date: trx.Tanggal_Pemesanan,
            status: "success"
          };
        }));
        
        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatTanggal = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTanggalShort = (dateString) => {
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
    if (trx.jadwal?.Jam_Mulai) return trx.jadwal.Jam_Mulai.substring(0, 5);
    return "Jam tidak tersedia";
  };

  const getShowDate = (trx) => {
    if (trx.jadwal?.Tanggal) return trx.jadwal.Tanggal;
    return null;
  };

  const canCancelTicket = (jadwal) => {
    if (!jadwal || !jadwal.Tanggal) return false;
    const showDate = new Date(jadwal.Tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = (showDate - today) / (1000 * 3600 * 24);
    return daysDiff >= 1;
  };

  const handleCancelTicket = async () => {
    if (!selectedTransaction) return;
    if (!cancelReason.trim()) {
      alert("Mohon berikan alasan pembatalan");
      return;
    }
    
    setIsCancelling(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Tiket berhasil dibatalkan!\nRefund akan diproses dalam 3-7 hari kerja ke metode pembayaran Anda.`);
      fetchTransactions();
      setShowCancelModal(false);
      setSelectedTransaction(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      alert("Gagal membatalkan tiket. Silakan coba lagi.");
    } finally {
      setIsCancelling(false);
    }
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

  // Loading component yang rapi
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
            const isCancellable = canCancelTicket(trx.jadwal);
            const movieTitle = getMovieTitle(trx);
            const studioName = getStudioName(trx);
            const showTime = getShowTime(trx);
            const showDate = getShowDate(trx);
            
            return (
              <div key={index} className={`transaction-card ${trx.cancelled ? 'cancelled' : ''}`}>
                <div className="transaction-header">
                  <div>
                    <span className="transaction-id">{trx.id}</span>
                    <span className={`transaction-badge ${trx.cancelled ? 'cancelled-badge' : 'success-badge'}`}>
                      {trx.cancelled ? 'DIBATALKAN' : 'LUNAS'}
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
                      {trx.seats?.map((seat, i) => (
                        <span key={i} className="seat-badge">
                          {seat}
                        </span>
                      ))}
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
                      
                      {!trx.cancelled && isCancellable && (
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RiwayatTiket;