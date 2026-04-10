import { useState, useEffect } from "react";
import "../style/Admin.css";
import AdminUser from "./AdminUser.jsx";

function Admin() {
  const [activeTab, setActiveTab] = useState("film");
  const [films, setFilms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [studios, setStudios] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state untuk film dengan durasi terpisah
  const [filmForm, setFilmForm] = useState({
    id_film: null,
    judul: "",
    id_kategori: "",
    director: "",
    deskripsi: "",
    durasi_jam: "",
    durasi_menit: "",
    rating_usia: "",
    rating: "",
    trailer_url: "",
    gambar: null
  });

  // Form state untuk jadwal
  const [jadwalForm, setJadwalForm] = useState({
    id_jadwal: null,
    id_film: "",
    tanggal: "",
    jam_mulai: "",
    no_studio: ""
  });

  const [trailerForm, setTrailerForm] = useState({
    id_trailer: null,
    id_film: "",
    link_video: "",
    is_active: false
  });

  // ==================== HELPER FUNCTIONS ====================x
  
  const getRatingUsiaLabel = (kode) => {
    const labels = {
      'SU': 'SU',
      'P': '2+',
      'A': '7+',
      'R': '13+',
      'D': '18+',
      'BO': 'BO'
    };
    return labels[kode] || kode || '-';
  };

  const getRatingUsiaColor = (kode) => {
    const colors = {
      'SU': '#10b981',
      'P': '#3b82f6',
      'A': '#8b5cf6',
      'R': '#f59e0b',
      'D': '#ef4444',
      'BO': '#ec489a'
    };
    return colors[kode] || '#6b7280';
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
    return time;
  };

  const formatTimeForInput = (time) => {
    if (!time) return "";
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
    return time;
  };

  const convertDurationToDatabase = (jam, menit) => {
    const jamNum = parseInt(jam) || 0;
    const menitNum = parseInt(menit) || 0;
    return `${String(jamNum).padStart(2, '0')}:${String(menitNum).padStart(2, '0')}:00`;
  };

  const convertDurationFromDatabase = (duration) => {
    if (!duration) return { jam: "", menit: "" };
    const parts = duration.split(':');
    return {
      jam: parseInt(parts[0]) || "",
      menit: parseInt(parts[1]) || ""
    };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const resetFilmForm = () => {
    setFilmForm({
      id_film: null,
      judul: "",
      id_kategori: "",
      director: "",
      deskripsi: "",
      durasi_jam: "",
      durasi_menit: "",
      rating_usia: "",
      rating: "",
      trailer_url: "",
      gambar: null
    });
    setIsEditing(false);
    const fileInput = document.querySelector('input[name="gambar"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // ==================== FETCH FUNCTIONS ====================
  
  const fetchKategori = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getKategori.php");
      const data = await response.json();
      setKategori(data);
    } catch (error) {
      console.error("Error fetching kategori:", error);
      showMessage("error", "Gagal mengambil data kategori");
    }
  };

  const fetchFilms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/Bioskop.php");
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error("Error fetching films:", error);
      showMessage("error", "Gagal mengambil data film");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudios = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getStudio.php");
      const data = await response.json();
      setStudios(data);
    } catch (error) {
      console.error("Error fetching studios:", error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/jadwal.php?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedData = data.map(schedule => ({
          ...schedule,
          Jam_Mulai: formatTimeForDisplay(schedule.Jam_Mulai)
        }));
        setSchedules(formattedData);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      showMessage("error", "Gagal mengambil data jadwal: " + error.message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailers = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getTrailer.php");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTrailers(data);
      } else if (data.error) {
        console.error("Error from server:", data.error);
        showMessage("error", data.error);
        setTrailers([]);
      } else {
        setTrailers([]);
      }
    } catch (error) {
      console.error("Error fetching trailers:", error);
      showMessage("error", "Gagal mengambil data trailer: " + error.message);
      setTrailers([]);
    }
  };

  // ==================== FILM HANDLERS ====================
  
  const handleFilmChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "gambar") {
      setFilmForm({ ...filmForm, gambar: files[0] });
    } else {
      setFilmForm({ ...filmForm, [name]: value });
    }
  };

  const handleFilmSubmit = async (e) => {
    e.preventDefault();
    
    if (!filmForm.judul || !filmForm.id_kategori || !filmForm.director || !filmForm.deskripsi) {
      showMessage("error", "Semua field harus diisi!");
      return;
    }
  
    if ((!filmForm.durasi_jam || filmForm.durasi_jam === "") && (!filmForm.durasi_menit || filmForm.durasi_menit === "")) {
      showMessage("error", "Durasi harus diisi!");
      return;
    }
    
    if (!filmForm.rating_usia) {
      showMessage("error", "Klasifikasi usia harus dipilih!");
      return;
    }
  
    if (!filmForm.gambar && !filmForm.id_film) {
      showMessage("error", "Gambar harus diupload!");
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append("Judul_Film", filmForm.judul);
    formData.append("ID_Kategori", filmForm.id_kategori);
    formData.append("Director", filmForm.director);
    formData.append("Deskripsi", filmForm.deskripsi);
    
    const durationFormatted = convertDurationToDatabase(filmForm.durasi_jam, filmForm.durasi_menit);
    formData.append("Durasi", durationFormatted);
    
    formData.append("Rating_Usia", filmForm.rating_usia);
    formData.append("Rating", filmForm.rating || "0");
    formData.append("Trailer_URL", filmForm.trailer_url || "");
    
    if (filmForm.gambar) {
      formData.append("image", filmForm.gambar);
    }
  
    try {
      let response;
      let result;
  
      if (filmForm.id_film) {
        formData.append("ID_Film", filmForm.id_film);
        response = await fetch("http://localhost/Web_Bioskop/API_PHP/update_film.php", {
          method: "POST",
          body: formData
        });
      } else {
        response = await fetch("http://localhost/Web_Bioskop/API_PHP/tambah_film.php", {
          method: "POST",
          body: formData
        });
      }
      
      result = await response.json();
      
      if (result.success || result.message) {
        showMessage("success", filmForm.id_film ? "Film berhasil diupdate!" : "Film berhasil ditambahkan!");
        await fetchFilms();
        resetFilmForm();
      } else {
        showMessage("error", result.error || "Gagal menyimpan film");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFilm = (film) => {
    const { jam, menit } = convertDurationFromDatabase(film.Durasi);
    setFilmForm({
      id_film: film.ID_Film,
      judul: film.Judul_Film,
      id_kategori: film.ID_Kategori?.toString() || "",
      director: film.Director || "",
      deskripsi: film.Deskripsi || "",
      durasi_jam: jam,
      durasi_menit: menit,
      rating_usia: film.Rating_Usia || "",
      rating: film.Rating?.toString() || "",
      trailer_url: film.Trailer_URL || "",
      gambar: null
    });
    setIsEditing(true);
    setActiveTab("film");
  };

  const handleDeleteFilm = async (id) => {
    if (window.confirm("Yakin ingin menghapus film ini?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_film.php?id=${id}&confirm=1`);
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Film berhasil dihapus!");
          await fetchFilms();
          await fetchSchedules();
        } else {
          showMessage("error", result.error || "Gagal menghapus film");
        }
      } catch (error) {
        console.error("Error:", error);
        showMessage("error", "Terjadi kesalahan server");
      } finally {
        setLoading(false);
      }
    }
  };

  // ==================== JADWAL HANDLERS ====================
  
  const handleJadwalChange = (e) => {
    const { name, value } = e.target;
    setJadwalForm({ ...jadwalForm, [name]: value });
  };

  const handleJadwalSubmit = async (e) => {
    e.preventDefault();
    
    if (!jadwalForm.id_film || !jadwalForm.tanggal || !jadwalForm.jam_mulai || !jadwalForm.no_studio) {
      showMessage("error", "Semua field harus diisi!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    
    if (jadwalForm.id_jadwal) {
      formData.append("ID_Jadwal", jadwalForm.id_jadwal);
    }
    
    formData.append("ID_Film", jadwalForm.id_film);
    formData.append("Tanggal", jadwalForm.tanggal);
    
    let jamMulai = jadwalForm.jam_mulai;
    if (jamMulai && jamMulai.length === 5) {
      jamMulai = `${jamMulai}:00`;
    }
    formData.append("Jam_Mulai", jamMulai);
    formData.append("No_Studio", jadwalForm.no_studio);

    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/save_jadwal.php", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showMessage("success", jadwalForm.id_jadwal ? "Jadwal berhasil diupdate!" : "Jadwal berhasil ditambahkan!");
        await fetchSchedules();
        
        setJadwalForm({
          id_jadwal: null,
          id_film: "",
          tanggal: "",
          jam_mulai: "",
          no_studio: ""
        });
      } else {
        showMessage("error", result.error || "Gagal menyimpan jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJadwal = (jadwal) => {
    setJadwalForm({
      id_jadwal: jadwal.ID_Jadwal,
      id_film: jadwal.ID_Film?.toString() || "",
      tanggal: jadwal.Tanggal || "",
      jam_mulai: formatTimeForInput(jadwal.Jam_Mulai),
      no_studio: jadwal.No_Studio?.toString() || ""
    });
    setActiveTab("jadwal");
  };

  const handleDeleteJadwal = async (id) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_jadwal.php?id=${id}&t=${timestamp}`);
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Jadwal berhasil dihapus!");
          await fetchSchedules();
        } else {
          showMessage("error", result.error || "Gagal menghapus jadwal");
        }
      } catch (error) {
        console.error("Error:", error);
        showMessage("error", "Terjadi kesalahan server");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAllSchedules = async () => {
    const isConfirmed = window.confirm(
      "⚠️ PERINGATAN! ⚠️\n\n" +
      "Anda akan menghapus SEMUA jadwal yang ada.\n" +
      "Termasuk semua data tiket yang terkait.\n\n" +
      "TINDAKAN INI TIDAK DAPAT DIBATALKAN!\n\n" +
      "Apakah Anda yakin ingin melanjutkan?"
    );
    
    if (!isConfirmed) return;
    
    const confirmationText = window.prompt(
      "KONFIRMASI AKHIR:\n\n" +
      "Ketik 'HAPUS' untuk mengkonfirmasi penghapusan semua jadwal."
    );
    
    if (confirmationText === null) {
      showMessage("error", "Penghapusan dibatalkan.");
      return;
    }
    
    if (confirmationText !== "HAPUS") {
      showMessage("error", "Penghapusan dibatalkan. Kode konfirmasi salah.");
      return;
    }
    
    setLoading(true);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_semua_jadwal.php?t=${timestamp}`);
      const result = await response.json();
      
      if (result.success) {
        showMessage("success", `Berhasil menghapus ${result.jumlah} jadwal beserta tiketnya!`);
        await fetchSchedules();
      } else {
        showMessage("error", result.error || "Gagal menghapus semua jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TRAILER HANDLERS ====================
  
  const handleTrailerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTrailerForm({
      ...trailerForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTrailerSubmit = async (e) => {
    e.preventDefault();
    
    if (!trailerForm.id_film || !trailerForm.link_video) {
      showMessage("error", "Pilih film dan isi URL video!");
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    if (trailerForm.id_trailer) {
      formData.append("id_trailer", trailerForm.id_trailer);
    }
    formData.append("id_film", trailerForm.id_film);
    formData.append("link_video", trailerForm.link_video);
    formData.append("is_active", trailerForm.is_active);
  
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/saveTrailer.php", {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
  
      if (result.success) {
        showMessage("success", trailerForm.id_trailer ? "Trailer berhasil diupdate!" : "Trailer berhasil ditambahkan!");
        await fetchTrailers();
        
        setTrailerForm({
          id_trailer: null,
          id_film: "",
          link_video: "",
          is_active: false
        });
      } else {
        showMessage("error", result.error || "Gagal menyimpan trailer");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditTrailer = (trailer) => {
    setTrailerForm({
      id_trailer: trailer.ID_Trailer,
      id_film: trailer.ID_Film?.toString() || "",
      link_video: trailer.Link_Video,
      is_active: trailer.is_Active == 1
    });
    setActiveTab("trailer");
  };
  
  const handleDeleteTrailer = async (id) => {
    if (window.confirm("Yakin ingin menghapus trailer ini?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapusTrailer.php?id=${id}`);
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Trailer berhasil dihapus!");
          await fetchTrailers();
        } else {
          showMessage("error", result.error || "Gagal menghapus trailer");
        }
      } catch (error) {
        console.error("Error deleting trailer:", error);
        showMessage("error", "Terjadi kesalahan server: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    fetchKategori();
    fetchFilms();
    fetchSchedules();
    fetchStudios();
    fetchTrailers();
  }, []);

  // ==================== RENDER ====================
  
  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {message.text && (
        <div className={`message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* ==================== TAB NAVIGATION ==================== */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'film' ? 'active' : ''}
          onClick={() => setActiveTab('film')}
        >
          Kelola Film
        </button>
        <button 
          className={activeTab === 'jadwal' ? 'active' : ''}
          onClick={() => setActiveTab('jadwal')}
        >
          Kelola Jadwal
        </button>
        <button 
          className={activeTab === 'trailer' ? 'active' : ''}
          onClick={() => setActiveTab('trailer')}
        >
          Kelola Trailer
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Kelola Pengguna
        </button>
      </div>

      {/* ==================== KONTEN FILM ==================== */}
      {activeTab === 'film' && (
        <>
          <form onSubmit={handleFilmSubmit} className="admin-form" encType="multipart/form-data">
            <h3>{isEditing ? "Edit Film" : "Tambah Film Baru"}</h3>
            
            <input
              type="text"
              name="judul"
              placeholder="Judul Film"
              value={filmForm.judul}
              onChange={handleFilmChange}
              required
            />

            <select
              name="id_kategori"
              value={filmForm.id_kategori}
              onChange={handleFilmChange}
              required
            >
              <option value="">Pilih Kategori</option>
              {kategori.map(kat => (
                <option key={kat.ID_Kategori} value={kat.ID_Kategori}>
                  {kat.Nama_Kategori}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="director"
              placeholder="Director (pisahkan dengan koma jika lebih dari satu)"
              value={filmForm.director}
              onChange={handleFilmChange}
              required
            />

            <textarea
              name="deskripsi"
              placeholder="Deskripsi Film"
              value={filmForm.deskripsi}
              onChange={handleFilmChange}
              required
              rows="4"
            ></textarea>

            {/* Durasi input terpisah */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="number"
                name="durasi_jam"
                placeholder="Jam"
                value={filmForm.durasi_jam}
                onChange={handleFilmChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                min="0"
              />
              <input
                type="number"
                name="durasi_menit"
                placeholder="Menit"
                value={filmForm.durasi_menit}
                onChange={handleFilmChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                min="0"
                max="59"
              />
            </div>

            {/* Rating Usia */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Klasifikasi Usia <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="rating_usia"
                value={filmForm.rating_usia}
                onChange={handleFilmChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
              >
                <option value="">Pilih Klasifikasi Usia</option>
                <option value="SU">SU - Semua Umur</option>
                <option value="P">P - Pra Sekolah (2-6 tahun)</option>
                <option value="A">A - Anak-anak (7-12 tahun)</option>
                <option value="R">R - Remaja (13-17 tahun)</option>
                <option value="D">D - Dewasa (18+ tahun)</option>
                <option value="BO">BO - Bimbingan Orang Tua</option>
              </select>
              <small style={{ fontSize: "12px", color: "#666", marginTop: "5px", display: "block" }}>
                💡 Klasifikasi usia menentukan siapa saja yang boleh menonton film ini
              </small>
            </div>

            {/* Rating */}
            <input
              type="number"
              name="rating"
              placeholder="Rating Film (1-10)"
              min="0"
              max="10"
              step="0.1"
              value={filmForm.rating}
              onChange={handleFilmChange}
              style={{ marginBottom: "15px", width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
            />

            {/* URL Trailer */}
            <input
              type="url"
              name="trailer_url"
              placeholder="URL Trailer YouTube"
              value={filmForm.trailer_url}
              onChange={handleFilmChange}
              style={{ marginBottom: "15px", width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
            />

            {/* Upload Gambar */}
            <input
              type="file"
              name="gambar"
              accept="image/*"
              onChange={handleFilmChange}
              required={!isEditing}
              style={{ marginBottom: "15px", width: "100%", padding: "10px" }}
            />

            {isEditing && (
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>
                *Kosongkan jika tidak ingin mengubah gambar
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={loading}>
                {loading ? "Memproses..." : (isEditing ? "Update Film" : "Tambah Film")}
              </button>
              {isEditing && (
                <button type="button" onClick={resetFilmForm} style={{ backgroundColor: "#6c757d" }}>
                  Batal Edit
                </button>
              )}
            </div>
          </form>

          <div>
            <h3 style={{ margin: "20px 0 10px" }}>Daftar Film</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Director</th>
                  <th>Rating Usia</th>
                  <th>Rating</th>
                  <th>Durasi</th>
                  <th>Gambar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {films.map(film => (
                  <tr key={film.ID_Film}>
                    <td>{film.ID_Film}</td>
                    <td>{film.Judul_Film}</td>
                    <td>{film.Nama_Kategori}</td>
                    <td>{film.Director}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: getRatingUsiaColor(film.Rating_Usia),
                        color: "white"
                      }}>
                        {getRatingUsiaLabel(film.Rating_Usia)}
                      </span>
                    </td>
                    <td>{film.Rating}</td>
                    <td>{film.Durasi}</td>
                    <td>
                      {film.image && (
                        <img 
                          src={`http://localhost/Web_Bioskop/API_PHP/uploads/${film.image}`} 
                          alt={film.Judul_Film}
                          style={{ width: "50px", height: "70px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50x70?text=No+Image';
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditFilm(film)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteFilm(film.ID_Film)}
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {films.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                      Belum ada data film
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ==================== KONTEN JADWAL ==================== */}
      {activeTab === 'jadwal' && (
        <>
          <form onSubmit={handleJadwalSubmit} className="admin-form">
            <h3>{jadwalForm.id_jadwal ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h3>
            
            <select
              name="id_film"
              value={jadwalForm.id_film}
              onChange={handleJadwalChange}
              required
            >
              <option value="">Pilih Film</option>
              {films.map(film => (
                <option key={film.ID_Film} value={film.ID_Film}>
                  {film.Judul_Film} - {film.Durasi}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="tanggal"
              value={jadwalForm.tanggal}
              onChange={handleJadwalChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <input
              type="time"
              name="jam_mulai"
              value={jadwalForm.jam_mulai}
              onChange={handleJadwalChange}
              required
              step="60"
            />

            <select
              name="no_studio"
              value={jadwalForm.no_studio}
              onChange={handleJadwalChange}
              required
            >
              <option value="">Pilih Studio</option>
              {studios.map(studio => (
                <option key={studio.No_Studio} value={studio.No_Studio}>
                  {studio.Nama_Studio} - Rp {studio.Harga_Tiket?.toLocaleString()}
                </option>
              ))}
            </select>

            {jadwalForm.no_studio && (
              <div style={{ 
                padding: "10px", 
                backgroundColor: "#e3f2fd", 
                borderRadius: "5px",
                marginBottom: "15px",
                fontSize: "14px"
              }}>
                💡 Harga tiket akan otomatis mengikuti harga studio yang dipilih
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Memproses..." : (jadwalForm.id_jadwal ? "Update Jadwal" : "Tambah Jadwal")}
            </button>
          </form>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
              <h3 style={{ margin: 0 }}>Daftar Jadwal</h3>
              {schedules.length > 0 && (
                <button 
                  onClick={handleDeleteAllSchedules}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  🗑️ Hapus Semua Jadwal
                </button>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Jadwal</th>
                  <th>Film</th>
                  <th>Durasi</th>
                  <th>Tanggal</th>
                  <th>Jam Mulai</th>
                  <th>Studio</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.ID_Jadwal}>
                    <td>{schedule.ID_Jadwal}</td>
                    <td>{schedule.judul_film}</td>
                    <td>{schedule.Durasi || '-'}</td>
                    <td>{schedule.Tanggal}</td>
                    <td>{formatTimeForDisplay(schedule.Jam_Mulai)}</td>
                    <td>{schedule.Nama_Studio || `Studio ${schedule.No_Studio}`}</td>
                    <td>Rp {parseInt(schedule.Harga || 0).toLocaleString()}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditJadwal(schedule)} disabled={loading}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteJadwal(schedule.ID_Jadwal)} disabled={loading}>Hapus</button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>Belum ada data jadwal</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ==================== KONTEN TRAILER ==================== */}
      {activeTab === 'trailer' && (
        <>
          <form onSubmit={handleTrailerSubmit} className="admin-form">
            <h3>{trailerForm.id_trailer ? "Edit Trailer" : "Tambah Trailer Baru"}</h3>
            
            <select name="id_film" value={trailerForm.id_film} onChange={handleTrailerChange} required>
              <option value="">-- Pilih Film --</option>
              {films.map(film => (
                <option key={film.ID_Film} value={film.ID_Film}>
                  {film.Judul_Film} - {film.Durasi || 'Durasi?'}
                </option>
              ))}
            </select>

            <input type="url" name="link_video" placeholder="URL Trailer YouTube" value={trailerForm.link_video} onChange={handleTrailerChange} required />

            <label style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0", cursor: "pointer" }}>
              <input type="checkbox" name="is_active" checked={trailerForm.is_active} onChange={handleTrailerChange} />
              <span>Set sebagai Trailer Aktif (akan ditampilkan di Jumbotron)</span>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Memproses..." : (trailerForm.id_trailer ? "Update Trailer" : "Tambah Trailer")}
            </button>
          </form>

          <div>
            <h3 style={{ margin: "20px 0 10px" }}>Daftar Trailer</h3>
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Judul Film</th><th>Genre</th><th>Deskripsi</th><th>Rating Usia</th><th>Durasi</th><th>Status</th><th>Preview</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {trailers.map(trailer => (
                  <tr key={trailer.ID_Trailer} style={trailer.is_Active == 1 ? { backgroundColor: "#e8f5e9" } : {}}>
                    <td>{trailer.ID_Trailer}</td>
                    <td>{trailer.Judul_Film}</td>
                    <td>{trailer.Genre || '-'}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {trailer.Deskripsi ? trailer.Deskripsi.substring(0, 50) + '...' : '-'}
                    </td>
                    <td>{trailer.Rating_Usia || '-'}</td>
                    <td>{trailer.Durasi || '-'}</td>
                    <td>{trailer.is_Active == 1 ? <span style={{ color: "green", fontWeight: "bold" }}>✓ Aktif</span> : <span style={{ color: "gray" }}>Tidak Aktif</span>}</td>
                    <td>{trailer.Embed_URL && <iframe width="100" height="56" src={trailer.Embed_URL} title={trailer.Judul_Film} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditTrailer(trailer)} disabled={loading}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteTrailer(trailer.ID_Trailer)} disabled={loading}>Hapus</button>
                    </td>
                  </tr>
                ))}
                {trailers.length === 0 && !loading && (
                  <tr><td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>Belum ada data trailer</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ==================== KONTEN PENGGUNA ==================== */}
      {activeTab === 'users' && <AdminUser />}
    </div>
  );
}

export default Admin;