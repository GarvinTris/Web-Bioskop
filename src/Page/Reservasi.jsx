import "../style/Reservasi.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Reservasi() {
  const { Judul_Film } = useParams();
  const decodedTitle = decodeURIComponent(Judul_Film);

  const [movie, setMovie] = useState(null);
  const [jadwal, setJadwal] = useState([]);
  const [filteredJadwal, setFilteredJadwal] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [activeTab, setActiveTab] = useState("synopsis");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/Web_Bioskop/API_PHP/bioskop.php?judul=${encodeURIComponent(decodedTitle)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const filmData = data[0];
          setMovie(filmData);
          setJadwal(filmData.jadwal || []);
          setFilteredJadwal(filmData.jadwal || []);
          setError(null);
        } else {
          setMovie(null);
          setJadwal([]);
          setError("Film tidak ditemukan");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Gagal mengambil data: " + err.message);
        setLoading(false);
      });
  }, [decodedTitle]);

  // Filter jadwal berdasarkan tanggal
  useEffect(() => {
    let filtered = [...jadwal];
    if (selectedDate) {
      filtered = filtered.filter((j) => j.Tanggal === selectedDate);
    }
    setFilteredJadwal(filtered);
    setSelectedJadwal(null);
  }, [selectedDate, jadwal]);

  // Mendapatkan daftar tanggal unik
  const uniqueDates = [...new Set(jadwal.map((j) => j.Tanggal))].sort();

  // Format tanggal untuk tombol filter
  const formatDateButton = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === tomorrow.toDateString()) return "Besok";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  // Kelompokkan jadwal berdasarkan studio
  const groupJadwalByStudio = (jadwalList) => {
    const groups = {};
    jadwalList.forEach(item => {
      const studioName = item.Nama_Studio || `Studio ${item.No_Studio}`;
      if (!groups[studioName]) {
        groups[studioName] = [];
      }
      groups[studioName].push(item);
    });
    return groups;
  };

  // Pilih jadwal
  // Di bagian pilih jadwal
  const handleSelectJadwal = (item) => {
    console.log("Selected jadwal item:", item);
    console.log("Movie title from item:", item.Judul_Film);
    
    // Ambil judul film dari movie state
    const movieTitle = movie?.Judul_Film || "Film Tidak Diketahui";
    
    const selectedWithPrice = {
      ...item,
      Judul_Film: item.Judul_Film || item.judul_film || movieTitle,
      Harga: item.Harga || 50000
    };
    
    console.log("Selected jadwal with title:", selectedWithPrice);
    setSelectedJadwal(selectedWithPrice);
  };
  
  const handleBuyTicket = () => {
    if (!isLoggedIn) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/Login");
    } else if (selectedJadwal) {
      // Pastikan judul film ada
      const movieTitle = movie?.Judul_Film || "Film Tidak Diketahui";
      
      const jadwalToSave = {
        ...selectedJadwal,
        Judul_Film: selectedJadwal.Judul_Film || selectedJadwal.judul_film || movieTitle
      };
      
      console.log("Saving to localStorage:", jadwalToSave);
      localStorage.setItem("selectedJadwal", JSON.stringify(jadwalToSave));
      navigate("/seat-selection");
    }
  };

  if (loading)
    return (
      <div className="reservasi-container">
        <h2>Loading...</h2>
      </div>
    );
  if (error)
    return (
      <div className="reservasi-container">
        <h2>Error: {error}</h2>
      </div>
    );
  if (!movie)
    return (
      <div className="reservasi-container">
        <h2>Film tidak ditemukan</h2>
      </div>
    );

  const groupedJadwal = groupJadwalByStudio(filteredJadwal);

  return (
    <div className="reservasi-container">
      {/* Bagian atas: poster dan info film */}
      <div className="reservasi-showcase">
        <img src={`http://localhost/Web_Bioskop/API_PHP/uploads/${movie.image}`} alt={movie.Judul_Film} onError={(e) => (e.target.src = "http://localhost/Web_Bioskop/API_PHP/uploads/placeholder.jpg")} />
        <div className="reservasi-info">
          <h1>{movie.Judul_Film}</h1>
          <div className="rating-container">
            <div className="rating">
              <span>⭐ {movie.Rating}</span>
            </div>
            <div className="age-rating">P 13+</div>
          </div>
          <div className="movie-meta">
            <span className="label">Genre:</span>
            <span className="value">{movie.Nama_Kategori || movie.ID_Kategori}</span>
            <span className="label">Durasi:</span>
            <span className="value">{movie.Durasi?.substring(0, 5)} Jam</span>
            <span className="label">Director:</span>
            <span className="value">{movie.Director}</span>
          </div>
          <button
            className="trailer-btn"
            onClick={() => {
              if (movie.Trailer_URL) window.open(movie.Trailer_URL, "_blank");
              else alert("Trailer tidak tersedia");
            }}
          >
            <i className="fa-brands fa-youtube"></i> See Trailer
          </button>
        </div>
      </div>

      {/* Tab navigasi */}
      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === "synopsis" ? "active" : ""}`} onClick={() => setActiveTab("synopsis")}>
          SYNOPSIS
        </button>
        <button className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>
          SCHEDULE
        </button>
      </div>

      {/* Konten tab */}
      <div className="tab-content">
        {activeTab === "synopsis" && (
          <div className="synopsis-content">
            <p>
              {movie.Deskripsi || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, quisquam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-content">
            {/* Filter tanggal */}
            <div className="date-filter">
              <h3>Pilih Tanggal</h3>
              <div className="date-buttons">
                <button className={`date-btn ${selectedDate === "" ? "active" : ""}`} onClick={() => setSelectedDate("")}>
                  Semua
                </button>
                {uniqueDates.map((date) => (
                  <button key={date} className={`date-btn ${selectedDate === date ? "active" : ""}`} onClick={() => setSelectedDate(date)}>
                    {formatDateButton(date)}
                  </button>
                ))}
              </div>
            </div>

            {/* Daftar jadwal */}
            <div className="jadwal-section">
              <h2>{movie.Judul_Film} SCHEDULE IN CINEMAS</h2>
              <p className="result-count">{filteredJadwal.length} jadwal tersedia</p>

              {filteredJadwal.length === 0 ? (
                <div className="no-result">
                  <p>Tidak ada jadwal yang sesuai</p>
                </div>
              ) : (
                <>
                  {/* Loop setiap studio */}
                  {Object.keys(groupedJadwal).map((studioName) => (
                    <div key={studioName} className="studio-section">
                      <div className="studio-type-header">{studioName}</div>
                      
                      <div className="jadwal-list">
                        {groupedJadwal[studioName].map((item, index) => {
                          const isSelected = selectedJadwal && 
                            selectedJadwal.Tanggal === item.Tanggal && 
                            selectedJadwal.Jam_Mulai === item.Jam_Mulai && 
                            selectedJadwal.No_Studio === item.No_Studio;
                          
                          return (
                            <div 
                              key={index} 
                              className={`jadwal-item ${isSelected ? "selected" : ""}`} 
                              onClick={() => handleSelectJadwal(item)}
                            >
                              <span className="jam">{item.Jam_Mulai?.substring(0, 5)} WIB</span>
                              <span className="harga">Rp {item.Harga?.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Tombol BUY TICKET */}
                  <button 
                    className="buy-ticket-btn" 
                    onClick={handleBuyTicket} 
                    disabled={!selectedJadwal}
                  >
                    BUY TICKET
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservasi;