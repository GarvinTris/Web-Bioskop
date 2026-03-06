import "../style/About.css";
import { useState, useEffect } from "react";

function About(){
  const [activeTab, setActiveTab] = useState("sejarah");
  const [counts, setCounts] = useState({
    films: 0,
    customers: 0,
    screens: 0,
    awards: 0
  });

  // Animasi counter
  useEffect(() => {
    const targetCounts = {
      films: 150,
      customers: 50000,
      screens: 12,
      awards: 25
    };

    const duration = 2000; // 2 detik
    const steps = 50;
    const increment = {
      films: targetCounts.films / steps,
      customers: targetCounts.customers / steps,
      screens: targetCounts.screens / steps,
      awards: targetCounts.awards / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounts({
          films: Math.min(Math.floor(increment.films * currentStep), targetCounts.films),
          customers: Math.min(Math.floor(increment.customers * currentStep), targetCounts.customers),
          screens: Math.min(Math.floor(increment.screens * currentStep), targetCounts.screens),
          awards: Math.min(Math.floor(increment.awards * currentStep), targetCounts.awards)
        });
        currentStep++;
      } else {
        setCounts(targetCounts);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Visioner industri hiburan dengan pengalaman 15 tahun",
      social: { twitter: "#", linkedin: "#", instagram: "#" }
    },
    {
      id: 2,
      name: "Siti Rahayu",
      role: "Chief Operating Officer",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      bio: "Ahli manajemen operasional bioskop berskala nasional",
      social: { twitter: "#", linkedin: "#", instagram: "#" }
    },
    {
      id: 3,
      name: "Ahmad Wijaya",
      role: "Head of Programming",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      bio: "Kurator film dengan koneksi internasional",
      social: { twitter: "#", linkedin: "#", instagram: "#" }
    },
    {
      id: 4,
      name: "Dewi Lestari",
      role: "Customer Experience Director",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      bio: "Memastikan setiap kunjungan menjadi pengalaman tak terlupakan",
      social: { twitter: "#", linkedin: "#", instagram: "#" }
    }
  ];

  const milestones = [
    { year: 2010, event: "Pendirian bioskop pertama di Jakarta" },
    { year: 2013, event: "Ekspansi ke 5 kota besar di Indonesia" },
    { year: 2015, event: "Meluncurkan aplikasi pemesanan tiket online" },
    { year: 2018, event: "Mencapai 1 juta pengunjung per tahun" },
    { year: 2020, event: "Digitalisasi total dan pembukaan studio IMAX" },
    { year: 2023, event: "Bioskop dengan teknologi terkini di 15 kota" },
    { year: 2024, event: "Penghargaan Bioskop Terbaik se-Asia Tenggara" }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Tentang Kami</h1>
          <p className="hero-subtitle">
            Menghadirkan pengalaman menonton film terbaik untuk Anda sejak 2010
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{counts.films}+</span>
              <span className="stat-label">Judul Film</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{counts.customers.toLocaleString()}+</span>
              <span className="stat-label">Pengunjung</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{counts.screens}</span>
              <span className="stat-label">Studio</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{counts.awards}</span>
              <span className="stat-label">Penghargaan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="vision-mission">
        <div className="container">
          <div className="section-header">
            <h2>Visi & Misi</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="vm-grid">
            <div className="vm-card vision">
              <div className="vm-icon">🔭</div>
              <h3>Visi Kami</h3>
              <p>
                Menjadi jaringan bioskop terdepan di Indonesia yang menghadirkan 
                pengalaman hiburan berkualitas dunia dan mendukung perkembangan 
                industri film nasional.
              </p>
            </div>
            
            <div className="vm-card mission">
              <div className="vm-icon">🎯</div>
              <h3>Misi Kami</h3>
              <ul className="mission-list">
                <li>Menghadirkan teknologi bioskop terkini untuk kenyamanan maksimal</li>
                <li>Mendukung karya anak bangsa melalui program film independen</li>
                <li>Memberikan pelayanan terbaik dengan standar internasional</li>
                <li>Menciptakan lapangan kerja dan mengembangkan talenta lokal</li>
                <li>Berkomitmen pada keberlanjutan lingkungan dalam setiap operasional</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah & Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div className="section-header">
            <h2>Perjalanan Kami</h2>
            <div className="section-divider"></div>
          </div>

          <div className="timeline-tabs">
            <button 
              className={`tab-btn ${activeTab === 'sejarah' ? 'active' : ''}`}
              onClick={() => setActiveTab('sejarah')}
            >
              Sejarah
            </button>
            <button 
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
          </div>

          {activeTab === 'sejarah' && (
            <div className="sejarah-content fade-in">
              <div className="sejarah-text">
                <p>
                  Berawal dari kecintaan terhadap film dan keinginan untuk menghadirkan 
                  pengalaman menonton yang berkualitas, <strong>Cinema XXI</strong> didirikan 
                  pada tahun 2010 oleh sekelompok pengusaha muda yang visioner.
                </p>
                <p>
                  Bioskop pertama kami berdiri di jantung kota Jakarta dengan 3 studio 
                  dan kapasitas 500 kursi. Dalam waktu singkat, kami mendapatkan respons 
                  positif dari masyarakat yang haus akan hiburan berkualitas.
                </p>
                <p>
                  Tahun demi tahun, kami terus berkembang dan berinovasi. Pada tahun 2015, 
                  kami menjadi pelopor sistem pemesanan tiket online di Indonesia. 
                  Kemudian pada tahun 2018, kami meluncurkan program loyalty pertama 
                  yang memberikan berbagai keuntungan bagi pelanggan setia.
                </p>
                <p>
                  Kini, setelah lebih dari satu dekade berkarya, kami telah hadir di 15 kota 
                  di Indonesia dengan 12 studio modern, termasuk studio IMAX, 4DX, dan 
                  Dolby Atmos. Kami bangga telah menjadi bagian dari lebih dari 50.000 
                  pengalaman menonton yang tak terlupakan.
                </p>
              </div>
              <div className="sejarah-image">
                <img 
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Cinema Interior" 
                />
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="timeline-container fade-in">
              {milestones.map((item, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-content">
                    <p>{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nilai-Nilai Perusahaan */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Nilai-Nilai Kami</h2>
            <div className="section-divider"></div>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Integritas</h3>
              <p>Menjalankan bisnis dengan jujur, transparan, dan etis</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Inovasi</h3>
              <p>Terus berinovasi untuk pengalaman terbaik</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Kolaborasi</h3>
              <p>Bekerja sama untuk mencapai yang terbaik</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
              <h3>Pelayanan</h3>
              <p>Pelanggan adalah prioritas utama kami</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Keberlanjutan</h3>
              <p>Peduli lingkungan dan sosial</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏆</div>
              <h3>Keunggulan</h3>
              <p>Memberikan yang terbaik dalam setiap aspek</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tim Kami */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Tim Kami</h2>
            <div className="section-divider"></div>
            <p className="section-description">
              Para profesional yang berdedikasi menghadirkan pengalaman terbaik untuk Anda
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map(member => (
              <div className="team-card" key={member.id}>
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  <div className="member-social">
                    <a href={member.social.twitter} className="social-link">🐦</a>
                    <a href={member.social.linkedin} className="social-link">🔗</a>
                    <a href={member.social.instagram} className="social-link">📷</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Apa Kata Mereka</h2>
            <div className="section-divider"></div>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                Pengalaman menonton terbaik di kota ini! Studio bersih, sound system mantap, 
                dan pelayanan ramah. Jadi langganan setiap ada film baru.
              </p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Customer" />
                <div>
                  <h4>Andini Putri</h4>
                  <span>Pengunjung Setia</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                Aplikasinya sangat memudahkan. Bisa pesan tiket dari rumah, pilih kursi 
                sesuai keinginan. Nggak perlu antre lagi!
              </p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Customer" />
                <div>
                  <h4>Rizki Firmansyah</h4>
                  <span>Pengguna Aplikasi</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                Studio IMAX-nya luar biasa! Kualitas gambar dan suara bikin pengalaman 
                nonton film jadi lebih immersive. Worth it banget!
              </p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Customer" />
                <div>
                  <h4>Sarah Wijaya</h4>
                  <span>Movie Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Nikmati Pengalaman Menonton Terbaik</h2>
          <p>Pesan tiket sekarang dan rasakan kenyamanan bioskop kami</p>
          <button 
            className="cta-button"
            onClick={() => window.location.href = "/"}
          >
            Pesan Tiket Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Cinema XXI</h4>
              <p>Menghadirkan pengalaman menonton film terbaik untuk Anda sejak 2010.</p>
            </div>
            <div className="footer-col">
              <h4>Kontak</h4>
              <p>📞 (021) 1234-5678</p>
              <p>✉️ info@cinema-xxi.com</p>
              <p>📍 Jl. Sudirman No. 123, Jakarta</p>
            </div>
            <div className="footer-col">
              <h4>Ikuti Kami</h4>
              <div className="social-links">
                <a href="#" className="social-link">📘 Facebook</a>
                <a href="#" className="social-link">🐦 Twitter</a>
                <a href="#" className="social-link">📷 Instagram</a>
                <a href="#" className="social-link">▶️ YouTube</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Jam Operasional</h4>
              <p>Senin - Jumat: 10:00 - 22:00</p>
              <p>Sabtu - Minggu: 09:00 - 23:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Cinema XXI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;