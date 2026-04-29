// ForgotPassword.jsx - Tambahkan useEffect untuk navbar
import "../style/Login.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Sembunyikan navbar saat halaman ini aktif
    useEffect(() => {
        // Cari elemen navbar dan sembunyikan
        const navbar = document.querySelector('nav');
        const footer = document.querySelector('footer');
        
        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';
        
        // Kembalikan saat komponen unmount
        return () => {
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
        };
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    };

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [cooldown]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!email) {
            setError("Email harus diisi!");
            return;
        }
        
        if (!validateEmail(email)) {
            setError("Format email tidak valid! Contoh: nama@email.com");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost/Web_Bioskop/API_PHP/forgot_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setIsSubmitted(true);
                setCooldown(60);
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

    const handleResendEmail = () => {
        if (cooldown > 0) {
            setError(`Harap tunggu ${cooldown} detik sebelum mengirim ulang!`);
            return;
        }
        
        setIsSubmitted(false);
        setEmail("");
        setError("");
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isSubmitted) {
        return (
            <div className="auth-layout">
                <div className="login-card">
                    <h2>Check Your Email</h2>
                    <p className="subtitle">We've sent you a password reset link</p>
                    
                    <div className="success-message">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>Password reset link has been sent to:</p>
                        <strong>{email}</strong>
                        <p className="instruction">Please check your email inbox and follow the instructions to reset your password.</p>
                    </div>
                    
                    <div className="button-group">
                        <button 
                            onClick={handleResendEmail} 
                            className="btn-resend"
                            disabled={cooldown > 0}
                            style={{
                                opacity: cooldown > 0 ? 0.6 : 1,
                                cursor: cooldown > 0 ? "not-allowed" : "pointer"
                            }}
                        >
                            {cooldown > 0 ? `Resend Email (${formatTime(cooldown)})` : "Resend Email"}
                        </button>
                        <Link to="/login">
                            <button className="btn-back-to-login">
                                Back to Login
                            </button>
                        </Link>
                    </div>
                    
                    {error && (
                        <div className="error-message" style={{ marginTop: "16px" }}>
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout">
            <div className="login-card">
                <h2>Forgot Password</h2>
                <p className="subtitle">Enter your email to reset your password</p>
                
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleForgotPassword} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-login"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                    
                    <p className="signup-text">
                        Remember your password? 
                        <Link to="/login">Back to Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;