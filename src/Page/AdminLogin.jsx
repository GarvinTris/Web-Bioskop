// Page/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Login.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            alert("Email dan password harus diisi!");
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/admin_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Clear any existing user data
                localStorage.clear();
                
                // Set admin data
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userType", "admin");
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                alert("Login admin berhasil!");
                navigate("/admin"); // Langsung ke dashboard admin
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
            <div className="login-card admin-card">
                <h2>Admin Login</h2>
                <p className="subtitle">Masuk sebagai administrator</p>
                
                <form onSubmit={handleLogin} className="login-form">
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
                            placeholder="··········"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Loading..." : "Login sebagai Admin"}
                    </button>
                    
                    <p className="signup-text">
                        Belum punya akun admin? 
                        <Link to="/admin-register">Daftar Admin Sekarang</Link>
                    </p>
                    
                    <hr />
                    
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;