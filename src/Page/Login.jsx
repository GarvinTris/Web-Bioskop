import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Login.jsx - update handleLogin function
const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
        alert("Email/Nomor HP dan password harus diisi!");
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch('http://localhost/Web_bioskop/API_PHP/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Login response:", data);
        
        if (data.success) {
            // Simpan data user ke localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", "false");
            localStorage.setItem("userId", data.user.ID_Penonton); // <-- PENTING: simpan userId
            localStorage.setItem("user", JSON.stringify({ 
                id: data.user.ID_Penonton,
                email: data.user.Email,
                no_hp: data.user.No_HP,
                name: data.user.Nama_Lengkap
            }));
            
            alert("Berhasil login!");
            
            const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
            localStorage.removeItem("redirectAfterLogin");
            
            navigate(redirectTo);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Login error detail:", error);
        alert("Terjadi kesalahan: " + error.message);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="auth-layout">
            <div className="login-card">
                <h2>Login</h2>
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
                        <Link to="/Forgot-Password">Lupa Password?</Link>
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </button>
                    
                    <p className="signup-text">
                        Belum punya akun? 
                        <Link to="/Register">Daftar Sekarang</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;