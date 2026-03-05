import { useState, useEffect } from "react";
import axios from "axios";
import "../style/Admin.css";

function Admin() {

  const [Judul_Film, setJudul_Film] = useState("")
  const [DurasiJam, setDurasiJam] = useState("")
  const [DurasiMenit, setDurasiMenit] = useState("")
  const [ID_Kategori, setID_Kategori] = useState("")
  const [image, setImage] = useState(null)
  const [Director, setDirector] = useState("")
  const [Deskripsi, setDeskripsi] = useState("")
  const [Trailer_URL, setTrailer_URL] = useState("")
  const [Rating, setRating] = useState("")

  const [ID_Jadwal, setID_Jadwal] = useState("")
  const [Tanggal, setTanggal] = useState("")
  const [Jam_Mulai, setJam_Mulai] = useState("")
  const [ID_FilmJadwal, setID_FilmJadwal] = useState("")
  const [No_Studio, setNo_Studio] = useState("")

  const [kategoriList, setKategoriList] = useState([])
  const [films, setFilms] = useState([])
  const [jadwalList, setJadwalList] = useState([])
  const [studioList, setStudioList] = useState([])

  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState({
    text: "",
    type: ""
  })

  const [activeTab, setActiveTab] = useState("film")

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

  const formatDurasiToTime = (jam, menit) => {
    const jamNum = parseInt(jam) || 0
    const menitNum = parseInt(menit) || 0
    return `${jamNum.toString().padStart(2,'0')}:${menitNum.toString().padStart(2,'0')}:00`
  }

  const handleSubmitFilm = async (e) => {
    e.preventDefault()

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
        {headers:{ "Content-Type":"multipart/form-data"}}
      )

      if(res.data.error){

        setMessage({
          text:"Error : "+res.data.error,
          type:"error"
        })

      }else{

        setMessage({
          text:"Film berhasil ditambahkan",
          type:"success"
        })

        setJudul_Film("")
        setDurasiJam("")
        setDurasiMenit("")
        setImage(null)
        setID_Kategori("")
        setDirector("")
        setRating("")

        fetchFilms()

      }

    }catch(err){

      setMessage({
        text:"Gagal : "+err.message,
        type:"error"
      })

    }
  }

  const handleSubmitJadwal = async (e) => {

    e.preventDefault()

    const formData = new URLSearchParams()

    formData.append("ID_Jadwal",ID_Jadwal)
    formData.append("Tanggal",Tanggal)
    formData.append("Jam_Mulai",Jam_Mulai)
    formData.append("ID_Film",ID_FilmJadwal)
    formData.append("No_Studio",No_Studio)

    try{

      const res = await axios.post(
        "http://localhost/24SI1_PHP/tambah_jadwal.php",
        formData,
        {headers:{ "Content-Type":"application/x-www-form-urlencoded"}}
      )

      if(res.data.success){

        setMessage({
          text:"Jadwal berhasil ditambahkan",
          type:"success"
        })

        setID_Jadwal("")
        setTanggal("")
        setJam_Mulai("")
        setID_FilmJadwal("")
        setNo_Studio("")

        fetchJadwal()

      }else{

        setMessage({
          text:"Error : "+res.data.error,
          type:"error"
        })

      }

    }catch(err){

      setMessage({
        text:"Gagal : "+err.message,
        type:"error"
      })

    }
  }

  const handleDeleteFilm = async (id_film,judul_film)=>{

    if(window.confirm(`Hapus film ${judul_film}?`)){

      try{

        const res = await axios.delete(
          `http://localhost/24SI1_PHP/hapus_film.php?id=${id_film}`
        )

        if(res.data.success){

          setMessage({
            text:"Film berhasil dihapus",
            type:"success"
          })

          fetchFilms()
          fetchJadwal()

        }

      }catch(err){

        setMessage({
          text:"Gagal : "+err.message,
          type:"error"
        })

      }

    }

  }

  const handleDeleteJadwal = async (id)=>{

    if(window.confirm("Hapus jadwal ini?")){

      try{

        const res = await axios.delete(
          `http://localhost/24SI1_PHP/hapus_jadwal.php?id=${id}`
        )

        if(res.data.success){

          setMessage({
            text:"Jadwal berhasil dihapus",
            type:"success"
          })

          fetchJadwal()

        }

      }catch(err){

        setMessage({
          text:"Gagal : "+err.message,
          type:"error"
        })

      }

    }

  }

  return (

    <div className="admin-container">

      <h1 className="admin-title">Admin Dashboard</h1>

      {message.text && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">

        <button
          onClick={()=>setActiveTab("film")}
          className={activeTab==="film" ? "tab-btn active":"tab-btn"}
        >
          Kelola Film
        </button>

        <button
          onClick={()=>setActiveTab("jadwal")}
          className={activeTab==="jadwal" ? "tab-btn active":"tab-btn"}
        >
          Kelola Jadwal
        </button>

      </div>

      {activeTab==="film" && (

        <div>

          <h2>Tambah Film</h2>

          <form onSubmit={handleSubmitFilm} className="admin-form">

            <div className="form-grid">

              <input type="text" placeholder="Judul Film"
              value={Judul_Film}
              onChange={(e)=>setJudul_Film(e.target.value)}
              required/>

              <div className="durasi-group">

                <input type="number" placeholder="Jam"
                value={DurasiJam}
                onChange={(e)=>setDurasiJam(e.target.value)}
                required/>

                <input type="number" placeholder="Menit"
                value={DurasiMenit}
                onChange={(e)=>setDurasiMenit(e.target.value)}
                required/>

              </div>

              <select value={ID_Kategori}
              onChange={(e)=>setID_Kategori(e.target.value)}
              required>

                <option value="">Pilih Kategori</option>

                {kategoriList.map(k=>(
                  <option key={k.ID_Kategori} value={k.ID_Kategori}>
                    {k.Nama_Kategori}
                  </option>
                ))}

              </select>

              <input type="file"
              onChange={(e)=>setImage(e.target.files[0])}
              required/>

              <input type="text"
              placeholder="Director"
              value={Director}
              onChange={(e)=>setDirector(e.target.value)}
              required/>

              <input type="number"
              placeholder="Rating"
              value={Rating}
              onChange={(e)=>setRating(e.target.value)}
              required/>

              <textarea
              placeholder="Deskripsi"
              value={Deskripsi}
              onChange={(e)=>setDeskripsi(e.target.value)}
              required/>

              <input
              type="url"
              placeholder="Trailer URL"
              value={Trailer_URL}
              onChange={(e)=>setTrailer_URL(e.target.value)}
              required/>

              <button type="submit" className="btn-success">
                Tambah Film
              </button>

            </div>

          </form>

          <h3>Daftar Film</h3>

          <table className="admin-table">

            <thead>
              <tr className="table-header">
                <th>ID</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Director</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {films.map(film=>(
                <tr key={film.ID_Film}>

                  <td>{film.ID_Film}</td>
                  <td>{film.Judul_Film}</td>
                  <td>{film.Nama_Kategori}</td>
                  <td>{film.Director}</td>
                  <td>{film.Rating}</td>

                  <td>
                    <button
                    className="btn-delete"
                    onClick={()=>handleDeleteFilm(film.ID_Film,film.Judul_Film)}>
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

export default Admin