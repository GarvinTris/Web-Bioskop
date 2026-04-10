// Homepage.jsx - Lengkap dengan Populer, Coming Soon, FAQ, dan Footer
import "../style/Home.css"
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ==================== COMPONENT: NOW SHOWING ====================
function Movie() {
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost/Web_Bioskop/API_PHP/Bioskop.php")
            .then(response => response.json())
            .then(data => {
                setFilms(data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return (
            <section>
                <h1>Now Showing In Cinema!</h1>
                <div className="rekomen-loading">
                    <div className="loading-spinner"></div>
                    <p>Memuat film...</p>
                </div>
            </section>
        );
    }
    
    return (
        <section>
            <h1>Now Showing In Cinema!</h1>
            <div className="rekomen">
                {films.slice(0, 5).map((movie, index) => (
                    <div className="card" key={index}>
                        <Link to={`/Reservasi/${encodeURIComponent(movie.Judul_Film)}`}>
                            <img 
                                src={`http://localhost/Web_Bioskop/API_PHP/uploads/${movie.image}`} 
                                alt={movie.Judul_Film}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}
                            />
                        </Link>
                        <h2>{movie.Judul_Film}</h2>
                        <div className="movie-info-card-home">
                            <span>⭐ {movie.Rating || 'NR'}</span>
                            <span className="age-badge">{movie.Rating_Usia || 'SU'}</span>
                        </div>
                        <Link to={`/Reservasi/${encodeURIComponent(movie.Judul_Film)}`} className="book-now-btn">
                            Pesan Tiket
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==================== COMPONENT: JUMBOTRON ====================
function Jumbotron() {
    const [activeTrailer, setActiveTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActiveTrailer();
    }, []);

    const fetchActiveTrailer = async () => {
        try {
            const response = await fetch("http://localhost/Web_Bioskop/API_PHP/getTrailer.php");
            const trailers = await response.json();
            const active = trailers.find(t => t.is_Active == 1);
            setActiveTrailer(active || trailers[0]);
        } catch (error) {
            console.error("Error fetching trailer:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        if (activeTrailer && activeTrailer.Judul_Film) {
            navigate(`/Reservasi/${encodeURIComponent(activeTrailer.Judul_Film)}`);
        } else {
            navigate("/schedule");
        }
    };

    if (loading) {
        return <div className="jumbotron">Loading...</div>;
    }

    if (!activeTrailer) {
        return (
            <div className="jumbotron">
                <div className="jumbotron-text">
                    <h1>Welcome to Cinema</h1>
                    <p>No trailer available</p>
                    <button onClick={handleBookNow}>Book Now!</button>
                </div>
            </div>
        );
    }

    const videoId = activeTrailer.Embed_URL?.split('/embed/')[1]?.split('?')[0];
    const embedWithParams = videoId 
        ? `${activeTrailer.Embed_URL}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1`
        : activeTrailer.Embed_URL;

    return (
        <div className="jumbotron">
            <iframe 
                src={embedWithParams}
                title={activeTrailer.Judul_Film}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
            />
            <div className="jumbotron-text">
                <h1>{activeTrailer.Judul_Film}</h1>
                <div className="jumbotron-badges">
                    <span className="badge">{activeTrailer.Rating_Usia}</span>
                    <span className="badge">{activeTrailer.Genre || 'Action'}</span>
                </div>
                <p>{activeTrailer.Deskripsi?.substring(0, 150)}...</p>
                <button onClick={handleBookNow}>Book Now!</button>
            </div>
        </div>
    );
}

// ==================== COMPONENT: POPULER (MOST POPULAR) ====================
function Popular() {
    const [popularFilms, setPopularFilms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost/Web_Bioskop/API_PHP/Bioskop.php")
            .then(response => response.json())
            .then(data => {
                // Sort by rating (highest first) or by most booked
                const sorted = [...data].sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
                setPopularFilms(sorted.slice(0, 4));
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="popular-section">
                <h1>🎬 Film Populer Minggu Ini</h1>
                <div className="popular-loading">Memuat...</div>
            </section>
        );
    }

    return (
        <section className="popular-section">
            <h1>🎬 Film Populer Minggu Ini</h1>
            <div className="popular-grid">
                {popularFilms.map((film, index) => (
                    <div className="popular-card" key={index}>
                        <div className="popular-rank">#{index + 1}</div>
                        <img 
                            src={`http://localhost/Web_Bioskop/API_PHP/uploads/${film.image}`} 
                            alt={film.Judul_Film}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'}
                        />
                        <div className="popular-info">
                            <h3>{film.Judul_Film}</h3>
                            <div className="popular-rating">
                                <span>⭐ {film.Rating || 'NR'}</span>
                                <span className="popular-views">👁️ {Math.floor(Math.random() * 10000) + 1000}+ views</span>
                            </div>
                            <Link to={`/Reservasi/${encodeURIComponent(film.Judul_Film)}`} className="popular-btn">
                                Pesan Sekarang
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==================== COMPONENT: COMING SOON ====================
function ComingSoon() {
    const [showNotification, setShowNotification] = useState(null);
    
    const upcomingMovies = [
        {
            id: 1,
            title: "Avatar 3",
            releaseDate: "Desember 2025",
            genre: "Sci-Fi, Adventure",
            poster: "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
            description: "Pertempuran epik Pandora berlanjut dengan teknologi baru yang lebih spektakuler."
        },
        {
            id: 2,
            title: "Deadpool 3",
            releaseDate: "Juli 2025",
            genre: "Action, Comedy",
            poster: "https://image.tmdb.org/t/p/w500/30YacPAcNPQPpttW8Fe9W5SIQoE.jpg",
            description: "Wade Wilson kembali dengan aksi kocak dan pertarungan seru melawan musuh baru."
        },
        {
            id: 3,
            title: "Joker: Folie à Deux",
            releaseDate: "Oktober 2025",
            genre: "Drama, Thriller",
            poster: "https://image.tmdb.org/t/p/w500/kbhtQ9QcB8A5mU5qYj5Z5Q8X9mU.jpg",
            description: "Kisah kelam Arthur Fleck berlanjut dengan nuansa musikal yang gelap."
        },
        {
            id: 4,
            title: "Mission: Impossible 8",
            releaseDate: "Mei 2025",
            genre: "Action, Spy",
            poster: "https://image.tmdb.org/t/p/w500/8gT9QcB8A5mU5qYj5Z5Q8X9mU5q.jpg",
            description: "Ethan Hunt kembali dengan misi paling berbahaya yang pernah ada."
        }
    ];

    const handleNotify = (movieId) => {
        setShowNotification(movieId);
        setTimeout(() => setShowNotification(null), 2000);
    };

    return (
        <section className="coming-soon-section">
            <h1>🎬 Coming Soon</h1>
            <p className="coming-soon-subtitle">Film-film yang akan segera tayang di bioskop kami</p>
            <div className="coming-soon-grid">
                {upcomingMovies.map((movie) => (
                    <div className="coming-soon-card" key={movie.id}>
                        <div className="coming-soon-image">
                            <img src={movie.poster} alt={movie.title} />
                            <div className="coming-soon-date">{movie.releaseDate}</div>
                        </div>
                        <div className="coming-soon-info">
                            <h3>{movie.title}</h3>
                            <p className="coming-genre">{movie.genre}</p>
                            <p className="coming-desc">{movie.description.substring(0, 80)}...</p>
                            <button 
                                className="notify-me-btn"
                                onClick={() => handleNotify(movie.id)}
                            >
                                🔔 Ingatkan Saya
                            </button>
                            {showNotification === movie.id && (
                                <div className="notify-success">✓ Akan diingatkan via email!</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==================== COMPONENT: FAQ ====================
function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);
    
    const faqs = [
        { 
            q: "Bagaimana cara memesan tiket?",
            a: "Pilih film yang ingin ditonton, pilih jadwal dan studio, pilih kursi favorit Anda, lalu lakukan pembayaran. Tiket akan dikirim ke email Anda dalam bentuk E-Ticket."
        },
        { 
            q: "Apakah tiket bisa refund atau dibatalkan?",
            a: "Tiket dapat dibatalkan maksimal H-1 sebelum jadwal tayang. Refund akan diproses dalam 3-7 hari kerja ke metode pembayaran awal Anda."
        },
        { 
            q: "Metode pembayaran apa saja yang tersedia?",
            a: "Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BNI, BRI), OVO, GoPay, DANA, ShopeePay, dan Kartu Kredit (Visa/Mastercard/JCB)."
        },
        { 
            q: "Apa itu rating usia pada film?",
            a: "Rating usia: SU (Semua Umur), P (Pra Sekolah 2-6 tahun), A (Anak-anak 7-12 tahun), R (Remaja 13-17 tahun), D (Dewasa 18+ tahun), BO (Bimbingan Orang Tua)."
        },
        { 
            q: "Apakah ada diskon untuk pembelian banyak tiket?",
            a: "Ya! Kami memiliki promo Family Package (beli 4 tiket gratis popcorn), serta diskon grup untuk pembelian lebih dari 10 tiket."
        },
        { 
            q: "Bagaimana cara menggunakan E-Ticket?",
            a: "Cukup tunjukkan E-Ticket dari email atau aplikasi Anda di pintu masuk bioskop. Petugas akan scan QR code yang tertera pada tiket."
        }
    ];

    return (
        <section className="faq-section-home">
            <h1>❓ Frequently Asked Questions</h1>
            <p className="faq-subtitle">Pertanyaan yang sering diajukan oleh pengunjung kami</p>
            <div className="faq-container">
                {faqs.map((faq, idx) => (
                    <div className="faq-item" key={idx}>
                        <button 
                            className={`faq-question ${openIndex === idx ? 'active' : ''}`}
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                            <span>{faq.q}</span>
                            <span className="faq-icon">{openIndex === idx ? '−' : '+'}</span>
                        </button>
                        <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
                            <p>{faq.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==================== COMPONENT: NEWSLETTER ====================
function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <section className="newsletter-section-home">
            <div className="newsletter-content">
                <h2>📧 Dapatkan Info Film Terbaru!</h2>
                <p>Berlangganan newsletter untuk mendapatkan info film terbaru, promo eksklusif, dan tiket gratis!</p>
                <form onSubmit={handleSubscribe} className="newsletter-form">
                    <input 
                        type="email" 
                        placeholder="Masukkan email Anda" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Berlangganan Gratis</button>
                </form>
                {subscribed && <div className="newsletter-success">✓ Berhasil berlangganan! Cek email Anda untuk konfirmasi.</div>}
            </div>
        </section>
    );
}

// ==================== COMPONENT: FOOTER ====================
function Footer() {
    const currentYear = new Date().getFullYear();
    
    const footerLinks = {
        perusahaan: [
            { name: "Tentang Kami", link: "/about" },
            { name: "Karir", link: "/career" },
            { name: "Blog", link: "/blog" },
            { name: "Press Kit", link: "/press" }
        ],
        layanan: [
            { name: "Pesan Tiket", link: "/schedule" },
            { name: "Cek Pesanan", link: "/riwayat-tiket" },
            { name: "Bantuan", link: "/help" },
            { name: "Kebijakan Privasi", link: "/privacy" }
        ],
        sosial: [
            { name: "Facebook", link: "#", icon: "📘" },
            { name: "Instagram", link: "#", icon: "📷" },
            { name: "Twitter", link: "#", icon: "🐦" },
            { name: "YouTube", link: "#", icon: "▶️" },
            { name: "TikTok", link: "#", icon: "🎵" }
        ]
    };

    return (
        <footer className="home-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">🎬 Cinema XXI</div>
                    <p>Menghadirkan pengalaman menonton film terbaik dengan teknologi terkini dan pelayanan premium sejak 2010.</p>
                    <div className="footer-contact">
                        <p>📞 (021) 1234-5678</p>
                        <p>✉️ info@cinema-xxi.com</p>
                        <p>📍 Jl. Sudirman No. 123, Jakarta</p>
                    </div>
                </div>
                
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Perusahaan</h4>
                        <ul>
                            {footerLinks.perusahaan.map((item, idx) => (
                                <li key={idx}><Link to={item.link}>{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="footer-col">
                        <h4>Layanan</h4>
                        <ul>
                            {footerLinks.layanan.map((item, idx) => (
                                <li key={idx}><Link to={item.link}>{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="footer-col">
                        <h4>Ikuti Kami</h4>
                        <ul className="footer-social">
                            {footerLinks.sosial.map((item, idx) => (
                                <li key={idx}>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        <span className="social-icon">{item.icon}</span> {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>&copy; {currentYear} Cinema XXI. All rights reserved.</p>
                    <div className="footer-payments">
                        <span>Metode Pembayaran:</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Visa_Logo.svg/100px-Visa_Logo.svg.png" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/100px-Bank_Central_Asia.svg.png" alt="BCA" />
                        <span>OVO</span>
                        <span>GoPay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export { Movie, Jumbotron, Popular, ComingSoon, FAQSection, NewsletterSection, Footer };

// Export default untuk Homepage (ini yang akan digunakan di App.jsx)
export default function Homepage() {
    return (
        <>
            <Jumbotron />
            <Movie />
            <Popular />
            <ComingSoon />
            <FAQSection />
            <NewsletterSection />
            <Footer />
        </>
    );
}