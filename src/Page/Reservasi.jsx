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

  // 🔴 PERBAIKAN: Coba dengan GET dulu untuk debugging
  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cek dulu apakah ada film dengan judul yang sama
        const url = `http://localhost/Web_Bioskop/API_PHP/bioskop.php?judul=${encodeURIComponent(decodedTitle)}`;
        console.log("Fetching URL:", url);
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        const data = await response.json();
        console.log("Response data:", data);
        
        // 🔴 CEK STRUKTUR RESPONSE
        if (data && Array.isArray(data) && data.length > 0) {
          const filmData = data[0];
          console.log("Film found:", filmData);
          setMovie(filmData);
          setJadwal(filmData.jadwal || []);
          setFilteredJadwal(filmData.jadwal || []);
        } else if (data && data.success === false) {
          setError(data.message || "Film tidak ditemukan");
          setMovie(null);
        } else {
          console.warn("No film found, trying alternative fetch...");
          // 🔴 ALTERNATIF: Ambil semua film lalu cari manual
          await fetchAllMoviesAndFind();
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal mengambil data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Fungsi alternatif: ambil semua film lalu cari
    const fetchAllMoviesAndFind = async () => {
      try {
        const response = await fetch('http://localhost/Web_Bioskop/API_PHP/bioskop.php', {
          credentials: 'include'
        });
        const allMovies = await response.json();
        console.log("All movies:", allMovies);
        
        if (Array.isArray(allMovies)) {
          // Cari film dengan judul yang match (case insensitive)
          const foundMovie = allMovies.find(
            film => film.Judul_Film?.toLowerCase() === decodedTitle.toLowerCase()
          );
          
          if (foundMovie) {
            console.log("Found movie in all movies:", foundMovie);
            setMovie(foundMovie);
            // Ambil jadwal terpisah
            await fetchJadwalForMovie(foundMovie.ID_Film);
          } else {
            setError(`Film "${decodedTitle}" tidak ditemukan`);
          }
        } else {
          setError("Gagal mengambil daftar film");
        }
      } catch (err) {
        console.error("Alternative fetch error:", err);
        setError("Gagal mengambil data film");
      }
    };
    
    // Ambil jadwal berdasarkan ID Film
    const fetchJadwalForMovie = async (idFilm) => {
      try {
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/jadwal.php?id_film=${idFilm}`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log("Jadwal data:", data);
        
        if (Array.isArray(data)) {
          setJadwal(data);
          setFilteredJadwal(data);
        } else if (data.success && data.data) {
          setJadwal(data.data);
          setFilteredJadwal(data.data);
        } else {
          setJadwal([]);
          setFilteredJadwal([]);
        }
      } catch (err) {
        console.error("Error fetching jadwal:", err);
        setJadwal([]);
        setFilteredJadwal([]);
      }
    };
    
    fetchMovieData();
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
  const handleSelectJadwal = (item) => {
    console.log("Selected jadwal item:", item);
    const movieTitle = movie?.Judul_Film || item.Judul_Film || "Film Tidak Diketahui";
    
    const selectedWithPrice = {
      ...item,
      Judul_Film: movieTitle,
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
      const movieTitle = movie?.Judul_Film || selectedJadwal.Judul_Film || "Film Tidak Diketahui";
      
      const jadwalToSave = {
        ...selectedJadwal,
        Judul_Film: movieTitle
      };
      
      console.log("Saving to localStorage:", jadwalToSave);
      localStorage.setItem("selectedJadwal", JSON.stringify(jadwalToSave));
      navigate("/seat-selection");
    } else {
      alert("Silakan pilih jadwal terlebih dahulu");
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
        <button onClick={() => window.history.back()}>Kembali</button>
      </div>
    );
  if (!movie)
    return (
      <div className="reservasi-container">
        <h2>Film tidak ditemukan</h2>
        <button onClick={() => window.history.back()}>Kembali</button>
      </div>
    );

  const groupedJadwal = groupJadwalByStudio(filteredJadwal);

  return (
    <div className="reservasi-container">
      {/* Bagian atas: poster dan info film */}
      <div className="reservasi-showcase">
        <img 
          src={`http://localhost/Web_Bioskop/API_PHP/uploads/${movie.image}`} 
          alt={movie.Judul_Film} 
          onError={(e) => (e.target.src = "https://via.placeholder.com/300x450?text=No+Image")} 
        />
        <div className="reservasi-info">
          <h1>{movie.Judul_Film}</h1>
          <div className="rating-container">
            <div className="rating">
              <span>⭐ {movie.Rating || "N/A"}</span>
            </div>
            <div className="age-rating">{movie.Rating_Usia || "SU"}</div>
          </div>
          <div className="movie-meta">
            <span className="label">Genre:</span>
            <span className="value">{movie.Nama_Kategori || movie.ID_Kategori || "-"}</span>
            <span className="label">Durasi:</span>
            <span className="value">{movie.Durasi ? movie.Durasi.substring(0, 5) : "-"} Jam</span>
            <span className="label">Director:</span>
            <span className="value">{movie.Director || "-"}</span>
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
            <p>{movie.Deskripsi || "Deskripsi film tidak tersedia."}</p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-content">
            {/* Filter tanggal */}
            {uniqueDates.length > 0 && (
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
            )}

            {/* Daftar jadwal */}
            <div className="jadwal-section">
              <h2>{movie.Judul_Film} SCHEDULE IN CINEMAS</h2>
              <p className="result-count">{filteredJadwal.length} jadwal tersedia</p>

              {filteredJadwal.length === 0 ? (
                <div className="no-result">
                  <p>Tidak ada jadwal yang tersedia untuk film ini.</p>
                </div>
              ) : (
                <>
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
                              <span className="harga">Rp {(item.Harga || 50000).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    className="buy-ticket-btn" 
                    onClick={handleBuyTicket} 
                    disabled={!selectedJadwal}
                    style={{
                      backgroundColor: selectedJadwal ? "#e50914" : "#ccc",
                      cursor: selectedJadwal ? "pointer" : "not-allowed"
                    }}
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