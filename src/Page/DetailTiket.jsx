import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DetailTiket() {
  const [ticket, setTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ticketData = localStorage.getItem("viewTicket");
    if (ticketData) {
      setTicket(JSON.parse(ticketData));
    } else {
      navigate("/riwayat-tiket");
    }
  }, [navigate]);

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

  const formatWaktu = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!ticket) {
    return (
      <div className="detail-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="ticket-card">
        {/* HEADER TIKET */}
        <div className="ticket-header">
          <div className="ticket-brand">🎬 FilmOut</div>
          <h1>E-Ticket</h1>
          <div className="ticket-id">{ticket.id}</div>
          <div className="ticket-status">LUNAS</div>
        </div>

        {/* BODY TIKET */}
        <div className="ticket-body">
          {/* INFO FILM */}
          <div className="movie-section">
            <h2>{ticket.jadwal?.Judul_Film || "Film"}</h2>
            <div className="movie-meta">
              <span>⭐ {ticket.jadwal?.Rating || "0"}</span>
              <span>🎬 {ticket.jadwal?.Director || "Director"}</span>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div>
                <label>Tanggal</label>
                <span>{formatTanggal(ticket.jadwal?.Tanggal)}</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">⏰</span>
              <div>
                <label>Jam</label>
                <span>{ticket.jadwal?.Jam_Mulai?.substring(0, 5)} WIB</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🎪</span>
              <div>
                <label>Studio</label>
                <span>{ticket.jadwal?.Nama_Studio || `Studio ${ticket.jadwal?.No_Studio}`}</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">💺</span>
              <div>
                <label>Kursi</label>
                <span>{ticket.seats?.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="ticket-divider">
            <span className="divider-text">DETAIL PEMBAYARAN</span>
          </div>

          {/* DETAIL HARGA */}
          <div className="price-section">
            <div className="price-row">
              <span>Harga Tiket ({ticket.seats?.length} x)</span>
              <span>{formatRupiah(ticket.total)}</span>
            </div>
            <div className="price-row">
              <span>Biaya Layanan</span>
              <span>Rp 0</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>{formatRupiah(ticket.total)}</span>
            </div>
          </div>

          {/* INFO PEMBAYARAN */}
          <div className="payment-info">
            <div className="payment-row">
              <span>Metode Pembayaran</span>
              <span>{ticket.paymentMethod || "Transfer Bank"}</span>
            </div>
            <div className="payment-row">
              <span>Waktu Pembayaran</span>
              <span>{formatWaktu(ticket.date)}</span>
            </div>
          </div>

          {/* QR CODE (PLACEHOLDER) */}
          <div className="qr-section">
            <div className="qr-code">
              <div className="qr-placeholder">
                <div className="qr-dots"></div>
              </div>
            </div>
            <p>Tunjukkan QR code ini di pintu masuk bioskop</p>
          </div>

          {/* TERMS */}
          <div className="ticket-terms">
            <p>* Tiket ini berlaku sesuai dengan jadwal yang tertera</p>
            <p>* Tidak dapat dikembalikan atau ditukar</p>
          </div>
        </div>

        {/* FOOTER TIKET */}
        <div className="ticket-footer">
          <button className="btn-back" onClick={() => navigate("/riwayat-tiket")}>
            ← Kembali
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            🖨️ Cetak Tiket
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailTiket;