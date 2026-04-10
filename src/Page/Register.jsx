import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
    const [namaLengkap, setNamaLengkap] = useState("");
    const [email, setEmail] = useState("");
    const [noHp, setNoHp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^(08|8|\+62|62)(\d{8,12})$/;
        return phoneRegex.test(phone);
    };

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        
        if (emailValue.includes('@') && !namaLengkap) {
            let nameFromEmail = emailValue.split('@')[0];
            nameFromEmail = nameFromEmail
                .split(/[._-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            setNamaLengkap(nameFromEmail);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!namaLengkap || !email || !noHp || !password || !confirmPassword) {
            alert("Semua field harus diisi!");
            return;
        }
        
        if (!validateEmail(email)) {
            alert("Format email tidak valid! Contoh: nama@email.com");
            return;
        }
        
        if (!validatePhoneNumber(noHp)) {
            alert("Format nomor HP tidak valid! Contoh: 081234567890");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }
        
        if (password.length < 6) {
            alert("Password minimal 6 karakter!");
            return;
        }
        
        setLoading(true);
        
        try {
            // Panggil API_PHP/register.php
            const response = await fetch('http://localhost/Web_bioskop/API_PHP/Register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama_lengkap: namaLengkap,
                    email: email,
                    no_hp: noHp,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert("Pendaftaran berhasil! Silakan login.");
                navigate("/Login");
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
            <div className="login-card">
                <h2>Daftar Akun</h2>
                <p className="subtitle">Mulai pengalaman menonton Anda</p>
                
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label>Nama Lengkap *</label>
                        <input 
                            type="text" 
                            placeholder="Masukkan nama lengkap"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email *</label>
                        <input 
                            type="email" 
                            placeholder="contoh: nama@email.com"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block' }}>
                            💡 Nama akan otomatis terisi dari email
                        </small>
                    </div>
                    
                    <div className="form-group">
                        <label>Nomor HP *</label>
                        <input 
                            type="tel" 
                            placeholder="contoh: 081234567890"
                            value={noHp}
                            onChange={(e) => setNoHp(e.target.value)}
                            required
                        />
                        <small style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block' }}>
                            Nomor HP juga bisa digunakan untuk login
                        </small>
                    </div>
                    
                    <div className="form-group">
                        <label>Password *</label>
                        <input 
                            type="password" 
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Konfirmasi Password *</label>
                        <input 
                            type="password" 
                            placeholder="··········"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Memproses..." : "Daftar"}
                    </button>
                    
                    <p className="signup-text">
                        Sudah punya akun? 
                        <Link to="/Login">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;