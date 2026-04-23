// Page/AdminLogin.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/Login.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [step, setStep] = useState("login"); // 'login' or 'mfa'
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Timer untuk resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // STEP 1: Login dengan email & password
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError("Email dan password harus diisi!");
            return;
        }
        
        setLoading(true);
        setError("");
        
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
                // Login sukses tanpa MFA (tapi kita pake MFA)
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userType", "admin");
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                navigate("/admin");
            } 
            else if (data.requires_mfa) {
                // Pindah ke step MFA
                setStep("mfa");
                setCountdown(60); // 60 detik untuk resend
                
                // Untuk development: tampilkan debug_code jika ada
                if (data.debug_code) {
                    console.log("Development MFA Code:", data.debug_code);
                    alert(`[DEV MODE] Kode MFA: ${data.debug_code}`);
                } else {
                    alert("Kode verifikasi telah dikirim ke email Anda");
                }
            }
            else {
                setError(data.message || "Login gagal");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Terjadi kesalahan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verifikasi kode MFA
    const handleVerifyMFA = async (e) => {
        e.preventDefault();
        
        if (!mfaCode || mfaCode.length !== 6) {
            setError("Masukkan kode 6 digit");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/verify_mfa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ code: mfaCode })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // MFA berhasil, login sukses
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userType", "admin");
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                alert("Login admin berhasil!");
                navigate("/admin");
            } else {
                setError(data.message || "Kode verifikasi salah");
                setMfaCode(""); // Reset input
            }
        } catch (error) {
            console.error("MFA error:", error);
            setError("Terjadi kesalahan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Resend MFA code
    const handleResendCode = async () => {
        if (countdown > 0) {
            alert(`Tunggu ${countdown} detik sebelum meminta ulang`);
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
            
            if (data.requires_mfa) {
                setCountdown(60);
                if (data.debug_code) {
                    console.log("New MFA Code:", data.debug_code);
                    alert(`[DEV MODE] Kode MFA baru: ${data.debug_code}`);
                } else {
                    alert("Kode verifikasi baru telah dikirim ke email Anda");
                }
            } else {
                setError("Gagal mengirim ulang kode");
            }
        } catch (error) {
            setError("Gagal mengirim ulang: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Form Login (Step 1)
    if (step === 'login') {
        return (
            <div className="auth-layout">
                <div className="login-card admin-card">
                    <h2>Admin Login</h2>
                    <p className="subtitle">Masuk sebagai administrator</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
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
                    </form>
                </div>
            </div>
        );
    }

    // Form OTP MFA (Step 2)
    return (
        <div className="auth-layout">
            <div className="login-card admin-card">
                <h2>🔐 Verifikasi Dua Langkah</h2>
                <p className="subtitle">
                    Kode verifikasi telah dikirim ke<br />
                    <strong>{email}</strong>
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleVerifyMFA} className="login-form">
                    <div className="form-group">
                        <label>Kode Verifikasi (6 digit)</label>
                        <input 
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                            className="otp-input"
                            autoFocus
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Memverifikasi..." : "Verifikasi & Login"}
                    </button>
                    
                    <div className="resend-container">
                        <button 
                            type="button" 
                            onClick={handleResendCode}
                            disabled={countdown > 0 || loading}
                            className="btn-resend"
                        >
                            {countdown > 0 ? `Kirim ulang (${countdown}s)` : "Kirim ulang kode"}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => {
                                setStep("login");
                                setMfaCode("");
                                setError("");
                            }}
                            className="btn-back"
                        >
                            ← Kembali ke Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;