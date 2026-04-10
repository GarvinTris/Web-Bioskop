import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0); // State untuk cooldown timer
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Effect untuk countdown timer
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
        
        // Validasi email tidak kosong
        if (!email) {
            setError("Email harus diisi!");
            return;
        }
        
        // Validasi format email
        if (!validateEmail(email)) {
            setError("Format email tidak valid! Contoh: nama@email.com");
            return;
        }
        
        setIsLoading(true);
        
        // Simulasi pengiriman request ke server
        setTimeout(() => {
            // Cek apakah email terdaftar (simulasi)
            const registeredUsers = JSON.parse(localStorage.getItem("users") || "[]");
            const userExists = registeredUsers.some(user => user.email === email);
            
            // Atau cek dari localStorage user yang login (jika ada)
            const currentUser = JSON.parse(localStorage.getItem("user") || "null");
            
            if (userExists || currentUser?.email === email) {
                // Simulasi pengiriman email reset password
                const resetToken = Math.random().toString(36).substring(2, 15);
                localStorage.setItem(`reset_token_${email}`, resetToken);
                
                setIsSubmitted(true);
                setError("");
                // Set cooldown 60 detik setelah berhasil kirim
                setCooldown(60);
            } else {
                // Tetap tampilkan pesan sukses untuk keamanan
                setIsSubmitted(true);
                setError("");
                // Set cooldown 60 detik
                setCooldown(60);
            }
            
            setIsLoading(false);
        }, 1500);
    };

    const handleResendEmail = () => {
        // Cek apakah masih dalam masa cooldown
        if (cooldown > 0) {
            setError(`Harap tunggu ${cooldown} detik sebelum mengirim ulang!`);
            return;
        }
        
        setIsSubmitted(false);
        setEmail("");
        setError("");
    };

    // Format waktu untuk menampilkan menit:detik
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