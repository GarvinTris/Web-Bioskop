// AdminUser.jsx - FIXED VERSION
import { useState, useEffect } from "react";

function AdminUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  
  // State untuk form edit
  const [userForm, setUserForm] = useState({
    id_penonton: "",
    nama_lengkap: "",
    email: "",
    no_hp: "",
    password: ""
  });

  const API_BASE = "http://localhost/Web_Bioskop/API_PHP";

  // Helper functions
  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const resetForm = () => {
    setUserForm({
      id_penonton: "",
      nama_lengkap: "",
      email: "",
      no_hp: "",
      password: ""
    });
    setIsEditing(false);
  };

  // Fetch semua user - menggunakan getAllUsers.php (dari backend Anda)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      let url = `${API_BASE}/getUsers.php?t=${timestamp}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        showAlert("error", data.error || "Gagal mengambil data user");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      showAlert("error", "Gagal koneksi ke server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ambil detail user untuk diedit
  const handleEditUser = async (user) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      // PERUBAHAN: Gunakan getUserById.php
      const response = await fetch(`${API_BASE}/getUserById.php?id=${user.ID_Penonton}&t=${timestamp}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserForm({
          id_penonton: data.user.ID_Penonton,
          nama_lengkap: data.user.Nama_Lengkap || "",
          email: data.user.Email || "",
          no_hp: data.user.No_HP || "",
          password: ""
        });
        setIsEditing(true);
        setShowModal(true);
      } else {
        showAlert("error", data.error || "Gagal mengambil detail user");
      }
    } catch (error) {
      console.error("Edit user error:", error);
      showAlert("error", "Gagal mengambil data user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit update user - PERUBAHAN: Gunakan updateUser.php
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!userForm.nama_lengkap || !userForm.email || !userForm.no_hp) {
      showAlert("error", "Semua field harus diisi!");
      return;
    }
    
    if (!userForm.id_penonton) {
      showAlert("error", "ID user tidak valid!");
      return;
    }
    
    setLoading(true);
    
    // PERUBAHAN: Kirim sebagai POST dengan FormData atau JSON
    const formData = new URLSearchParams();
    formData.append("id_penonton", userForm.id_penonton);
    formData.append("nama_lengkap", userForm.nama_lengkap);
    formData.append("email", userForm.email);
    formData.append("no_hp", userForm.no_hp);
    if (userForm.password) {
      formData.append("password", userForm.password);
    }
    
    try {
      // PERUBAHAN: Gunakan POST method
      const response = await fetch(`${API_BASE}/updateUser.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert("success", "User berhasil diupdate!");
        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        showAlert("error", data.error || "Gagal mengupdate user");
      }
    } catch (error) {
      console.error("Update error:", error);
      showAlert("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lihat riwayat transaksi - PERUBAHAN: Gunakan getUserTransactions.php
  const handleViewTransactions = async (id, nama) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE}/getUserTransactions.php?id=${id}&t=${timestamp}`);
      const data = await response.json();
      
      if (data.success) {
        setUserTransactions(data.transactions || []);
        setSelectedUser({ ID_Penonton: id, Nama_Lengkap: nama });
        setShowDetailModal(true);
      } else {
        showAlert("error", data.error || "Gagal mengambil riwayat transaksi");
      }
    } catch (error) {
      console.error("Transactions error:", error);
      showAlert("error", "Gagal mengambil data transaksi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hapus user - PERUBAHAN: Gunakan deleteUser.php
  const handleDeleteUser = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus user "${nama}"?\n\nSemua data transaksi user ini juga akan dihapus.\nTINDAKAN INI TIDAK DAPAT DIBATALKAN!`)) {
      return;
    }
    
    setLoading(true);
    try {
      // PERUBAHAN: Kirim sebagai POST dengan parameter
      const formData = new URLSearchParams();
      formData.append("id", id);
      
      const response = await fetch(`${API_BASE}/deleteUser.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert("success", `User "${nama}" berhasil dihapus!`);
        fetchUsers();
      } else {
        showAlert("error", data.error || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("error", "Gagal menghapus user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div className="admin-users-container">
      <h3 style={{ marginBottom: "10px" }}>Kelola Data Pengguna</h3>
      <p style={{ marginBottom: "20px", color: "#666" }}>Total: {users.length} pengguna</p>

      {/* Alert Message */}
      {message.text && (
        <div style={{
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "8px",
          backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
          color: message.type === "success" ? "#155724" : "#721c24",
          border: message.type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
        }}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, email, atau nomor HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <button 
          onClick={() => fetchUsers()} 
          style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          disabled={loading}
        >
          🔍 Cari
        </button>
        {search && (
          <button 
            onClick={() => setSearch("")} 
            style={{ padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div className="loading-spinner"></div>
          <p>Memuat data...</p>
        </div>
      )}

      {/* Tabel User */}
      <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "12px", overflow: "hidden" }}>
        <thead style={{ backgroundColor: "#1e293b" }}>
          <tr>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>ID</th>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Nama Lengkap</th>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Email</th>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Nomor HP</th>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Tanggal Daftar</th>
            <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                {search ? "Tidak ada user ditemukan" : "Belum ada data pengguna"}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.ID_Penonton} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px" }}>{user.ID_Penonton}</td>
                <td style={{ padding: "12px" }}>{user.Nama_Lengkap}</td>
                <td style={{ padding: "12px" }}>{user.Email}</td>
                <td style={{ padding: "12px" }}>{user.No_HP}</td>
                <td style={{ padding: "12px" }}>{formatTanggal(user.Tanggal_Daftar)}</td>
                <td style={{ padding: "12px" }}>
                  <button 
                    onClick={() => handleViewTransactions(user.ID_Penonton, user.Nama_Lengkap)}
                    style={{ background: "#3b82f6", color: "white", padding: "6px 12px", marginRight: "5px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    title="Lihat riwayat transaksi"
                  >
                    📋 Riwayat
                  </button>
                  <button 
                    onClick={() => handleEditUser(user)}
                    style={{ background: "#10b981", color: "white", padding: "6px 12px", marginRight: "5px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    title="Edit user"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.ID_Penonton, user.Nama_Lengkap)}
                    style={{ background: "#ef4444", color: "white", padding: "6px 12px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    title="Hapus user"
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL EDIT USER */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "12px", padding: "24px",
            width: "500px", maxWidth: "90%", maxHeight: "90vh", overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>{isEditing ? "✏️ Edit User" : "Tambah User"}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>ID Penonton</label>
                <input
                  type="text"
                  value={userForm.id_penonton}
                  disabled
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", background: "#f5f5f5" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nama Lengkap *</label>
                <input
                  type="text"
                  value={userForm.nama_lengkap}
                  onChange={(e) => setUserForm({ ...userForm, nama_lengkap: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nomor HP *</label>
                <input
                  type="tel"
                  value={userForm.no_hp}
                  onChange={(e) => setUserForm({ ...userForm, no_hp: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password Baru</label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                />
                <small style={{ fontSize: "12px", color: "#666" }}>Minimal 6 karakter jika diisi</small>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={loading} style={{ padding: "10px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL TRANSAKSI */}
      {showDetailModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "800px", maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ padding: "16px 24px", backgroundColor: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ color: "white", margin: 0 }}>📋 Riwayat Transaksi - {selectedUser?.Nama_Lengkap}</h4>
              <button onClick={() => setShowDetailModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "white" }}>✕</button>
            </div>
            
            <div style={{ padding: "20px" }}>
              {userTransactions.length === 0 ? (
                <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Belum ada transaksi dari user ini</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "12px", textAlign: "left" }}>ID Transaksi</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Film</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Tanggal Tayang</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.map((trx, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px" }}>{trx.ID_Transaksi || "-"}</td>
                        <td style={{ padding: "12px" }}>{trx.Judul_Film || "-"}</td>
                        <td style={{ padding: "12px" }}>{trx.Tanggal || trx.Tanggal_Tayang || "-"}</td>
                        <td style={{ padding: "12px", color: "#10b981", fontWeight: "bold" }}>{formatRupiah(trx.Total_Harga)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={{ padding: "16px 24px", borderTop: "1px solid #eef2f6", textAlign: "right" }}>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: "10px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUser;