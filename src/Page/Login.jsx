import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Simulasi login sederhana
        // Dalam implementasi nyata, ini akan panggil API
        if (email && password) {
            // Simpan data login
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", "false");
            localStorage.setItem("user", JSON.stringify({ 
                email: email,
                name: email.split('@')[0] // ambil nama dari email
            }));
            
            alert("Berhasil login!");
            
            const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
            localStorage.removeItem("redirectAfterLogin"); // Hapus setelah dipakai
            
            navigate(redirectTo); // Redirect ke halaman yang dimaksud
        } else {
            alert("Email dan password harus diisi!");
        }
    };

    return (
        <div className="login-format">
            <h2>Login Page</h2>
            <p>Let's get started!</p>
            <form onSubmit={handleLogin} className="group-input">
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
                
                <Link to="/Forgot-password">Forgot Password</Link>
                
                <button type="submit">Login</button>
                
                <p>or sign up with</p>
                <div className="shortcut-login">
                    <button className="google" type="button"></button>
                    <button className="facebook" type="button"></button>
                    <button className="biometrik" type="button"></button>
                </div>
                
                <p>
                    Don't have an account? <Link to="/Register">Sign up</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;