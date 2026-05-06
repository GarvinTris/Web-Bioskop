// Page/AdminLogin.jsx - Updated dengan OTP input terpisah
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
    const [step, setStep] = useState("login");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    // Refs untuk auto-focus
    const inputRefs = useRef([]);

    // Timer untuk resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Auto-focus ke input pertama saat MFA step
    useEffect(() => {
        if (step === "mfa" && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Hanya terima angka
        if (value && !/^\d*$/.test(value)) return;
        
        const newCode = [...mfaCode];
        newCode[index] = value.slice(0, 1); // Hanya 1 digit
        setMfaCode(newCode);
        
        // Auto-focus ke next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle keydown untuk backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Handle paste OTP
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.split('');
            const newCode = [...mfaCode];
            for (let i = 0; i < Math.min(digits.length, 6); i++) {
                newCode[i] = digits[i];
            }
            setMfaCode(newCode);
            
            // Focus ke input terakhir yang terisi
            const lastFilledIndex = Math.min(digits.length, 5);
            if (inputRefs.current[lastFilledIndex]) {
                inputRefs.current[lastFilledIndex].focus();
            }
        }
    };

    // Get full OTP code
    const getFullOtpCode = () => {
        return mfaCode.join('');
    };

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
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userType", "admin");
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/admin");
            } 
            else if (data.requires_mfa) {
                setStep("mfa");
                setCountdown(60);
                setMfaCode(["", "", "", "", "", ""]); // Reset OTP
                
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
        
        const code = getFullOtpCode();
        if (code.length !== 6) {
            setError("Masukkan kode 6 digit lengkap!");
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
                body: JSON.stringify({ code: code })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("userType", "admin");
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                alert("Login admin berhasil!");
                navigate("/admin");
            } else {
                setError(data.message || "Kode verifikasi salah");
                setMfaCode(["", "", "", "", "", ""]);
                if (inputRefs.current[0]) inputRefs.current[0].focus();
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
                setMfaCode(["", "", "", "", "", ""]);
                if (inputRefs.current[0]) inputRefs.current[0].focus();
                
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
                                placeholder="admin@cinema.com"
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
                        
                        <p className="signup-text" style={{ textAlign: "center", marginTop: "16px", color: "#666" }}>
                            ⚠️ Akun admin hanya dapat dibuat oleh super administrator melalui database.
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    // Form OTP MFA (Step 2) - Dengan 6 kotak terpisah
    return (
        <div className="auth-layout">
            <div className="login-card admin-card">
                <h2>🔐 Verifikasi Dua Langkah</h2>
                <p className="subtitle">
                    Masukkan kode 6 digit yang telah dikirim ke<br />
                    <strong>{email}</strong>
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleVerifyMFA} className="login-form">
                    <div className="form-group">
                        <label>Kode Verifikasi</label>
                        <div className="otp-container">
                            {mfaCode.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="otp-digit"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
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
                                setMfaCode(["", "", "", "", "", ""]);
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