import { useState, useEffect } from "react"
import axios from "axios"

function Admin() {
  // ========== STATE UNTUK FORM FILM ==========
  const [Judul_Film, setJudul_Film] = useState("")
  const [DurasiJam, setDurasiJam] = useState("")
  const [DurasiMenit, setDurasiMenit] = useState("")
  const [ID_Kategori, setID_Kategori] = useState("")
  const [image, setImage] = useState(null)
  const [Director, setDirector] = useState("")
  const [Deskripsi, setDeskripsi] = useState("")
  const [Trailer_URL, setTrailer_URL] = useState("") 
  const [Rating, setRating] = useState("")
  
  // ========== STATE UNTUK FORM JADWAL ==========
  const [ID_Jadwal, setID_Jadwal] = useState("")
  const [Tanggal, setTanggal] = useState("")
  const [Jam_Mulai, setJam_Mulai] = useState("")
  const [ID_FilmJadwal, setID_FilmJadwal] = useState("")
  const [No_Studio, setNo_Studio] = useState("")
  
  // ========== STATE UMUM ==========
  const [kategoriList, setKategoriList] = useState([])
  const [films, setFilms] = useState([])
  const [jadwalList, setJadwalList] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [activeTab, setActiveTab] = useState("film") // 'film' atau 'jadwal'
  const [studioList, setStudioList] = useState([])

  // ========== AMBIL DATA ==========
  useEffect(() => {
    fetchKategori()
    fetchFilms()
    fetchJadwal()
    fetchStudio()
  }, [])

  const fetchKategori = () => {
    axios.get("http://localhost/24SI1_PHP/getKategori.php")
      .then(res => setKategoriList(res.data))
      .catch(err => console.log(err))
  }

  const fetchFilms = () => {
    axios.get("http://localhost/24SI1_PHP/bioskop.php")
      .then(res => {
        setFilms(res.data)
        setLoading(false)
      })
      .catch(err => console.log(err))
  }

  const fetchJadwal = () => {
    axios.get("http://localhost/24SI1_PHP/getJadwal.php")
      .then(res => setJadwalList(res.data))
      .catch(err => console.log(err))
  }
  const fetchStudio = () => {
    axios.get("http://localhost/24SI1_PHP/getStudio.php")
      .then(res => setStudioList(res.data))
      .catch(err => console.log(err))
  }

  // ========== FUNGSI KONVERSI DURASI ==========
  const formatDurasiToTime = (jam, menit) => {
    const jamNum = parseInt(jam) || 0
    const menitNum = parseInt(menit) || 0
    return `${jamNum.toString().padStart(2, '0')}:${menitNum.toString().padStart(2, '0')}:00`
  }

  // ========== FUNGSI TAMBAH FILM ==========
  const handleSubmitFilm = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    const DurasiFormatted = formatDurasiToTime(DurasiJam, DurasiMenit)

    const formData = new FormData()
    formData.append("Judul_Film", Judul_Film)
    formData.append("Durasi", DurasiFormatted)
    formData.append("ID_Kategori", ID_Kategori)
    formData.append("Director", Director)
    formData.append("Deskripsi", Deskripsi)
    formData.append("Trailer_URL", Trailer_URL)
    formData.append("Rating", Rating)
    formData.append("image", image)

    try {
      const res = await axios.post(
        "http://localhost/24SI1_PHP/upload_film.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      
      if (res.data.error) {
        setMessage({ text: "Error: " + res.data.error, type: "error" })
      } else {
        setMessage({ text: "Film berhasil ditambahkan!", type: "success" })
        
        // Reset form film
        setJudul_Film("")
        setDurasiJam("")
        setDurasiMenit("")
        setImage(null)
        setID_Kategori("")
        setDirector("")
        setRating("")
        document.querySelector('input[type="file"]').value = ""
        
        fetchFilms() // Refresh daftar film
      }
    } catch (err) {
      setMessage({ text: "Gagal: " + err.message, type: "error" })
    }
  }

  // ========== FUNGSI TAMBAH JADWAL ==========
  const handleSubmitJadwal = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    const formData = new URLSearchParams()
    formData.append("ID_Jadwal", ID_Jadwal)
    formData.append("Tanggal", Tanggal)
    formData.append("Jam_Mulai", Jam_Mulai)
    formData.append("ID_Film", ID_FilmJadwal)
    formData.append("No_Studio", No_Studio)

    try {
      const res = await axios.post(
        "http://localhost/24SI1_PHP/tambah_jadwal.php",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )
      
      if (res.data.success) {
        setMessage({ text: "Jadwal berhasil ditambahkan!", type: "success" })
        setID_Jadwal("")
        setTanggal("")
        setJam_Mulai("")
        setID_FilmJadwal("")
        setNo_Studio("")
        fetchJadwal() // Refresh daftar jadwal
      } else {
        setMessage({ text: "Error: " + res.data.error, type: "error" })
      }
    } catch (err) {
      setMessage({ text: "Gagal: " + err.message, type: "error" })
    }
  }

  // ========== FUNGSI HAPUS FILM ==========
  const handleDeleteFilm = async (id_film, judul_film) => {
    if (window.confirm(`Yakin ingin menghapus film "${judul_film}"?`)) {
      try {
        const res = await axios.delete(
          `http://localhost/24SI1_PHP/hapus_film.php?id=${id_film}`
        )
        
        if (res.data.success) {
          setMessage({ text: "Film berhasil dihapus!", type: "success" })
          fetchFilms()
          fetchJadwal() // Refresh jadwal juga karena mungkin terpengaruh
        } else {
          setMessage({ text: "Gagal: " + res.data.error, type: "error" })
        }
      } catch (err) {
        setMessage({ text: "Gagal: " + err.message, type: "error" })
      }
    }
  }

  // ========== FUNGSI HAPUS JADWAL ==========
  const handleDeleteJadwal = async (id_jadwal) => {
    if (window.confirm(`Yakin ingin menghapus jadwal ${id_jadwal}?`)) {
      try {
        const res = await axios.delete(
          `http://localhost/24SI1_PHP/hapus_jadwal.php?id=${id_jadwal}`
        )
        
        if (res.data.success) {
          setMessage({ text: "Jadwal berhasil dihapus!", type: "success" })
          fetchJadwal()
        } else {
          setMessage({ text: "Gagal: " + res.data.error, type: "error" })
        }
      } catch (err) {
        setMessage({ text: "Gagal: " + err.message, type: "error" })
      }
    }
  }

  return (
    <div className="admin-container" style={{ maxWidth: "1000px", margin: "20px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>
      
      {/* PESAN NOTIFIKASI */}
      {message.text && (
        <div style={{
          padding: "10px",
          backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
          color: message.type === "success" ? "#155724" : "#721c24",
          border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {message.text}
        </div>
      )}

      {/* TAB NAVIGASI */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #ddd", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("film")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "film" ? "#007bff" : "#f8f9fa",
            color: activeTab === "film" ? "white" : "black",
            border: "1px solid #dee2e6",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer"
          }}
        >
          Kelola Film
        </button>
        <button
          onClick={() => setActiveTab("jadwal")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "jadwal" ? "#007bff" : "#f8f9fa",
            color: activeTab === "jadwal" ? "white" : "black",
            border: "1px solid #dee2e6",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer"
          }}
        >
          Kelola Jadwal
        </button>
      </div>

      {/* TAB FILM */}
      {activeTab === "film" && (
        <div>
          <h2>Tambah Film Baru</h2>
          <form onSubmit={handleSubmitFilm} encType="multipart/form-data" style={{ marginBottom: "30px" }}>
            <div style={{ display: "grid", gap: "10px" }}>
              <input type="text" placeholder="Judul Film" value={Judul_Film} onChange={(e) => setJudul_Film(e.target.value)} required />
              
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" min="0" max="5" placeholder="Jam" value={DurasiJam} onChange={(e) => setDurasiJam(e.target.value)} required style={{ flex: 1 }} />
                <input type="number" min="0" max="59" placeholder="Menit" value={DurasiMenit} onChange={(e) => setDurasiMenit(e.target.value)} required style={{ flex: 1 }} />
              </div>

              <select value={ID_Kategori} onChange={(e) => setID_Kategori(e.target.value)} required>
                <option value="">Pilih Kategori</option>
                {kategoriList.map(k => <option key={k.ID_Kategori} value={k.ID_Kategori}>{k.Nama_Kategori}</option>)}
              </select>

              <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setImage(e.target.files[0])} required />
              <input type="text" placeholder="Director" value={Director} onChange={(e) => setDirector(e.target.value)} required />
              <input type="number" step="0.1" min="0" max="10" placeholder="Rating" value={Rating} onChange={(e) => setRating(e.target.value)} required />

              <textarea
                placeholder="Deskripsi Film"
                value={Deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows="4"
                style={{ padding: "10px", fontSize: "16px", fontFamily: "inherit" }}
                required
            />

            <input
                type="url"
                placeholder="URL Trailer (YouTube)"
                value={Trailer_URL}
                onChange={(e) => setTrailer_URL(e.target.value)}
                style={{ padding: "10px", fontSize: "16px" }}
                required
            />
              
              <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" }}>
                Tambah Film
              </button>
            </div>
          </form>

          <h3>Daftar Film</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Judul</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Kategori</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Director</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Rating</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {films.map(film => (
                <tr key={film.ID_Film}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{film.ID_Film}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{film.Judul_Film}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{film.Nama_Kategori || film.ID_Kategori}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{film.Director}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{film.Rating}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <button onClick={() => handleDeleteFilm(film.ID_Film, film.Judul_Film)} style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB JADWAL */}
      {activeTab === "jadwal" && (
  <div>
    <h2>Tambah Jadwal Baru</h2>
    <form onSubmit={handleSubmitJadwal} style={{ marginBottom: "30px" }}>
      <div style={{ display: "grid", gap: "10px" }}>
        
        {/* ID JADWAL */}
        <input 
          type="text" 
          placeholder="ID Jadwal (contoh: JDW001)" 
          value={ID_Jadwal} 
          onChange={(e) => setID_Jadwal(e.target.value)} 
          required 
        />
        
        {/* TANGGAL */}
        <input 
          type="date" 
          value={Tanggal} 
          onChange={(e) => setTanggal(e.target.value)} 
          required 
        />
        
        <input 
          type="time" 
          value={Jam_Mulai} 
          onChange={(e) => setJam_Mulai(e.target.value)} 
          required 
        />
        
        <select value={No_Studio} onChange={(e) => setNo_Studio(e.target.value)} required>
          <option value="">Pilih Studio</option>
          {studioList.map(studio => (
            <option key={studio.No_Studio} value={studio.No_Studio}>
              {studio.Nama_Studio} (Studio {studio.No_Studio})
            </option>
          ))}
        </select>
        
        <select 
          value={ID_FilmJadwal} 
          onChange={(e) => setID_FilmJadwal(e.target.value)} 
          required
          style={{ padding: "8px" }}
        >
          <option value="">Pilih Film</option>
          {films.map(film => (
            <option key={film.ID_Film} value={film.ID_Film}>
              {film.Judul_Film} (ID: {film.ID_Film})
            </option>
          ))}
        </select>
        
        {/* TOMBOL SUBMIT */}
        <button 
          type="submit" 
          style={{ 
            padding: "10px", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "5px" 
          }}
        >
          Tambah Jadwal
        </button>
      </div>
    </form>

    {/* TABEL DAFTAR JADWAL (DENGAN STUDIO) */}
    <h3>Daftar Jadwal</h3>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID Jadwal</th>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tanggal</th>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Jam</th>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Studio</th>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Film</th>
          <th style={{ padding: "10px", border: "1px solid #ddd" }}>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {jadwalList.map(jadwal => (
          <tr key={jadwal.ID_Jadwal}>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{jadwal.ID_Jadwal}</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{jadwal.Tanggal}</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{jadwal.Jam_Mulai}</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              {jadwal.Nama_Studio || `Studio ${jadwal.No_Studio}`}
            </td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>{jadwal.Judul_Film || `ID: ${jadwal.ID_Film}`}</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              <button 
                onClick={() => handleDeleteJadwal(jadwal.ID_Jadwal)} 
                style={{ 
                  backgroundColor: "#dc3545", 
                  color: "white", 
                  border: "none", 
                  padding: "5px 10px", 
                  borderRadius: "3px", 
                  cursor: "pointer" 
                }}
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </div>
  )
}

export default Admin;