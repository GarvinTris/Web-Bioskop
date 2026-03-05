import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Cek status login setiap kali komponen dimuat
  useEffect(() => {
    checkLoginStatus();
    
    // Optional: listener untuk perubahan localStorage
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const admin = localStorage.getItem("isAdmin") === "true";
    const userData = localStorage.getItem("user");
    
    setIsLoggedIn(loggedIn);
    setIsAdmin(admin);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.email || "User");
      } catch {
        setUserName("User");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName("");
    
    // Redirect ke home
    navigate("/");
  };

  return (
    <nav>
      <div className="layout">
        <i className="fa-solid fa-bars"></i>
        <select className="dropdown">
          <option value="en">EN</option>
          <option value="id">ID</option>
        </select>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1>FilmOut</h1>
        </Link>
      </div>
      
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li>|</li>
        
        {isLoggedIn ? (
          // TAMPILAN KALAU SUDAH LOGIN
          <>
            <li style={{ color: "#4CAF50", fontWeight: "bold" }}>
              Hi, {userName}
            </li>
            <li><Link to="/riwayat-tiket">Riwayat</Link></li> 
            {isAdmin && (
              <li><Link to="/admin">Admin Panel</Link></li>
            )}
            <li>
              <button 
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          // TAMPILAN KALAU BELUM LOGIN
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;