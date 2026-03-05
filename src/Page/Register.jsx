import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        
        // Validasi sederhana
        if (!email || !password || !confirmPassword) {
            alert("Semua field harus diisi!");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Password dan Confirm Password tidak cocok!");
            return;
        }
        
        // Simulasi register berhasil
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "false");
        localStorage.setItem("user", JSON.stringify({ 
            email: email,
            name: email.split('@')[0]
        }));
        
        alert("Berhasil Register!");
        
        // 🔴 CEK APAKAH ADA REDIRECT SEBELUMNYA
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin"); // Hapus setelah dipakai
        
        navigate(redirectTo); // Redirect ke halaman yang dimaksud
    };

    return (
        <div className="login-format">
            <h2>Register</h2>
            <p>Let's get started!</p>
            <form onSubmit={handleRegister} className="group-input">
                <label htmlFor="email">Email or Mobile Number</label>
                <input 
                    type="text" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <label htmlFor="password">Password</label>
                <input 
                    type="password" 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                    type="password" 
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                
                <Link to="/Forgot-password">Forgot Password</Link>
                
                <button type="submit">Register</button>
                
                <p>or sign up with</p>
                <div className="shortcut-login">
                    <button className="google" type="button"></button>
                    <button className="facebook" type="button"></button>
                    <button className="biometrik" type="button"></button>
                </div>
                
                <p>
                    Already have an account? <Link to="/Login">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;