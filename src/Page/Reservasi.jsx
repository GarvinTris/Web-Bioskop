import "../style/Reservasi.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Synopsis() {
    return (
        <div className="synopsis">
            <h2>Synopsis</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, quisquam.</p>
        </div>
    );
}

function Schedule({ jadwal = [], onSelectJadwal }) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedJadwal, setSelectedJadwal] = useState(null);

    // Group jadwal by tanggal
    const groupedJadwal = jadwal.reduce((acc, item) => {
        if (!acc[item.Tanggal]) {
            acc[item.Tanggal] = [];
        }
        acc[item.Tanggal].push(item);
        return acc;
    }, {});

    const uniqueDates = Object.keys(groupedJadwal);

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedJadwal(null);
    };

    const handleTimeSelect = (item) => {
        setSelectedJadwal(item);
        if (onSelectJadwal) {
            onSelectJadwal(item);
        }
    };

    if (jadwal.length === 0) {
        return (
            <div className="schedule">
                <h2>Schedule</h2>
                <p>Belum ada jadwal untuk film ini</p>
            </div>
        );
    }

    return (
        <div className="schedule">
            <h2>Schedule</h2>
            
            {uniqueDates.length > 0 ? (
                <>
                    <div className="date-buttons">
                        {uniqueDates.map((date, index) => (
                            <button
                                key={index}
                                className={selectedDate === date ? "active" : ""}
                                onClick={() => handleDateClick(date)}
                            >
                                {new Date(date).toLocaleDateString('id-ID', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </button>
                        ))}
                    </div>

                    {selectedDate && (
                        <div className="time-slots">
                            <h4>Jam Tayang:</h4>
                            {groupedJadwal[selectedDate].map((item, idx) => (
                                <button
                                    key={idx}
                                    className={`time-btn ${selectedJadwal?.ID_Jadwal === item.ID_Jadwal ? 'active' : ''}`}
                                    onClick={() => handleTimeSelect(item)}
                                >
                                    {item.Jam_Mulai.substring(0, 5)} WIB
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <p>Tidak ada jadwal tersedia</p>
            )}
        </div>
    );
}

function Reservasi() {
    const { Judul_Film } = useParams();
    const decodedTitle = decodeURIComponent(Judul_Film);

    const [movie, setMovie] = useState(null); // Ubah jadi null, bukan array
    const [jadwal, setJadwal] = useState([]);
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("loggedIn");

    const handleBuyTicket = () => {
        if (!isLoggedIn) {
            navigate("/Login");
        } else if (!selectedJadwal) {
            alert("Silakan pilih jadwal terlebih dahulu");
        } else {
            // Simpan data jadwal yang dipilih
            localStorage.setItem("selectedJadwal", JSON.stringify(selectedJadwal));
            navigate("/seat-selection");
        }
    };

    useEffect(() => {
        setLoading(true);
        
        fetch(`http://localhost/24SI1_PHP/bioskop.php?judul=${encodeURIComponent(decodedTitle)}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("DATA DARI BIOSKOP.PHP:", data);
                
                if (data && data.length > 0) {
                    // Data film ada di index 0
                    const filmData = data[0];
                    setMovie(filmData);
                    
                    // Set jadwal jika ada
                    if (filmData.jadwal && filmData.jadwal.length > 0) {
                        setJadwal(filmData.jadwal);
                    } else {
                        setJadwal([]);
                    }
                    
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

    // Loading state
    if (loading) {
        return (
            <div className="reservasi-container">
                <h2>Loading...</h2>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="reservasi-container">
                <h2>Error: {error}</h2>
                <button onClick={() => window.location.reload()}>Coba Lagi</button>
            </div>
        );
    }

    // Film tidak ditemukan
    if (!movie) {
        return (
            <div className="reservasi-container">
                <h2>Film tidak ditemukan</h2>
            </div>
        );
    }

    const formatDurasi = (timeString) => {
        if (!timeString) return "";
        
        // Handle format time dari database (HH:MM:SS)
        const parts = timeString.split(":");
        if (parts.length >= 2) {
            const jam = parseInt(parts[0], 10);
            const menit = parseInt(parts[1], 10);
            
            if (jam > 0 && menit > 0) {
                return `${jam} HOUR ${menit} MINUTES`;
            } else if (jam > 0) {
                return `${jam} HOUR`;
            } else if (menit > 0) {
                return `${menit} MINUTES`;
            }
        }
        
        return timeString;
    };

    return (
        <div className="reservasi-container">
            <div className="reservasi-showcase">
                <img 
                    src={`http://localhost/24SI1_PHP/uploads/${movie.image}`}
                    alt={movie.Judul_Film}
                    onError={(e) => {
                        e.target.src = 'http://localhost/24SI1_PHP/uploads/placeholder.jpg';
                    }}
                />
                <div className="reservasi-info">
                    <h1>{movie.Judul_Film}</h1>
                    <p>Genre: {movie.Nama_Kategori || movie.ID_Kategori}</p>
                    <p>Director: {movie.Director}</p>
                    <p>Rating: ⭐ {movie.Rating}</p>
                    <p>Durasi: {formatDurasi(movie.Durasi)}</p>
                    <button>See Trailer</button>
                </div>
            </div>

            <Synopsis />
            
            <Schedule 
                jadwal={jadwal} 
                onSelectJadwal={setSelectedJadwal}
            />

            <button 
                onClick={handleBuyTicket}
                disabled={!selectedJadwal}
                style={{
                    opacity: selectedJadwal ? 1 : 0.5,
                    cursor: selectedJadwal ? "pointer" : "not-allowed",
                    padding: "10px 20px",
                    margin: "20px 0",
                    fontSize: "16px"
                }}
            >
                {selectedJadwal ? "BUY TICKET" : "PILIH JADWAL DAHULU"}
            </button>
        </div>
    );
}

export default Reservasi;