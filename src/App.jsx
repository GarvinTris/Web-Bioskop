import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react";
import Layout from "./component/Layout.jsx";
import Homepage from "./Page/Homepage";
import Admin from "./Page/Admin.jsx";
import Reservasi from "./Page/Reservasi.jsx";
import Login from "./Page/Login.jsx";
import Register from "./Page/Register.jsx";
import AdminLogin from "./Page/AdminLogin.jsx";
import AdminRegister from "./Page/AdminRegister.jsx";
import SeatSelection from "./Page/SeatSelection.jsx";
import Payment from "./Page/Payment.jsx";
import PaymentSuccess from "./Page/PaymentSucess.jsx";
import RiwayatTiket from "./Page/RiwayatTiket.jsx";
import About from "./Page/About.jsx";
import Contact from "./Page/Contact.jsx";
import ForgotPassword from "./Page/ForgotPassword.jsx";
import DetailTiket from "./Page/DetailTiket.jsx";
import Schedule from "./Page/Schedule.jsx";

// ==================== COMPONENT PROTECTED ROUTE ====================
function ProtectedRoute({ children, requireAdmin = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userType = localStorage.getItem("userType");
      
      if (!isLoggedIn) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // 🔴 CEK ADMIN - Jika requireAdmin true tapi userType bukan admin
      if (requireAdmin && userType !== 'admin') {
        alert("Akses ditolak. Halaman ini hanya untuk admin.");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Cek session ke backend (opsional, untuk keamanan ekstra)
      try {
        const response = await fetch('http://localhost/Web_Bioskop/API_PHP/check_session.php', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          // Session expired, hapus localStorage
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userId");
          localStorage.removeItem("user");
          localStorage.removeItem("userType");
          localStorage.removeItem("isAdmin");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Jika backend check_session belum ada, asumsikan tetap authenticated
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="loading-spinner"></div>
        <p>Memeriksa sesi login...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    // 🔴 PERUBAHAN: Jika requireAdmin true, redirect ke admin-login, bukan login
    if (requireAdmin) {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==================== COMPONENT LAYOUT WRAPPER ====================
function LayoutWrapper({ children }) {
  return <Layout>{children}</Layout>;
}

// ==================== MAIN APP ====================
function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES - bisa diakses semua orang */}
        <Route path="/" element={
          <LayoutWrapper>
            <Homepage />
          </LayoutWrapper>
        } />
        
        <Route path="/schedule" element={
          <LayoutWrapper>
            <Schedule />
          </LayoutWrapper>
        } />
        
        <Route path="/Reservasi/:Judul_Film" element={
          <LayoutWrapper>
            <Reservasi />
          </LayoutWrapper>
        } />

        <Route path="/forgot-password" element={
          <LayoutWrapper>
            <ForgotPassword />
          </LayoutWrapper>
        } />
        
        {/* AUTH ROUTES - Login/Register (tanpa layout wrapper untuk tampilan full page) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* AUTH ROUTES - Admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        
        {/* PUBLIC INFO PAGES */}
        <Route path="/about" element={
          <LayoutWrapper>
            <About />
          </LayoutWrapper>
        } />
        
        <Route path="/contact" element={
          <LayoutWrapper>
            <Contact />
          </LayoutWrapper>
        } />

        {/* PROTECTED ROUTES - WAJIB LOGIN (Penonton) */}
        <Route path="/seat-selection" element={
          <ProtectedRoute>
            <LayoutWrapper>
              <SeatSelection />
            </LayoutWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/payment" element={
          <ProtectedRoute>
            <LayoutWrapper>
              <Payment />
            </LayoutWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <LayoutWrapper>
              <PaymentSuccess />
            </LayoutWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/riwayat-tiket" element={
          <ProtectedRoute>
            <LayoutWrapper>
              <RiwayatTiket />
            </LayoutWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/detail-tiket" element={
          <ProtectedRoute>
            <LayoutWrapper>
              <DetailTiket />
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        {/* 🔴 ADMIN ROUTE - KHUSUS ADMIN (tanpa LayoutWrapper karena Admin punya layout sendiri) */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* 404 NOT FOUND */}
        <Route path="*" element={
          <LayoutWrapper>
            <div style={{ textAlign: "center", padding: "50px" }}>
              <h1>404 - Halaman Tidak Ditemukan</h1>
              <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
              <button onClick={() => window.location.href = "/"}>Kembali ke Beranda</button>
            </div>
          </LayoutWrapper>
        } />
      </Routes>
    </Router>
  )
}

export default App;