import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Schedule.css";

function Schedule() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [groupedSchedules, setGroupedSchedules] = useState({});

  // Fetch schedules from API
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/jadwal.php?t=${timestamp}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        console.log("Schedules data:", data);
        
        if (Array.isArray(data)) {
            setSchedules(data);
            const uniqueDates = [...new Set(data.map(schedule => schedule.Tanggal))];
            setAvailableDates(uniqueDates);
            if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0]);
        } else {
            setSchedules([]);
        }
        setLoading(false);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        setError("Gagal memuat jadwal");
        setLoading(false);
    }
};

  // Group schedules by studio for selected date
  useEffect(() => {
    if (selectedDate) {
      const filtered = schedules.filter(schedule => schedule.Tanggal === selectedDate);
      
      // Kelompokkan berdasarkan studio
      const groups = {};
      filtered.forEach(schedule => {
        const studioName = schedule.Nama_Studio || `Studio ${schedule.No_Studio}`;
        if (!groups[studioName]) {
          groups[studioName] = [];
        }
        groups[studioName].push(schedule);
      });
      
      setGroupedSchedules(groups);
    }
  }, [selectedDate, schedules]);

  const handleSelectSchedule = (schedule) => {
    // Format data jadwal untuk dikirim ke SeatSelection
    const selectedJadwal = {
      ID_Jadwal: schedule.ID_Jadwal,
      Judul_Film: schedule.judul_film,
      Tanggal: schedule.Tanggal,
      Jam_Mulai: schedule.Jam_Mulai,
      No_Studio: schedule.No_Studio,
      Nama_Studio: schedule.Nama_Studio,
      Durasi: schedule.Durasi || "Belum tersedia",
      Harga: parseInt(schedule.Harga) || 50000
    };
    
    console.log("Selected schedule:", selectedJadwal);
    console.log("Selected studio:", selectedJadwal.Nama_Studio);
    console.log("Ticket price:", selectedJadwal.Harga);
    
    // Save to localStorage
    localStorage.setItem("selectedJadwal", JSON.stringify(selectedJadwal));
    
    // Navigate to seat selection
    navigate("/seat-selection", { state: { selectedJadwal } });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    return timeString;
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="loading-spinner"></div>
        <p>Memuat jadwal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <p>{error}</p>
        <button onClick={fetchSchedules} className="retry-btn">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <h2>Pilih Jadwal Tayang</h2>
      
      {/* Date Selection */}
      {availableDates.length > 0 && (
        <div className="date-selection">
          <h3>Pilih Tanggal</h3>
          <div className="date-buttons">
            {availableDates.map((date, index) => {
              const dateObj = new Date(date);
              const today = new Date();
              const isToday = dateObj.toDateString() === today.toDateString();
              
              return (
                <button
                  key={index}
                  className={`date-btn ${selectedDate === date ? "active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {isToday ? "Hari Ini" : date}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="schedule-list">
        <h3>Jadwal Tayang - {selectedDate || "Belum memilih tanggal"}</h3>
        
        {Object.keys(groupedSchedules).length === 0 ? (
          <p className="no-schedule">Tidak ada jadwal untuk tanggal ini</p>
        ) : (
          // Loop setiap studio
          Object.keys(groupedSchedules).map((studioName) => (
            <div key={studioName} className="studio-section">
              <div className="studio-header">
                <h4>{studioName}</h4>
              </div>
              
              <div className="schedule-grid">
                {groupedSchedules[studioName].map((schedule) => (
                  <div key={schedule.ID_Jadwal} className="schedule-card">
                    <div className="movie-title">
                      <h4>{schedule.judul_film}</h4>
                    </div>
                    
                    <div className="schedule-details">
                      <div className="detail-item">
                        <span className="detail-label">Jam Tayang:</span>
                        <span className="detail-value">{formatTime(schedule.Jam_Mulai)} WIB</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Durasi:</span>
                        <span className="detail-value">{schedule.Durasi || "Belum tersedia"}</span>
                      </div>
                      
                      <div className="detail-item price">
                        <span className="detail-label">Harga Tiket:</span>
                        <span className="detail-value price-value">
                          Rp {formatRupiah(schedule.Harga || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSelectSchedule(schedule)}
                      className="select-seat-btn"
                    >
                      Pilih Kursi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Schedule;