import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RiwayatTiket() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua, mingguini, bulanini
  const navigate = useNavigate();

  // Cek login
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/Login");
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    try {
      // Ambil semua transaksi dari localStorage
      const allTransactions = [];
      
      // Cari semua key yang dimulai dengan "transaction_"
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("transaction_")) {
          try {
            const trx = JSON.parse(localStorage.getItem(key));
            allTransactions.push(trx);
          } catch (e) {
            console.log("Error parsing transaction:", e);
          }
        }
      }
      
      // Urutkan dari terbaru ke terlama
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(allTransactions);
      setLoading(false);
    } catch (err) {
      console.log("Error:", err);
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filterTransactions = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filter) {
      case "mingguini":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(t => new Date(t.date) >= weekAgo);
      
      case "bulanini":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(t => new Date(t.date) >= monthAgo);
      
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
      <div className="riwayat-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="riwayat-container">
      <h1>Riwayat Tiket Saya</h1>
      
      {/* FILTER BUTTONS */}
      <div className="riwayat-filters">
        <button 
          className={`filter-btn ${filter === 'semua' ? 'active' : ''}`}
          onClick={() => setFilter('semua')}
        >
          Semua Transaksi
        </button>
        <button 
          className={`filter-btn ${filter === 'mingguini' ? 'active' : ''}`}
          onClick={() => setFilter('mingguini')}
        >
          Minggu Ini
        </button>
        <button 
          className={`filter-btn ${filter === 'bulanini' ? 'active' : ''}`}
          onClick={() => setFilter('bulanini')}
        >
          Bulan Ini
        </button>
      </div>

      {/* STATISTIK */}
      <div className="riwayat-stats">
        <div className="stat-card">
          <span className="stat-label">Total Transaksi</span>
          <span className="stat-value">{filteredTransactions.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tiket</span>
          <span className="stat-value">
            {filteredTransactions.reduce((sum, t) => sum + (t.seats?.length || 0), 0)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pengeluaran</span>
          <span className="stat-value">
            {formatRupiah(filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0))}
          </span>
        </div>
      </div>

      {/* DAFTAR TRANSAKSI */}
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
          {filteredTransactions.map((trx, index) => (
            <div key={index} className="transaction-card">
              <div className="transaction-header">
                <div>
                  <span className="transaction-id">{trx.id}</span>
                  <span className="transaction-badge">LUNAS</span>
                </div>
                <span className="transaction-date">
                  {new Date(trx.date).toLocaleDateString('id-ID')}
                </span>
              </div>
              
              <div className="transaction-body">
                <div className="movie-info">
                  <h3>{trx.jadwal?.Judul_Film || "Film"}</h3>
                  <p className="studio-info">
                    <span>🎬 {trx.jadwal?.Nama_Studio || `Studio ${trx.jadwal?.No_Studio}`}</span>
                    <span>📅 {formatTanggal(trx.jadwal?.Tanggal).split(',')[0]}</span>
                    <span>⏰ {trx.jadwal?.Jam_Mulai?.substring(0, 5)} WIB</span>
                  </p>
                </div>
                
                <div className="seats-info">
                  <span className="seats-label">Kursi:</span>
                  <div className="seats-value">
                    {trx.seats?.map((seat, i) => (
                      <span key={i} className="seat-badge">{seat}</span>
                    ))}
                  </div>
                </div>
                
                <div className="transaction-footer">
                  <div className="price-detail">
                    <span className="price-label">Total</span>
                    <span className="total-price">{formatRupiah(trx.total)}</span>
                  </div>
                  <button 
                    className="view-ticket-btn"
                    onClick={() => handleViewTicket(trx)}
                  >
                    Lihat Tiket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RiwayatTiket;