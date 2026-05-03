// ResetPassword.jsx - Updated dengan style rapi
import "../style/Login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sembunyikan navbar saat halaman ini aktif
    useEffect(() => {
        const navbar = document.querySelector('nav');
        const footer = document.querySelector('footer');
        
        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';
        
        return () => {
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get("token");
        const emailParam = params.get("email");
        
        const decodedEmail = emailParam ? decodeURIComponent(emailParam) : null;

        if (!tokenParam || !decodedEmail) {
            setError("Link reset password tidak valid");
        } else {
            setToken(tokenParam);
            setEmail(decodedEmail);
        }
    }, [location]);

    const validatePassword = (password) => {
        if (password.length < 8) return "Password minimal 8 karakter";
        if (!/[A-Za-z]/.test(password)) return "Password harus mengandung huruf";
        if (!/[0-9]/.test(password)) return "Password harus mengandung angka";
        return null;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validatePassword(newPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password tidak cocok!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/reset_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    email: email,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setError(data.message || "Terjadi kesalahan, silakan coba lagi");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Terjadi kesalahan koneksi ke server");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    if (success) {
        return (
            <div className="auth-layout">
                <div className="login-card">
                    <h2>✓ Password Berhasil Diubah!</h2>
                    <div className="success-message">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" fill="none"/>
                            <path d="M8 12L11 15L16 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>Password Anda telah berhasil direset.</p>
                        <p className="instruction">Mengarahkan ke halaman login...</p>
                    </div>
                    <Link to="/login">
                        <button className="btn-login">Login Sekarang</button>
                    </Link>
                </div>
            </div>
        );
    }

    if ((!token || !email) && !error) {
        return (
            <div className="auth-layout">
                <div className="login-card">
                    <h2>⚠️ Link Tidak Valid</h2>
                    <p className="subtitle">Link reset password tidak valid atau sudah kadaluarsa.</p>
                    <Link to="/forgot-password">
                        <button className="btn-login">Kirim Ulang Link</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout">
            <div className="login-card">
                <h2>Buat Password Baru</h2>
                <p className="subtitle">Masukkan password baru untuk akun Anda</p>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="login-form">
                    <div className="form-group">
                        <label>Password Baru</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimal 8 karakter (huruf dan angka)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                style={{ paddingRight: "45px" }}
                            />
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#9ca3af",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        <small style={{ color: "#6b7280", fontSize: "0.7rem", marginTop: "4px", display: "block" }}>
                            Password harus mengandung huruf dan angka, minimal 8 karakter
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Konfirmasi Password Baru</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan ulang password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? "Memproses..." : "Reset Password"}
                    </button>

                    <p className="signup-text">
                        <Link to="/login">← Kembali ke Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;