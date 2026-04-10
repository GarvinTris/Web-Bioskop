// AdminUser.jsx - Perbaiki warna head text menjadi putih
import { useState, useEffect } from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [editForm, setEditForm] = useState({
    id_penonton: "",
    nama_lengkap: "",
    email: "",
    no_hp: "",
    password: ""
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const timestamp = new Date().getTime();
        const url = search 
            ? `http://localhost/Web_Bioskop/API_PHP/getUsers.php?search=${encodeURIComponent(search)}&t=${timestamp}`
            : `http://localhost/Web_Bioskop/API_PHP/getUsers.php?t=${timestamp}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON parse error:", e);
            throw new Error("Response bukan JSON valid");
        }
        
        if (data.success) {
            setUsers(data.users || []);
        } else {
            showMessage("error", data.message || data.error || "Gagal mengambil data user");
            setUsers([]);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        showMessage("error", "Terjadi kesalahan: " + error.message);
        setUsers([]);
    } finally {
        setLoading(false);
    }
  };

  const fetchUserDetail = async (id) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/getUserById.php?id=${id}&t=${timestamp}`, {
          method: 'GET',
          headers: {
              'Cache-Control': 'no-cache'
          }
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
          setSelectedUser(data.user);
          setEditForm({
              id_penonton: data.user.ID_Penonton,
              nama_lengkap: data.user.Nama_Lengkap,
              email: data.user.Email,
              no_hp: data.user.No_HP,
              password: ""
          });
          setShowModal(true);
      } else {
          showMessage("error", data.error || "Gagal mengambil detail user");
      }
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (id, nama) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/getUserTransactions.php?id=${id}&t=${timestamp}`);
      const data = await response.json();
      
      if (data.success) {
          setUserTransactions(data.transactions);
          setSelectedUser({ ID_Penonton: id, Nama_Lengkap: nama });
          setShowDetailModal(true);
      } else {
          showMessage("error", data.message || "Gagal mengambil riwayat transaksi");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus user "${nama}"? Semua transaksi user ini juga akan dihapus.`)) {
        return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost/Web_Bioskop/API_PHP/deleteUser.php?id=${id}`, {
          method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
          showMessage("success", `User "${nama}" berhasil dihapus!`);
          fetchUsers();
      } else {
          showMessage("error", data.message || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/updateUser.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
          showMessage("success", "User berhasil diupdate!");
          setShowModal(false);
          fetchUsers();
      } else {
          showMessage("error", data.error || "Gagal mengupdate user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
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
      <div className="users-header">
        <h3 style={{ color: "#1e293b" }}>Kelola Data Pengguna</h3>
        <p style={{ color: "#64748b" }}>Total: {users.length} pengguna</p>
      </div>

      {message.text && (
        <div className={`message-${message.type}`} style={{ padding: "10px", marginBottom: "16px", borderRadius: "8px", backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2", color: message.type === "success" ? "#166534" : "#991b1b" }}>
          {message.text}
        </div>
      )}

      <div className="search-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, email, atau nomor HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
        />
        <button onClick={() => fetchUsers()} className="btn-search" style={{ padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          🔍 Cari
        </button>
        {search && (
          <button onClick={() => setSearch("")} className="btn-clear" style={{ padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="loading-spinner" style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      )}

      <div className="users-table-wrapper">
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
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {search ? "Tidak ada user yang ditemukan" : "Belum ada data pengguna"}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.ID_Penonton} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px", color: "#1e293b" }}>{user.ID_Penonton}</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>{user.Nama_Lengkap}</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>{user.Email}</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>{user.No_HP}</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>{formatTanggal(user.Tanggal_Daftar)}</td>
                  <td style={{ padding: "12px" }}>
                    <button 
                      className="btn-view"
                      onClick={() => fetchUserTransactions(user.ID_Penonton, user.Nama_Lengkap)}
                      title="Lihat riwayat transaksi"
                      style={{ background: "#3b82f6", color: "white", padding: "6px 12px", marginRight: "5px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                      📋
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => fetchUserDetail(user.ID_Penonton)}
                      title="Edit user"
                      style={{ background: "#10b981", color: "white", padding: "6px 12px", marginRight: "5px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.ID_Penonton, user.Nama_Lengkap)}
                      title="Hapus user"
                      style={{ background: "#ef4444", color: "white", padding: "6px 12px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit User */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90%" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h4 style={{ color: "#1e293b", margin: 0 }}>✏️ Edit User</h4>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="edit-form">
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#475569" }}>ID Penonton</label>
                <input type="text" value={editForm.id_penonton} disabled style={{ width: "100%", padding: "10px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }} />
              </div>
              
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#475569" }}>Nama Lengkap *</label>
                <input
                  type="text"
                  value={editForm.nama_lengkap}
                  onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#475569" }}>Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#475569" }}>Nomor HP *</label>
                <input
                  type="tel"
                  value={editForm.no_hp}
                  onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#475569" }}>Password Baru (kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                />
              </div>
              
              <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", color: "#475569" }}>
                  Batal
                </button>
                <button type="submit" className="btn-save" disabled={loading} style={{ padding: "10px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px", width: "90%", backgroundColor: "white", borderRadius: "12px", overflow: "hidden" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#1e293b" }}>
              <h4 style={{ color: "white", margin: 0 }}>📋 Riwayat Transaksi - {selectedUser?.Nama_Lengkap}</h4>
              <button className="modal-close" onClick={() => setShowDetailModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "white" }}>✕</button>
            </div>
            
            <div className="transactions-list" style={{ padding: "20px", maxHeight: "500px", overflowY: "auto" }}>
              {userTransactions.length === 0 ? (
                <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Belum ada transaksi dari user ini</p>
              ) : (
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>ID Transaksi</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>Film</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>Tanggal Tayang</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>Jam</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>Studio</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#1e293b" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.map((trx, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px", color: "#1e293b" }}>{trx.ID_Transaksi || "-"}</td>
                        <td style={{ padding: "12px", color: "#1e293b" }}>{trx.Judul_Film || "-"}</td>
                        <td style={{ padding: "12px", color: "#1e293b" }}>{trx.Tanggal || "-"}</td>
                        <td style={{ padding: "12px", color: "#1e293b" }}>{trx.Jam_Mulai?.substring(0, 5) || "-"}</td>
                        <td style={{ padding: "12px", color: "#1e293b" }}>{trx.Nama_Studio || `Studio ${trx.No_Studio}`}</td>
                        <td style={{ padding: "12px", color: "#10b981", fontWeight: "bold" }}>{formatRupiah(trx.Harga)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #eef2f6" }}>
              <button className="btn-close" onClick={() => setShowDetailModal(false)} style={{ padding: "10px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;