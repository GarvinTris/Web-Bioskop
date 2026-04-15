// Page/AdminRegister.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Login.css";

function AdminRegister() {
    const [namaLengkap, setNamaLengkap] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!namaLengkap || !email || !password || !confirmPassword) {
            alert("Semua field harus diisi!");
            return;
        }
        
        if (!email.includes('@')) {
            alert("Format email tidak valid!");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }
        
        if (password.length < 8) {
            alert("Password minimal 8 karakter!");
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/admin_register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama_lengkap: namaLengkap,
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert("Registrasi admin berhasil! Silakan login.");
                navigate("/admin-login"); // Balik ke halaman login admin
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Register error:", error);
            alert("Terjadi kesalahan pada server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="login-card admin-card">
                <h2>Registrasi Admin</h2>
                <p className="subtitle">Buat akun administrator baru</p>
                
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input 
                            type="text" 
                            placeholder="Masukkan nama lengkap"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email Admin</label>
                        <input 
                            type="email" 
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="Minimal 8 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Konfirmasi Password</label>
                        <input 
                            type="password" 
                            placeholder="··········"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Memproses..." : "Daftar sebagai Admin"}
                    </button>
                    
                    <p className="signup-text">
                        Sudah punya akun admin? 
                        <Link to="/admin-login">Login Admin</Link>
                    </p>
                    
                    <hr />
                    
                </form>
            </div>
        </div>
    );
}

export default AdminRegister;