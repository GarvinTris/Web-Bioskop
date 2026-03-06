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
        
        if (!email || !password || !confirmPassword) {
            alert("Semua field harus diisi!");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "false");
        localStorage.setItem("user", JSON.stringify({ 
            email: email,
            name: email.split('@')[0]
        }));
        
        alert("Berhasil Register!");
        
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        
        navigate(redirectTo);
    };

    return (
        <div className="auth-layout">
            <div className="login-card">
                <h2>Register</h2>
                <p className="subtitle">Let's get started</p>
                
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label>Email or Mobile Number</label>
                        <input 
                            type="text" 
                            placeholder="example@email.com"
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
                    
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="··········"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" className="btn-login">
                        Register
                    </button>
                    
                    <p className="signup-text">
                        Already have an account? 
                        <Link to="/Login">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;