import "../style/Reservasi.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Synopsis({ deskripsi }) {
    return (
        <div className="synopsis-content">
            <p>{deskripsi || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, quisquam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."}</p>
        </div>
    );
}

function ScheduleContent({ jadwal, filteredJadwal, selectedDate, setSelectedDate, searchCinema, setSearchCinema, uniqueDates, formatDateButton, handlePilihJadwal, isLoggedIn }) {
    return (
        <div className="schedule-content">
            {/* FILTER SECTION */}
            <div className="filter-section">
                {/* DATE FILTER BUTTONS */}
                <div className="date-filter">
                    <h3>Pilih Tanggal</h3>
                    <div className="date-buttons">
                        <button
                            className={`date-btn ${selectedDate === '' ? 'active' : ''}`}
                            onClick={() => setSelectedDate('')}
                        >
                            Semua
                        </button>
                        {uniqueDates.map((date) => (
                            <button
                                key={date}
                                className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {formatDateButton(date)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SEARCH CINEMA */}
                <div className="search-filter">
                    <h3>Cari Studio</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search cinema..."
                            value={searchCinema}
                            onChange={(e) => setSearchCinema(e.target.value)}
                        />
                        <i className="fa-solid fa-search"></i>
                    </div>
                </div>
            </div>

            {/* JADWAL LIST */}
            <div className="jadwal-section">
                <h2>Jadwal Tersedia</h2>
                <p className="result-count">{filteredJadwal.length} jadwal ditemukan</p>

                {filteredJadwal.length === 0 ? (
                    <div className="no-result">
                        <p>Tidak ada jadwal yang sesuai dengan filter</p>
                    </div>
                ) : (
                    <div className="jadwal-grid">
                        {filteredJadwal.map((item, index) => (
                            <div key={index} className="jadwal-card">
                                {/* STUDIO INFO */}
                                <div className="studio-header">
                                    <h3>{item.Nama_Studio || `Studio ${item.No_Studio}`}</h3>
                                    <span className="studio-type">Regular 2D</span>
                                </div>

                                {/* PRICE */}
                                <div className="price-info">
                                    <span className="price-label">Harga</span>
                                    <span className="price-value">
                                        Rp {item.Harga?.toLocaleString() || "50.000"}
                                    </span>
                                </div>

                                {/* JAM TAYANG SEBAGAI TOMBOL */}
                                <button 
                                    className="jam-btn"
                                    onClick={() => handlePilihJadwal(item)}
                                >
                                    {item.Jam_Mulai.substring(0, 5)} WIB
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Reservasi() {
    const { Judul_Film } = useParams();
    const decodedTitle = decodeURIComponent(Judul_Film);

    const [movie, setMovie] = useState(null);
    const [jadwal, setJadwal] = useState([]);
    const [filteredJadwal, setFilteredJadwal] = useState([]);
    
    // FILTER STATES
    const [selectedDate, setSelectedDate] = useState("");
    const [searchCinema, setSearchCinema] = useState("");
    
    // TAB STATE
    const [activeTab, setActiveTab] = useState("schedule"); // 'synopsis' atau 'schedule'
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("loggedIn");

    useEffect(() => {
        setLoading(true);
        
        fetch(`http://localhost/24SI1_PHP/bioskop.php?judul=${encodeURIComponent(decodedTitle)}`)
            .then(res => res.json())
            .then(data => {
                console.log("DATA DARI BIOSKOP.PHP:", data);
                
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
            .catch(err => {
                console.log("Error fetch:", err);
                setError("Gagal mengambil data: " + err.message);
                setLoading(false);
            });
    }, [decodedTitle]);

    // ========== FILTER FUNCTIONS ==========
    
    // Apply filters when selectedDate or searchCinema changes
    useEffect(() => {
        let filtered = [...jadwal];
        
        // Filter by date
        if (selectedDate) {
            filtered = filtered.filter(j => j.Tanggal === selectedDate);
        }
        
        // Filter by cinema name
        if (searchCinema) {
            filtered = filtered.filter(j => 
                j.Nama_Studio?.toLowerCase().includes(searchCinema.toLowerCase())
            );
        }
        
        setFilteredJadwal(filtered);
    }, [selectedDate, searchCinema, jadwal]);

    // Get unique dates from jadwal
    const uniqueDates = [...new Set(jadwal.map(j => j.Tanggal))].sort();

    // Format tanggal untuk filter
    const formatDateButton = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Hari Ini";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Besok";
        } else {
            return date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    };

    // Handle pilih jadwal
    const handlePilihJadwal = (item) => {
        if (!isLoggedIn) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            navigate("/Login");
        } else {
            localStorage.setItem("selectedJadwal", JSON.stringify(item));
            navigate("/seat-selection");
        }
    };

    if (loading) return <div className="reservasi-container"><h2>Loading...</h2></div>;
    if (error) return <div className="reservasi-container"><h2>Error: {error}</h2></div>;
    if (!movie) return <div className="reservasi-container"><h2>Film tidak ditemukan</h2></div>;

    return (
        <div className="reservasi-container">
            {/* MOVIE INFO - TETAP DI ATAS */}
            <div className="reservasi-showcase">
                <img 
                    src={`http://localhost/24SI1_PHP/uploads/${movie.image}`}
                    alt={movie.Judul_Film}
                    onError={(e) => e.target.src = 'http://localhost/24SI1_PHP/uploads/placeholder.jpg'}
                />
                <div className="reservasi-info">
                    <h1>{movie.Judul_Film}</h1>
                    <p>Genre: {movie.Nama_Kategori || movie.ID_Kategori}</p>
                    <p>Director: {movie.Director}</p>
                    <p>Rating: ⭐ {movie.Rating}</p>
                    <p>Durasi: {movie.Durasi?.substring(0, 5)} Jam</p>
                    <button 
                        className="trailer-btn"
                        onClick={() => {
                            if (movie.Trailer_URL) {
                                window.open(movie.Trailer_URL, '_blank');
                            } else {
                                alert("Trailer tidak tersedia");
                            }
                        }}
                    >
                        <i className="fa-brands fa-youtube"></i> Watch Trailer
                    </button>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'synopsis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('synopsis')}
                >
                    Synopsis
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    Schedule
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="tab-content">
                {activeTab === 'synopsis' && (
                    <Synopsis deskripsi={movie.Deskripsi} />
                )}
                
                {activeTab === 'schedule' && (
                    <ScheduleContent 
                        jadwal={jadwal}
                        filteredJadwal={filteredJadwal}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        searchCinema={searchCinema}
                        setSearchCinema={setSearchCinema}
                        uniqueDates={uniqueDates}
                        formatDateButton={formatDateButton}
                        handlePilihJadwal={handlePilihJadwal}
                        isLoggedIn={isLoggedIn}
                    />
                )}
            </div>
        </div>
    );
}

export default Reservasi;