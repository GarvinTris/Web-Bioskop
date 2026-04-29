// src/Page/LoadingScreen.jsx
import { useEffect } from "react";
import "../style/LoadingScreen.css";

function LoadingScreen({ onLoadingComplete }) {

    useEffect(() => {
        // Sembunyikan navbar dan footer saat loading
        const navbar = document.querySelector('nav');
        const footer = document.querySelector('footer');
        
        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';

        // Timer loading 1.5 detik
        const timer = setTimeout(() => {
            // Kembalikan navbar dan footer setelah loading selesai
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
            
            if (onLoadingComplete) {
                onLoadingComplete();
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            // Pastikan navbar dan footer kembali jika komponen unmount sebelum timer selesai
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
        };
    }, [onLoadingComplete]);

    return (
        <div className="loading-screen">
            <div className="loading-containers">
                <div className="loading-dots">
                    <span className="dot dot1">●</span>
                    <span className="dot dot2">●</span>
                    <span className="dot dot3">●</span>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;