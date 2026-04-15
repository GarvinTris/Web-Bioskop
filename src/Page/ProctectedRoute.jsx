// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requireAdmin = false, requireMFA = false }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const mfaVerified = localStorage.getItem("mfa_verified") === "true";
    
    console.log("ProtectedRoute check:", { isLoggedIn, isAdmin, mfaVerified });
    
    if (!isLoggedIn) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        return <Navigate to="/login" replace />;
    }
    
    if (requireAdmin && !isAdmin) {
        alert("Akses ditolak. Halaman ini hanya untuk admin.");
        return <Navigate to="/" replace />;
    }
    
    if (requireMFA && !mfaVerified) {
        alert("Verifikasi MFA diperlukan untuk mengakses halaman ini.");
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

export default ProtectedRoute;