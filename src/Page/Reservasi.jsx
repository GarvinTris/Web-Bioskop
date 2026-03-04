import "../style/Reservasi.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const dates = ["2026-03-05", "2026-03-06", "2026-03-07"]; // contoh tanggal yang tersedia

function Synopsis() {
    return (
        <div className="synopsis">
        <h2>Synopsis</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, quisquam.</p>
        </div>
    );
}

function Schedule({ availableDates }) {
    const [selectedDate, setSelectedDate] = useState("");
  
    return (
      <div className="schedule">
        <h2>Schedule</h2>
        <div className="date-buttons">
          {availableDates.map((date, index) => (
            <button
              key={index}
              className={selectedDate === date ? "active" : ""}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          ))}
        </div>
  
        <p>Selected: {selectedDate || "Belum memilih tanggal"}</p>
      </div>
    );
  }

function Reservasi() {
  const { Judul_Film } = useParams();
  const decodedTitle = decodeURIComponent(Judul_Film);

  const [movie, setMovie] = useState([]);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("loggedIn");

  const handleBuyTicket = () => {
    if (!isLoggedIn) {
      navigate("/Login"); // belum login → ke login
    } else {
      navigate("/buy-ticket"); // sudah login → ke halaman beli tiket
    }
  };

  useEffect(() => {
    fetch(`http://localhost/24SI1_PHP/Bioskop.php?judul=${encodeURIComponent(decodedTitle)}`)
      .then(res => res.json())
      .then(data => {
        console.log("DATA DARI PHP:", data);
        setMovie(data);
      })
      .catch(err => console.log(err));
  }, [decodedTitle]);

  if (!movie || movie.length === 0) {
    return <h2>Loading...</h2>;
  }

  const film = movie[0];

  const formatDurasi = (timeString) => {
    if (!timeString) return "";
  
    const [hours, minutes] = timeString.split(":");
  
    const jam = parseInt(hours, 10);
    const menit = parseInt(minutes, 10);
  
    return `${jam} HOUR ${menit} MINUTES`;
  };

  return (
    <div className="reservasi-container">

    <div className="reservasi-showcase">
        <img 
        src={`http://localhost/24SI1_PHP/uploads/${film.image}`}
        alt={film.Judul_Film}
      />
      <div className="reservasi-info">
        <h1>{film.Judul_Film}</h1>
        <p>Genre: {film.ID_Kategori}</p>
        <p>Director: {film.Director}</p>
        <p>Rating: ⭐ {film.Rating}</p>
        <p>Durasi: {formatDurasi(film.Durasi)} menit</p>

        <button>See Trailer</button>
      </div>
    </div>

      <Synopsis />
      <Schedule availableDates={dates} />

      {/* {movie.map((item, index) => (
        <div key={index}>
          <p>
            {item.Tanggal} - {item.Jam_Mulai} - Rp {item.Harga}
          </p>
        </div>
      ))} */}

    <button onClick={handleBuyTicket}>BUY TICKET</button>

    </div>
  );
}

export default Reservasi;