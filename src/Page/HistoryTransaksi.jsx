import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HistoryTransaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua, hariini, mingguini, bulanini
  const navigate = useNavigate();
  
  // Cek login (ambil ID penonton dari localStorage)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      // Kalau admin, ambil semua transaksi. Kalau user, ambil transaksi user saja
      const url = isAdmin 
        ? "http://localhost/24SI1_PHP/getTransaksi.php"
        : `http://localhost/24SI1_PHP/getTransaksi.php?id_penonton=${user.ID_Penonton}`;
      
      const res = await axios.get(url);
      setTransaksi(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Error ambil transaksi:", err);
      setLoading(false);
    }
  };

  // Filter transaksi berdasarkan tanggal
  const filterTransaksi = (data) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch(filter) {
      case "hariini":
        return data.filter(t => t.Tanggal_Pemesanan === todayStr);
      case "mingguini":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(t => new Date(t.Tanggal_Pemesanan) >= weekAgo);
      case "bulanini":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(t => new Date(t.Tanggal_Pemesanan) >= monthAgo);
      default:
        return data;
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransaksi = filterTransaksi(transaksi);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="history-container" style={{ maxWidth: "1200px", margin: "20px auto", padding: "20px" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Riwayat Transaksi</h1>
        {isAdmin && <span style={{ backgroundColor: "#007bff", color: "white", padding: "5px 10px", borderRadius: "5px" }}>Mode Admin</span>}
      </div>

      {/* FILTER BUTTONS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["semua", "hariini", "mingguini", "bulanini"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === f ? "#007bff" : "#f8f9fa",
              color: filter === f ? "white" : "black",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {f === "semua" ? "Semua" : 
             f === "hariini" ? "Hari Ini" : 
             f === "mingguini" ? "Minggu Ini" : "Bulan Ini"}
          </button>
        ))}
      </div>

      {/* STATISTIK */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px", textAlign: "center" }}>
          <h3>Total Transaksi</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{filteredTransaksi.length}</p>
        </div>
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px", textAlign: "center" }}>
          <h3>Total Tiket</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {filteredTransaksi.reduce((sum, t) => sum + (parseInt(t.Jumlah) || 0), 0)}
          </p>
        </div>
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px", textAlign: "center" }}>
          <h3>Total Pendapatan</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
            {formatRupiah(filteredTransaksi.reduce((sum, t) => sum + (parseInt(t.Total_Harga) || 0), 0))}
          </p>
        </div>
      </div>

      {/* DAFTAR TRANSAKSI */}
      {filteredTransaksi.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>Belum ada transaksi</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {filteredTransaksi.map((trx) => (
            <div
              key={trx.ID_Transaksi}
              style={{
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "5px",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {/* HEADER TRANSAKSI */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div>
                  <span style={{ fontSize: "14px", color: "#666" }}>ID Transaksi</span>
                  <p style={{ fontWeight: "bold", margin: "5px 0" }}>{trx.ID_Transaksi}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>Tanggal Pemesanan</span>
                  <p style={{ margin: "5px 0" }}>{formatTanggal(trx.Tanggal_Pemesanan)}</p>
                </div>
              </div>

              {/* DETAIL FILM */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px", marginBottom: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Film</span>
                  <p style={{ fontWeight: "bold", margin: "5px 0" }}>{trx.Judul_Film || "-"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Tanggal Tayang</span>
                  <p style={{ margin: "5px 0" }}>{trx.Tanggal || "-"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Jam</span>
                  <p style={{ margin: "5px 0" }}>{trx.Jam_Mulai || "-"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Studio</span>
                  <p style={{ margin: "5px 0" }}>{trx.Nama_Studio || "-"}</p>
                </div>
              </div>

              {/* DETAIL TIKET */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Kursi</span>
                  <p style={{ margin: "5px 0" }}>{trx.ID_Kursi || "-"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Jumlah Tiket</span>
                  <p style={{ margin: "5px 0", fontWeight: "bold" }}>{trx.Jumlah}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Harga per Tiket</span>
                  <p style={{ margin: "5px 0" }}>{formatRupiah(trx.Harga)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Total Harga</span>
                  <p style={{ margin: "5px 0", fontWeight: "bold", color: "#28a745" }}>{formatRupiah(trx.Total_Harga)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#666" }}>Penonton</span>
                  <p style={{ margin: "5px 0" }}>{trx.Nama_Penonton || "-"}</p>
                </div>
                <div>
                  <button
                    onClick={() => window.open(`/tiket/${trx.ID_Transaksi}`, '_blank')}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
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

export default HistoryTransaksi;