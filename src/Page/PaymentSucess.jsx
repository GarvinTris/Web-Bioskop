import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const lastTrx = localStorage.getItem("lastTransaction");
    if (lastTrx) {
      setTransaction(JSON.parse(lastTrx));
    }
  }, []);

  return (
    <div className="success-container" style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center", padding: "30px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
      <div style={{ fontSize: "80px", color: "#28a745", marginBottom: "20px" }}>✅</div>
      <h2>Pembayaran Berhasil!</h2>
      <p>Terima kasih telah memesan tiket di bioskop kami.</p>
      
      {transaction && (
        <div style={{ textAlign: "left", marginTop: "30px", padding: "20px", backgroundColor: "white", borderRadius: "5px" }}>
          <h3>Detail Transaksi</h3>
          <p><strong>ID Transaksi:</strong> {transaction.id}</p>
          <p><strong>Film:</strong> {transaction.jadwal.Judul_Film}</p>
          <p><strong>Tanggal:</strong> {transaction.jadwal.Tanggal}</p>
          <p><strong>Jam:</strong> {transaction.jadwal.Jam_Mulai}</p>
          <p><strong>Kursi:</strong> {transaction.seats.join(", ")}</p>
          <p><strong>Total:</strong> Rp {transaction.total.toLocaleString()}</p>
          <p><strong>Metode:</strong> {transaction.paymentMethod}</p>
        </div>
      )}

      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Kembali ke Beranda
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Cetak Tiket
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;