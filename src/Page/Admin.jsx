import { useState, useEffect } from "react";
import "../style/Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("film");
  const [films, setFilms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  
  // Form state untuk film (sesuai dengan struktur database)
  const [filmForm, setFilmForm] = useState({
    id_film: null,
    judul: "",
    id_kategori: "",
    director: "",
    deskripsi: "",
    durasi: "", // format: "2 jam 30 menit"
    rating: "",
    trailer_url: "",
    gambar: null
  });

  // Form state untuk jadwal (sesuai dengan struktur database)
  const [jadwalForm, setJadwalForm] = useState({
    id_jadwal: null,
    id_film: "",
    tanggal: "",
    jam_mulai: "",
    no_studio: "",
    harga: ""
  });

  // Fetch data kategori
  const fetchKategori = async () => {
    try {
      // Gunakan file yang sudah ada: getKategori.php (bukan kategori.php)
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getKategori.php");
      const data = await response.json();
      setKategori(data);
    } catch (error) {
      console.error("Error fetching kategori:", error);
      showMessage("error", "Gagal mengambil data kategori");
    }
  };

  // Fetch data film dari database
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

  // Fetch data jadwal dari database
  const fetchSchedules = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/jadwal.php");
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      showMessage("error", "Gagal mengambil data jadwal");
    }
  };

  // Load data saat komponen dimount
  useEffect(() => {
    fetchKategori();
    fetchFilms();
    fetchSchedules();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Handler untuk form film
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
    
    // Validasi
    if (!filmForm.judul || !filmForm.id_kategori || !filmForm.director || !filmForm.deskripsi || !filmForm.durasi) {
      showMessage("error", "Semua field harus diisi!");
      return;
    }

    if (!filmForm.gambar && !filmForm.id_film) {
      showMessage("error", "Gambar harus diupload!");
      return;
    }

    setLoading(true);

    // Buat FormData untuk upload file
    const formData = new FormData();
    formData.append("Judul_Film", filmForm.judul);
    formData.append("ID_Kategori", filmForm.id_kategori);
    formData.append("Director", filmForm.director);
    formData.append("Deskripsi", filmForm.deskripsi);
    formData.append("Durasi", filmForm.durasi);
    formData.append("Rating", filmForm.rating || "0");
    formData.append("Trailer_URL", filmForm.trailer_url || "");
    
    if (filmForm.gambar) {
      formData.append("image", filmForm.gambar);
    }

    try {
      let response;
      let result;

      if (filmForm.id_film) {
        // Update film (PERLU MEMBUAT FILE update_film.php)
        formData.append("ID_Film", filmForm.id_film);
        response = await fetch("http://localhost/Web_Bioskop/API_PHP/update_film.php", {
          method: "POST",
          body: formData
        });
      } else {
        // Tambah film baru
        response = await fetch("http://localhost/Web_Bioskop/API_PHP/tambah_film.php", {
          method: "POST",
          body: formData
        });
      }
      
      result = await response.json();
      
      if (result.message || result.success) {
        showMessage("success", filmForm.id_film ? "Film berhasil diupdate!" : "Film berhasil ditambahkan!");
        await fetchFilms(); // Refresh data film
        
        // Reset form
        setFilmForm({
          id_film: null,
          judul: "",
          id_kategori: "",
          director: "",
          deskripsi: "",
          durasi: "",
          rating: "",
          trailer_url: "",
          gambar: null
        });
        
        // Reset file input
        document.querySelector('input[name="gambar"]').value = '';
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

  // Handler untuk form jadwal
  const handleJadwalChange = (e) => {
    const { name, value } = e.target;
    setJadwalForm({ ...jadwalForm, [name]: value });
  };

  const handleJadwalSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!jadwalForm.id_film || !jadwalForm.tanggal || !jadwalForm.jam_mulai || !jadwalForm.no_studio || !jadwalForm.harga) {
      showMessage("error", "Semua field harus diisi!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    
    if (jadwalForm.id_jadwal) {
      // Update jadwal
      formData.append("ID_Jadwal", jadwalForm.id_jadwal);
    } else {
      // Generate ID Jadwal unik (contoh: JDWL001, JDWL002, dst)
      const newId = `JDWL${String(schedules.length + 1).padStart(3, '0')}`;
      formData.append("ID_Jadwal", newId);
    }
    
    formData.append("ID_Film", jadwalForm.id_film);
    formData.append("Tanggal", jadwalForm.tanggal);
    formData.append("Jam_Mulai", jadwalForm.jam_mulai);
    formData.append("No_Studio", jadwalForm.no_studio);

    try {
      const url = "http://localhost/Web_Bioskop/API_PHP/tambah_jadwal.php"; // File yang sudah Anda buat

      const response = await fetch(url, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showMessage("success", jadwalForm.id_jadwal ? "Jadwal berhasil diupdate!" : "Jadwal berhasil ditambahkan!");
        await fetchSchedules(); // Refresh data jadwal
        
        // Reset form
        setJadwalForm({
          id_jadwal: null,
          id_film: "",
          tanggal: "",
          jam_mulai: "",
          no_studio: "",
          harga: ""
        });
      } else {
        showMessage("error", result.error || "Gagal menyimpan jadwal");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk delete film
  const handleDeleteFilm = async (id) => {
    if (window.confirm("Yakin ingin menghapus film ini?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_film.php?id=${id}&confirm=1`);
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Film berhasil dihapus!");
          await fetchFilms(); // Refresh data film
          await fetchSchedules(); // Refresh data jadwal
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

  // Handler untuk delete jadwal
  const handleDeleteJadwal = async (id) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_jadwal.php?id=${id}`);
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Jadwal berhasil dihapus!");
          await fetchSchedules(); // Refresh data jadwal
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

  // Handler untuk edit film
  const handleEditFilm = (film) => {
    setFilmForm({
      id_film: film.ID_Film,
      judul: film.Judul_Film,
      id_kategori: film.ID_Kategori?.toString() || "",
      director: film.Director || "",
      deskripsi: film.Deskripsi || "",
      durasi: film.Durasi || "",
      rating: film.Rating?.toString() || "",
      trailer_url: film.Trailer_URL || "",
      gambar: null
    });
    setActiveTab("film");
  };

  // Handler untuk edit jadwal
  const handleEditJadwal = (jadwal) => {
    setJadwalForm({
      id_jadwal: jadwal.ID_Jadwal,
      id_film: jadwal.ID_Film?.toString() || "",
      tanggal: jadwal.Tanggal || "",
      jam_mulai: jadwal.Jam_Mulai || "",
      no_studio: jadwal.No_Studio?.toString() || "",
      harga: jadwal.Harga?.toString() || ""
    });
    setActiveTab("jadwal");
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Message Notifications */}
      {message.text && (
        <div className={`message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
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
      </div>

      {/* Form Film */}
      {activeTab === 'film' && (
        <form onSubmit={handleFilmSubmit} className="admin-form" encType="multipart/form-data">
          <h3>{filmForm.id_film ? "Edit Film" : "Tambah Film Baru"}</h3>
          
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
            placeholder="Director"
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

          <input
            type="text"
            name="durasi"
            placeholder="Durasi (contoh: 2 jam 30 menit)"
            value={filmForm.durasi}
            onChange={handleFilmChange}
            required
          />

          <input
            type="number"
            name="rating"
            placeholder="Rating (1-10)"
            min="0"
            max="10"
            step="0.1"
            value={filmForm.rating}
            onChange={handleFilmChange}
          />

          <input
            type="url"
            name="trailer_url"
            placeholder="URL Trailer YouTube"
            value={filmForm.trailer_url}
            onChange={handleFilmChange}
          />

          <input
            type="file"
            name="gambar"
            accept="image/*"
            onChange={handleFilmChange}
            required={!filmForm.id_film}
          />

          {filmForm.id_film && (
            <p style={{ fontSize: "12px", color: "#666" }}>
              *Kosongkan jika tidak ingin mengubah gambar
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : (filmForm.id_film ? "Update Film" : "Tambah Film")}
          </button>
        </form>
      )}

      {/* Form Jadwal */}
      {activeTab === 'jadwal' && (
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
                {film.Judul_Film}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="tanggal"
            value={jadwalForm.tanggal}
            onChange={handleJadwalChange}
            required
          />

          <input
            type="time"
            name="jam_mulai"
            value={jadwalForm.jam_mulai}
            onChange={handleJadwalChange}
            required
          />

          <select
            name="no_studio"
            value={jadwalForm.no_studio}
            onChange={handleJadwalChange}
            required
          >
            <option value="">Pilih Studio</option>
            <option value="1">Studio 1</option>
            <option value="2">Studio 2</option>
            <option value="3">Studio 3</option>
            <option value="4">Studio 4</option>
            <option value="5">Studio 5</option>
            <option value="6">Studio 6</option>
            <option value="7">Studio 7</option>
            <option value="8">Studio 8</option>
            <option value="9">Studio 9</option>
            <option value="10">Studio 10</option>
          </select>

          <input
            type="number"
            name="harga"
            placeholder="Harga Tiket"
            min="0"
            step="1000"
            value={jadwalForm.harga}
            onChange={handleJadwalChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : (jadwalForm.id_jadwal ? "Update Jadwal" : "Tambah Jadwal")}
          </button>
        </form>
      )}

      {/* Tabel Film */}
      {activeTab === 'film' && (
        <div>
          <h3 style={{ margin: "20px 0 10px" }}>Daftar Film</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Director</th>
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
                  <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                    Belum ada data film
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabel Jadwal */}
      {activeTab === 'jadwal' && (
        <div>
          <h3 style={{ margin: "20px 0 10px" }}>Daftar Jadwal</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Jadwal</th>
                <th>Film</th>
                <th>Tanggal</th>
                <th>Jam Mulai</th>
                <th>Studio</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.ID_Jadwal}>
                  <td>{schedule.ID_Jadwal}</td>
                  <td>{schedule.judul_film}</td>
                  <td>{schedule.Tanggal}</td>
                  <td>{schedule.Jam_Mulai}</td>
                  <td>Studio {schedule.No_Studio}</td>
                  <td>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditJadwal(schedule)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteJadwal(schedule.ID_Jadwal)}
                      disabled={loading}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    Belum ada data jadwal
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;