import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (email && password) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", "false");
            localStorage.setItem("user", JSON.stringify({ 
                email: email,
                name: email.split('@')[0]
            }));
            
            alert("Berhasil login!");
            
            const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
            localStorage.removeItem("redirectAfterLogin");
            
            navigate(redirectTo);
        } else {
            alert("Email dan password harus diisi!");
        }
    };

    return (
        <div className="auth-layout">
            <div className="login-card">
                <h2>Login</h2>
                <p className="subtitle">Let's get started</p>
                
                <form onSubmit={handleLogin} className="login-form">
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
                    
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <button type="submit" className="btn-login">
                        Log In
                    </button>
                    
                    <p className="signup-text">
                        Don't have an account? 
                        <Link to="/Register">Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;