import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
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
    setMobileMenuOpen(false);
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav>
        <div className="layout">
          <i className="fa-solid fa-bars"></i>
          <select className="dropdown">
            <option value="en">EN</option>
            <option value="id">ID</option>
          </select>
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1>FilmOut</h1>
          </Link>
        </div>
        
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li>|</li>
          
          {isLoggedIn ? (
            <>
              <li style={{ color: "#4CAF50", fontWeight: "bold" }}>
                Hi, {userName}
              </li>
              <li><Link to="/riwayat-tiket">Riwayat</Link></li>
              {isAdmin && (
                <li><Link to="/admin">Admin Panel</Link></li>
              )}
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
        
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          ☰
        </button>
      </nav>
      
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul>
          <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link></li>
          
          {isLoggedIn ? (
            <>
              <li style={{ color: "#4CAF50" }}>Hi, {userName}</li>
              <li><Link to="/riwayat-tiket" onClick={() => setMobileMenuOpen(false)}>Riwayat</Link></li>
              {isAdmin && (
                <li><Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link></li>
              )}
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;