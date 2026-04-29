// ResetPassword.jsx - Tambahkan useEffect untuk navbar
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

        console.log("Token:", tokenParam);
        console.log("Email decoded:", decodedEmail);

        if (!tokenParam || !decodedEmail) {
            setError("Link reset password tidak valid");
        } else {
            setToken(tokenParam);
            setEmail(decodedEmail);
        }
    }, [location]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!newPassword || !confirmPassword) {
            setError("Semua field harus diisi!");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password minimal 8 karakter!");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password tidak cocok!");
            return;
        }

        if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setError("Password harus mengandung huruf dan angka!");
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

    if (success) {
        return (
            <div className="auth-layout">
                <div className="login-card">
                    <h2>Password Berhasil Diubah!</h2>
                    <div className="success-message">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>Password Anda telah berhasil direset.</p>
                        <p>Mengarahkan ke halaman login...</p>
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
                    <h2>Link Tidak Valid</h2>
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
                        <input
                            type="password"
                            placeholder="Minimal 8 karakter (huruf dan angka)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Konfirmasi Password Baru</label>
                        <input
                            type="password"
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
                        <Link to="/login">Kembali ke Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;