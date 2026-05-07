import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Admin.css";
import AdminUser from "./AdminUser.jsx";

function Admin() {
  const [activeTab, setActiveTab] = useState("film"); 
  const [films, setFilms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [studios, setStudios] = useState([]);
  
  // ==================== STATE UNTUK PESANAN ====================
  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchOrder, setSearchOrder] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  
  // State untuk trailer management
  const [searchFilmTerm, setSearchFilmTerm] = useState("");
  const [activeTrailerId, setActiveTrailerId] = useState(null);
  const [updatingTrailerIds, setUpdatingTrailerIds] = useState([]);
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state untuk film
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

  // ==================== HELPER FUNCTIONS ====================
  
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
    let timeStr = time.toString();
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let jam = parseInt(parts[0]);
      let menit = parseInt(parts[1]);
      if (isNaN(jam)) jam = 0;
      if (isNaN(menit)) menit = 0;
      return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}`;
    }
    return timeStr;
  };
  
  const formatTimeForInput = (time) => {
    if (!time) return "";
    let timeStr = time.toString();
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let jam = parseInt(parts[0]);
      let menit = parseInt(parts[1]);
      if (isNaN(jam)) jam = 0;
      if (isNaN(menit)) menit = 0;
      return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}`;
    }
    return timeStr;
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
  
  const formatJamMulai = (jamMulai) => {
    if (!jamMulai) return "";
    const str = jamMulai.toString();
    if (str.includes(':')) {
      const parts = str.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return str;
  };

  // Status badge untuk pesanan
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Menunggu', color: '#f59e0b', bg: '#fef3c7' },
      'paid': { text: 'Dibayar', color: '#10b981', bg: '#d1fae5' },
      'cancelled': { text: 'Dibatalkan', color: '#ef4444', bg: '#fee2e2' },
      'completed': { text: 'Selesai', color: '#3b82f6', bg: '#dbeafe' }
    };
    const s = statusMap[status?.toLowerCase()] || { text: status || 'Unknown', color: '#6b7280', bg: '#f3f4f6' };
    return <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: s.bg, color: s.color }}>{s.text}</span>;
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

  const filteredFilmsForTrailer = films.filter(film => {
    const searchTerm = searchFilmTerm.toLowerCase();
    return (
      film.Judul_Film?.toLowerCase().includes(searchTerm) ||
      film.Director?.toLowerCase().includes(searchTerm) ||
      film.Nama_Kategori?.toLowerCase().includes(searchTerm)
    );
  });

  // ==================== FETCH FUNCTIONS ====================
  
  const fetchKategori = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getKategori.php", {
        credentials: "include"
      });
      const data = await response.json();
      setKategori(data);
    } catch (error) {
      console.error("Error fetching kategori:", error);
      showMessage("error", "Gagal mengambil data kategori");
    }
  };

  const fetchStudios = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getStudio.php", {
        credentials: "include"
      });
      const data = await response.json();
      setStudios(data);
    } catch (error) {
      console.error("Error fetching studios:", error);
      showMessage("error", "Gagal mengambil data studio");
    }
  };

  const fetchFilms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/Bioskop.php", {
        credentials: "include"
      });
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error("Error fetching films:", error);
      showMessage("error", "Gagal mengambil data film");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/jadwal.php?t=${timestamp}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedData = data.map(schedule => ({
          ...schedule,
          Jam_Mulai_Display: formatJamMulai(schedule.Jam_Mulai)
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

  const fetchActiveTrailer = async () => {
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getTrailer.php", {
        credentials: "include"
      });
      const data = await response.json();
      const activeTrailer = Array.isArray(data) 
        ? data.find(trailer => trailer.is_Active == 1)
        : null;
      setActiveTrailerId(activeTrailer ? activeTrailer.ID_Film : null);
    } catch (error) {
      console.error("Error fetching active trailer:", error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Tambahkan action=get
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/pesanan.php?action=get", {
        credentials: "include"
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Data pesanan:", data); // DEBUG: Lihat di console
      
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        console.error("Data bukan array:", data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showMessage("error", "Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  };

  // ==================== PESANAN HANDLERS ====================
  const handleUpdateOrderStatus = async (idTransaksi, status) => {
    if (!confirm(`Ubah status pesanan ${idTransaksi} menjadi ${status}?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/pesanan.php?action=update_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_transaksi: idTransaksi, status: status })
      });
      const result = await response.json();
      
      if (result.success) {
        showMessage("success", `Status pesanan diubah menjadi ${status}`);
        fetchOrders();
      } else {
        showMessage("error", result.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (idTransaksi) => {
    if (!confirm(`Hapus pesanan ${idTransaksi}? Tindakan ini permanen!`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/pesanan.php?action=delete&id=${idTransaksi}`, {
        credentials: "include"
      });
      const result = await response.json();
      
      if (result.success) {
        showMessage("success", "Pesanan berhasil dihapus");
        fetchOrders();
      } else {
        showMessage("error", result.error || "Gagal menghapus pesanan");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };
 // Filter pesanan berdasarkan status, search, dan tanggal
const filteredOrders = transactions.filter(order => {
  // Filter status
  if (filterStatus !== "all" && order.Status?.toLowerCase() !== filterStatus) return false;
  
  // Filter search
  if (searchOrder) {
    const searchLower = searchOrder.toLowerCase();
    const match = (
      order.ID_Transaksi?.toLowerCase().includes(searchLower) ||
      order.nama_penonton?.toLowerCase().includes(searchLower) ||
      order.judul_film?.toLowerCase().includes(searchLower)
    );
    if (!match) return false;
  }
  // Filter tanggal mulai
  if (filterDateStart) {
    const orderDate = order.Tanggal_Pemesanan?.split(' ')[0];
    if (orderDate < filterDateStart) return false;
  }
  
  // Filter tanggal akhir
  if (filterDateEnd) {
    const orderDate = order.Tanggal_Pemesanan?.split(' ')[0];
    if (orderDate > filterDateEnd) return false;
  }
  
  return true;
});

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
          credentials: "include",
          body: formData
        });
      } else {
        response = await fetch("http://localhost/Web_Bioskop/API_PHP/tambah_film.php", {
          method: "POST",
          credentials: "include",
          body: formData
        });
      }
      
      result = await response.json();
      
      if (result.success || result.message) {
        showMessage("success", filmForm.id_film ? "Film berhasil diupdate!" : "Film berhasil ditambahkan!");
        await fetchFilms();
        await fetchActiveTrailer();
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
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_film.php?id=${id}&confirm=1`, {
          credentials: "include"
        });
        const result = await response.json();
        
        if (result.success) {
          showMessage("success", "Film berhasil dihapus!");
          await fetchFilms();
          await fetchSchedules();
          await fetchActiveTrailer();
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

  // ==================== TRAILER HANDLERS ====================
  // ... (kode trailer handlers sama seperti sebelumnya)

  const handleToggleTrailerActive = async (filmId, isActive) => {
    const film = films.find(f => f.ID_Film === filmId);
    if (!film) {
      showMessage("error", "Film tidak ditemukan");
      return;
    }
    
    if (!film.Trailer_URL || film.Trailer_URL.trim() === "") {
      showMessage("error", "Film ini tidak memiliki URL trailer.");
      return;
    }

    setUpdatingTrailerIds(prev => [...prev, filmId]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/toggleTrailerActive.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id_film: filmId,
          is_active: isActive ? 1 : 0
        })
      });

      const result = await response.json();

      if (result.success) {
        setActiveTrailerId(isActive ? filmId : null);
        
        if (isActive) {
          showMessage("success", `Trailer "${film.Judul_Film}" telah diaktifkan`);
        } else {
          showMessage("success", `Trailer "${film.Judul_Film}" telah dinonaktifkan`);
        }
      } else {
        showMessage("error", result.error || "Gagal mengubah status trailer");
      }
    } catch (error) {
      console.error("Error toggling trailer:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
      setUpdatingTrailerIds(prev => prev.filter(id => id !== filmId));
    }
  };

  const handleClearActiveTrailer = async () => {
    if (!activeTrailerId) return;
    
    const isConfirmed = window.confirm(
      `⚠️ PERINGATAN!\n\nAnda akan menonaktifkan trailer yang sedang aktif.\n\nApakah Anda yakin?`
    );
    
    if (!isConfirmed) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/clearAllTrailers.php", {
        method: "POST",
        credentials: "include"
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActiveTrailerId(null);
        showMessage("success", "Trailer telah dinonaktifkan");
      } else {
        showMessage("error", result.error || "Gagal menonaktifkan trailer");
      }
    } catch (error) {
      console.error("Error clearing trailer:", error);
      showMessage("error", "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  // ==================== JADWAL HANDLERS ====================
  // ... (kode jadwal handlers sama seperti sebelumnya)

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
    if (jamMulai && jamMulai.length === 5 && jamMulai.includes(':')) {
      jamMulai = `${jamMulai}:00`;
    }
    
    formData.append("Jam_Mulai", jamMulai);
    formData.append("No_Studio", jadwalForm.no_studio);
  
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/save_jadwal.php", {
        method: "POST",
        credentials: "include",
        body: formData
      });
  
      console.log("Response status:", response.status);
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse error:", e);
        throw new Error(`Server mengirim response invalid: ${responseText.substring(0, 100)}`);
      }
  
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
      console.error("Error detail:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJadwal = (jadwal) => {
    let jamMulai = jadwal.Jam_Mulai;
    let formattedTime = "";
    
    if (jamMulai) {
      const parts = jamMulai.toString().split(':');
      if (parts.length >= 2) {
        const jam = String(parseInt(parts[0])).padStart(2, '0');
        const menit = String(parseInt(parts[1])).padStart(2, '0');
        formattedTime = `${jam}:${menit}`;
      }
    }
    
    setJadwalForm({
      id_jadwal: jadwal.ID_Jadwal,
      id_film: jadwal.ID_Film?.toString() || "",
      tanggal: jadwal.Tanggal || "",
      jam_mulai: formattedTime,
      no_studio: jadwal.No_Studio?.toString() || ""
    });
    setActiveTab("jadwal");
  };

  const handleDeleteJadwal = async (id) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_jadwal.php?id=${id}&t=${timestamp}`, {
          credentials: "include"
        });
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
        const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/hapus_semua_jadwal.php?t=${timestamp}`, {
            method: "GET",
            credentials: "include"
        });
        const result = await response.json();
        
        console.log("Delete all schedules response:", result);
        
        if (result.success) {
            showMessage("success", result.message);
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

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    fetchKategori();
    fetchFilms();
    fetchSchedules();
    fetchStudios();
    fetchActiveTrailer();
    fetchOrders(); // Ganti dari fetchTransactions
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

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        <button className={activeTab === 'film' ? 'active' : ''} onClick={() => setActiveTab('film')}>
          Kelola Film
        </button>
        <button className={activeTab === 'jadwal' ? 'active' : ''} onClick={() => setActiveTab('jadwal')}>
          Kelola Jadwal
        </button>
        <button className={activeTab === 'trailer' ? 'active' : ''} onClick={() => setActiveTab('trailer')}>
          Kelola Trailer
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Kelola Pesanan
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Kelola Pengguna
        </button>
      </div>

      {/* KONTEN FILM */}
      {activeTab === 'film' && (
        <>
          <form onSubmit={handleFilmSubmit} className="admin-form" encType="multipart/form-data">
            <h3>{isEditing ? "Edit Film" : "Tambah Film Baru"}</h3>
            
            <input type="text" name="judul" placeholder="Judul Film" value={filmForm.judul} onChange={handleFilmChange} required />
            <select name="id_kategori" value={filmForm.id_kategori} onChange={handleFilmChange} required>
              <option value="">Pilih Kategori</option>
              {kategori.map(kat => (
                <option key={kat.ID_Kategori} value={kat.ID_Kategori}>{kat.Nama_Kategori}</option>
              ))}
            </select>
            <input type="text" name="director" placeholder="Director" value={filmForm.director} onChange={handleFilmChange} required />
            <textarea name="deskripsi" placeholder="Deskripsi Film" value={filmForm.deskripsi} onChange={handleFilmChange} required rows="4"></textarea>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input type="number" name="durasi_jam" placeholder="Jam" value={filmForm.durasi_jam} onChange={handleFilmChange} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }} min="0" />
              <input type="number" name="durasi_menit" placeholder="Menit" value={filmForm.durasi_menit} onChange={handleFilmChange} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }} min="0" max="59" />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Klasifikasi Usia <span style={{ color: "red" }}>*</span></label>
              <select name="rating_usia" value={filmForm.rating_usia} onChange={handleFilmChange} required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}>
                <option value="">Pilih Klasifikasi Usia</option>
                <option value="SU">SU - Semua Umur</option>
                <option value="P">P - Pra Sekolah (2-6 tahun)</option>
                <option value="A">A - Anak-anak (7-12 tahun)</option>
                <option value="R">R - Remaja (13-17 tahun)</option>
                <option value="D">D - Dewasa (18+ tahun)</option>
                <option value="BO">BO - Bimbingan Orang Tua</option>
              </select>
            </div>
            <input type="number" name="rating" placeholder="Rating Film (1-10)" min="0" max="10" step="0.1" value={filmForm.rating} onChange={handleFilmChange} style={{ marginBottom: "15px", width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }} />
            <input type="text" name="trailer_url" placeholder="URL Trailer (YouTube)" value={filmForm.trailer_url} onChange={handleFilmChange} style={{ marginBottom: "15px", width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }} />
            <input type="file" name="gambar" accept="image/*" onChange={handleFilmChange} required={!isEditing} style={{ marginBottom: "15px", width: "100%", padding: "10px" }} />
            {isEditing && <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>*Kosongkan jika tidak ingin mengubah gambar</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={loading}>{loading ? "Memproses..." : (isEditing ? "Update Film" : "Tambah Film")}</button>
              {isEditing && <button type="button" onClick={resetFilmForm} style={{ backgroundColor: "#6c757d" }}>Batal Edit</button>}
            </div>
          </form>

          <div>
            <h3 style={{ margin: "20px 0 10px" }}>Daftar Film</h3>
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Judul</th><th>Kategori</th><th>Director</th><th>Rating Usia</th><th>Rating</th><th>Durasi</th><th>Gambar</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {films.map(film => (
                  <tr key={film.ID_Film}>
                    <td>{film.ID_Film}</td>
                    <td>{film.Judul_Film}</td>
                    <td>{film.Nama_Kategori}</td>
                    <td>{film.Director}</td>
                    <td><span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", backgroundColor: getRatingUsiaColor(film.Rating_Usia), color: "white" }}>{getRatingUsiaLabel(film.Rating_Usia)}</span></td>
                    <td>{film.Rating}</td>
                    <td>{film.Durasi}</td>
                    <td>{film.image && <img src={`http://localhost/Web_Bioskop/API_PHP/uploads/${film.image}`} alt={film.Judul_Film} style={{ width: "50px", height: "70px", objectFit: "cover" }} onError={(e) => { e.target.src = 'https://via.placeholder.com/50x70?text=No+Image'; }} />}</td>
                    <td><button className="btn-edit" onClick={() => handleEditFilm(film)} disabled={loading}>Edit</button><button className="btn-delete" onClick={() => handleDeleteFilm(film.ID_Film)} disabled={loading}>Hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* KONTEN JADWAL */}
      {activeTab === 'jadwal' && (
        <>
          <form onSubmit={handleJadwalSubmit} className="admin-form">
            <h3>{jadwalForm.id_jadwal ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h3>
            <select name="id_film" value={jadwalForm.id_film} onChange={handleJadwalChange} required>
              <option value="">Pilih Film</option>
              {films.map(film => (<option key={film.ID_Film} value={film.ID_Film}>{film.Judul_Film} - {film.Durasi}</option>))}
            </select>
            <input type="date" name="tanggal" value={jadwalForm.tanggal} onChange={handleJadwalChange} required min={new Date().toISOString().split('T')[0]} />
            <input type="time" name="jam_mulai" value={jadwalForm.jam_mulai} onChange={handleJadwalChange} required step="60" />
            <select name="no_studio" value={jadwalForm.no_studio} onChange={handleJadwalChange} required>
              <option value="">Pilih Studio</option>
              {studios.map(studio => (<option key={studio.No_Studio} value={studio.No_Studio}>{studio.Nama_Studio} - Rp {studio.Harga_Tiket?.toLocaleString()}</option>))}
            </select>
            {jadwalForm.no_studio && (<div style={{ padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "5px", marginBottom: "15px", fontSize: "14px" }}>💰 Harga tiket: Rp {studios.find(s => s.No_Studio == jadwalForm.no_studio)?.Harga_Tiket?.toLocaleString()}</div>)}
            <button type="submit" disabled={loading}>{loading ? "Memproses..." : (jadwalForm.id_jadwal ? "Update Jadwal" : "Tambah Jadwal")}</button>
          </form>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
              <h3 style={{ margin: 0 }}>Daftar Jadwal</h3>
              {schedules.length > 0 && (<button onClick={handleDeleteAllSchedules} style={{ backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}>🗑️ Hapus Semua Jadwal</button>)}
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>No</th><th>ID Jadwal</th><th>Film</th><th>Tanggal</th><th>Jam Mulai</th><th>Studio</th><th>Harga</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => (
                  <tr key={schedule.ID_Jadwal}>
                    <td>{index + 1}</td>
                    <td>{schedule.ID_Jadwal}</td>
                    <td>{schedule.judul_film}</td>
                    <td>{schedule.Tanggal}</td>
                    <td>{schedule.Jam_Mulai_Display}</td>
                    <td>{schedule.Nama_Studio || `Studio ${schedule.No_Studio}`}</td>
                    <td>Rp {parseInt(schedule.Harga || 0).toLocaleString()}</td>
                    <td><button className="btn-edit" onClick={() => handleEditJadwal(schedule)} disabled={loading}>Edit</button><button className="btn-delete" onClick={() => handleDeleteJadwal(schedule.ID_Jadwal)} disabled={loading}>Hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* KONTEN TRAILER */}
      {activeTab === 'trailer' && (
        <div className="trailer-management">
          <h3>Kelola Trailer Aktif</h3>
          <p style={{ marginBottom: "15px", color: "#666" }}>Pilih SATU film yang ingin ditampilkan trailernya di halaman utama (Jumbotron). Hanya film yang memiliki URL trailer yang bisa diaktifkan.</p>
          <div style={{ marginBottom: "20px" }}>
            <input type="text" placeholder="🔍 Cari film..." value={searchFilmTerm} onChange={(e) => setSearchFilmTerm(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          </div>
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px", color: "black" }}>
            <div><strong>Total Film:</strong> {filteredFilmsForTrailer.length}</div>
            <div><strong>Dengan Trailer:</strong> {filteredFilmsForTrailer.filter(f => f.Trailer_URL && f.Trailer_URL.trim() !== "").length}</div>
            <div><strong>Trailer Aktif:</strong> {activeTrailerId ? 1 : 0}</div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>No</th><th>Gambar</th><th>Judul Film</th><th>Genre</th><th>Director</th><th style={{ textAlign: "center" }}>Aktif di Home</th><th>Preview</th></tr>
            </thead>
            <tbody>
              {filteredFilmsForTrailer.map((film, index) => {
                const hasTrailer = film.Trailer_URL && film.Trailer_URL.trim() !== "";
                const isCurrentlyActive = activeTrailerId === film.ID_Film;
                return (
                  <tr key={film.ID_Film} style={isCurrentlyActive ? { backgroundColor: "#e8f5e9" } : {}}>
                    <td>{index + 1}</td>
                    <td>{film.image && <img src={`http://localhost/Web_Bioskop/API_PHP/uploads/${film.image}`} alt={film.Judul_Film} style={{ width: "40px", height: "56px", objectFit: "cover", borderRadius: "4px" }} />}</td>
                    <td><strong>{film.Judul_Film}</strong><br /><small>{film.Durasi || '-'}</small></td>
                    <td>{film.Nama_Kategori || '-'}</td>
                    <td>{film.Director || '-'}</td>
                    <td style={{ textAlign: "center" }}>
                      {hasTrailer ? (
                        <input type="radio" name="activeTrailer" checked={isCurrentlyActive} onChange={() => handleToggleTrailerActive(film.ID_Film, !isCurrentlyActive)} disabled={updatingTrailerIds.includes(film.ID_Film) || loading} style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#4caf50" }} />
                      ) : <span style={{ color: "#999" }}>❌ Tidak ada trailer</span>}
                    </td>
                    <td>{hasTrailer && <button className="btn-edit" onClick={() => window.open(film.Trailer_URL, '_blank')} style={{ padding: "4px 12px" }} disabled={loading}>Preview</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeTrailerId && (<button onClick={handleClearActiveTrailer} style={{ marginTop: "15px", backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}>🗑️ Nonaktifkan Trailer</button>)}
          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px",color: "black" }}>
            <strong>💡 Informasi:</strong>
            <ul style={{ margin: "10px 0 0 20px", color: "#856404" }}>
              <li>Hanya SATU trailer yang bisa aktif di halaman utama</li>
              <li>Hanya film yang memiliki URL trailer yang bisa diaktifkan</li>
              <li>Untuk menambah/mengedit URL trailer, silakan ke menu "Kelola Film"</li>
            </ul>
          </div>
        </div>
      )}

{/* KONTEN PESANAN + KEUANGAN */}
{activeTab === 'orders' && (
  <div className="orders-management">
    <h3>Kelola Pesanan & Keuangan</h3>
    
    {/* ==================== DASHBOARD KEUANGAN ==================== */}
    <div className="finance-dashboard" style={{ marginBottom: "25px" }}>
      <h4 style={{ color: "#000", marginBottom: "15px" }}>💵 Ringkasan Keuangan</h4>
      
      {/* Card Utama */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
        <div style={{ flex: 1, minWidth: "150px", padding: "15px", backgroundColor: "#10b981", borderRadius: "10px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Pendapatan Bersih</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Rp {transactions
            .filter(t => t.Status?.toLowerCase() === 'paid' || t.Status?.toLowerCase() === 'completed')
            .reduce((sum, t) => sum + (parseInt(t.Total_Harga) || 0), 0)
            .toLocaleString()}</div>
          <div style={{ fontSize: "11px" }}>✓ Sudah Dibayar</div>
        </div>
        
        <div style={{ flex: 1, minWidth: "150px", padding: "15px", backgroundColor: "#f59e0b", borderRadius: "10px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total Kotor</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Rp {transactions.reduce((sum, t) => sum + (parseInt(t.Total_Harga) || 0), 0).toLocaleString()}</div>
          <div style={{ fontSize: "11px" }}>💰 Termasuk Pending</div>
        </div>
        
        <div style={{ flex: 1, minWidth: "150px", padding: "15px", backgroundColor: "#ef4444", borderRadius: "10px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Pending</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Rp {transactions
            .filter(t => t.Status?.toLowerCase() === 'pending')
            .reduce((sum, t) => sum + (parseInt(t.Total_Harga) || 0), 0)
            .toLocaleString()}</div>
          <div style={{ fontSize: "11px" }}>⏳ Belum Dibayar</div>
        </div>
        
        <div style={{ flex: 1, minWidth: "150px", padding: "15px", backgroundColor: "#6b7280", borderRadius: "10px", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Dibatalkan</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Rp {transactions
            .filter(t => t.Status?.toLowerCase() === 'cancelled')
            .reduce((sum, t) => sum + (parseInt(t.Total_Harga) || 0), 0)
            .toLocaleString()}</div>
          <div style={{ fontSize: "11px" }}>↩️ Total Refund</div>
        </div>
      </div>
      
      {/* Statistik Tambahan */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "5px" }}>
        <div style={{ flex: 1, padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>{transactions.length}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Total Transaksi</div>
        </div>
        <div style={{ flex: 1, padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>
            {transactions.length ? (transactions.reduce((sum, t) => sum + (parseInt(t.Jumlah) || 0), 0) / transactions.length).toFixed(1) : 0}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>Rata-rata Tiket/Transaksi</div>
        </div>
        <div style={{ flex: 1, padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>{transactions.filter(t => t.Status?.toLowerCase() === 'paid').length}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>✅ Transaksi Lunas</div>
        </div>
        <div style={{ flex: 1, padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>{transactions.filter(t => t.Status?.toLowerCase() === 'pending').length}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>⏳ Menunggu</div>
        </div>
      </div>
    </div>

    {/* ==================== TOP 5 FILM TERLARIS ==================== */}
    <div style={{ marginBottom: "25px", backgroundColor: "#f8fafc", padding: "15px", borderRadius: "10px" }}>
      <h4 style={{ color: "#000", marginBottom: "10px" }}>🎬 Top 5 Film Terlaris</h4>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {(() => {
          const filmStats = [];
          transactions.forEach(t => {
            const film = t.judul_film || 'Film Tidak Diketahui';
            const existing = filmStats.find(f => f.name === film);
            if (existing) {
              existing.revenue += parseInt(t.Total_Harga) || 0;
              existing.tickets += parseInt(t.Jumlah) || 0;
            } else {
              filmStats.push({ name: film, revenue: parseInt(t.Total_Harga) || 0, tickets: parseInt(t.Jumlah) || 0 });
            }
          });
          return filmStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((film, idx) => (
            <div key={idx} style={{ flex: 1, minWidth: "150px", backgroundColor: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontWeight: "bold", color: "#000" }}>{idx + 1}. {film.name}</div>
              <div style={{ fontSize: "14px", color: "#666" }}>{film.tickets} tiket</div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>Rp {film.revenue.toLocaleString()}</div>
            </div>
          ));
        })()}
      </div>
    </div>

    {/* ==================== FILTER & SEARCH ==================== */}
    <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
      <div style={{ flex: 2 }}>
        <input 
          type="text" 
          placeholder="🔍 Cari ID Pesanan / Penonton / Film..." 
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", color: "#000" }}
        />
      </div>
      <div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd", color: "#000" }}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Pembayaran</option>
          <option value="paid">Sudah Dibayar</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
      <button 
        onClick={fetchOrders} 
        style={{ padding: "10px 20px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
      >
        🔄 Refresh
      </button>
    </div>

    {/* FILTER TANGGAL */}
    <div style={{ 
      display: "flex", 
      gap: "15px", 
      marginBottom: "20px", 
      flexWrap: "wrap", 
      alignItems: "center", 
      padding: "10px 15px", 
      backgroundColor: "#f8fafc", 
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
      <span style={{ fontWeight: "bold", color: "#000" }}>📅 Filter Tanggal:</span>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>Dari:</span>
        <input 
          type="date" 
          value={filterDateStart}
          onChange={(e) => setFilterDateStart(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", color: "#000" }}
        />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>Sampai:</span>
        <input 
          type="date" 
          value={filterDateEnd}
          onChange={(e) => setFilterDateEnd(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", color: "#000" }}
        />
      </div>
      
      {(filterDateStart || filterDateEnd) && (
        <button 
          onClick={() => { setFilterDateStart(""); setFilterDateEnd(""); }}
          style={{ padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
        >
          ✕ Reset Tanggal
        </button>
      )}
      
      {filterDateStart && filterDateEnd && (
        <span style={{ fontSize: "12px", color: "#10b981" }}>
          ✓ Menampilkan {filterDateStart} - {filterDateEnd}
        </span>
      )}
      {filterDateStart && !filterDateEnd && (
        <span style={{ fontSize: "12px", color: "#f59e0b" }}>
          ⚠️ Dari {filterDateStart}
        </span>
      )}
      {!filterDateStart && filterDateEnd && (
        <span style={{ fontSize: "12px", color: "#f59e0b" }}>
          ⚠️ Sampai {filterDateEnd}
        </span>
      )}
    </div>

    {/* ==================== TABEL PESANAN ==================== */}
    <div style={{ overflowX: "auto" }}>
      <table className="admin-table" style={{ color: "#000", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>No</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>ID Pesanan</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Tanggal</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Penonton</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Film</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Studio</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Jadwal</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Kursi</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Jumlah</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Total</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Status</th>
            <th style={{ color: "#fff", padding: "12px", textAlign: "left", backgroundColor: "#1e293b" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders?.length === 0 ? (
            <tr>
              <td colSpan="12" style={{ textAlign: "center", padding: "40px", color: "#000" }}>
                {loading ? "Memuat data..." : "Belum ada pesanan"}
              </td>
            </tr>
          ) : (
            filteredOrders?.map((order, index) => (
              <tr key={order.ID_Transaksi} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", color: "#000" }}>{index + 1}</td>
                <td style={{ padding: "12px", color: "#000" }}><strong>{order.ID_Transaksi}</strong></td>
                <td style={{ padding: "12px", color: "#000" }}>{order.Tanggal_Pemesanan}</td>
                <td style={{ padding: "12px", color: "#000" }}>
                  {order.nama_penonton}<br/><small style={{ color: "#666" }}>{order.email_penonton}</small>
                </td>
                <td style={{ padding: "12px", color: "#000" }}>{order.judul_film}</td>
                <td style={{ padding: "12px", color: "#000" }}>{order.nama_studio}</td>
                <td style={{ padding: "12px", color: "#000" }}>
                  {order.Tanggal_Jadwal}<br/><small>{order.Jam_Mulai?.substring(0,5)}</small>
                </td>
                <td style={{ padding: "12px", color: "#000", maxWidth: "150px" }}>{order.Kursi}</td>
                <td style={{ padding: "12px", color: "#000" }}>{order.Jumlah} tiket</td>
                <td style={{ padding: "12px", color: "#000", fontWeight: "bold" }}>Rp {parseInt(order.Total_Harga).toLocaleString()}</td>
                <td style={{ padding: "12px", color: "#000" }}>{getStatusBadge(order.Status)}</td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                    {order.Status?.toLowerCase() === 'pending' && (
                      <>
                        <button className="btn-edit" onClick={() => handleUpdateOrderStatus(order.ID_Transaksi, 'paid')} disabled={loading} style={{ padding: "4px 8px", fontSize: "11px" }}>✅ Set Dibayar</button>
                        <button className="btn-delete" onClick={() => handleUpdateOrderStatus(order.ID_Transaksi, 'cancelled')} disabled={loading} style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#f59e0b" }}>❌ Batalkan</button>
                      </>
                    )}
                    {order.Status?.toLowerCase() === 'paid' && (
                      <button className="btn-edit" onClick={() => handleUpdateOrderStatus(order.ID_Transaksi, 'completed')} disabled={loading} style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#10b981" }}>✓ Tandai Selesai</button>
                    )}
                    <button className="btn-delete" onClick={() => handleDeleteOrder(order.ID_Transaksi)} disabled={loading} style={{ padding: "4px 8px", fontSize: "11px" }}>🗑️ Hapus</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
      {/* KONTEN PENGGUNA */}
      {activeTab === 'users' && <AdminUser />}
    </div>
  );
}

export default Admin;