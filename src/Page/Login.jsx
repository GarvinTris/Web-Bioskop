// Page/Login.jsx - Hapus bagian admin-access
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!identifier || !password) {
            alert("Email/Nomor HP dan password harus diisi!");
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/penonton_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    identifier: identifier,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Clear any existing data
                localStorage.clear();
                
                // Set user data (penonton)
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "false");
                localStorage.setItem("userType", "penonton");
                localStorage.setItem("userId", data.user.ID_Penonton);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                alert("Login berhasil!");
                
                // Cek apakah ada redirect setelah login
                const redirectTo = localStorage.getItem("redirectAfterLogin");
                if (redirectTo) {
                    localStorage.removeItem("redirectAfterLogin");
                    navigate(redirectTo);
                } else {
                    navigate("/"); // Langsung ke homepage
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Terjadi kesalahan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="login-card user-card">
                <h2>Login Penonton</h2>
                <p className="subtitle">Masuk dengan email atau nomor HP</p>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email atau Nomor HP</label>
                        <input 
                            type="text" 
                            placeholder="contoh: nama@email.com / 081234567890"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="··········"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="forgot-password">
                        <Link to="/forgot-password">Lupa Password?</Link>
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </button>
                    
                    <p className="signup-text">
                        Belum punya akun? 
                        <br />
                        <Link to="/register">Daftar Sekarang</Link>
                    </p>
                    
                    {/* 🔴 HAPUS BAGIAN INI - Tidak ada tautan ke admin lagi */}
                    {/* 
                    <hr />
                    <div className="admin-access">
                        <Link to="/admin-login">Login sebagai Admin →</Link>
                    </div>
                    */}
                </form>
            </div>
        </div>
    );
}

export default Login;