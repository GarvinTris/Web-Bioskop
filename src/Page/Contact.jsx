import "../style/Contact.css";

function Contact() {
  return (
    <div className="contact-container">
      {/* Header dengan logo dan navigasi */}
      <div className="contact-header">
        <h1 className="logo">FilmOut</h1>
        <nav className="navbar">
          <a href="/">HOME</a>
          <a href="/about">ABOUT US</a>
          <a href="/contact" className="active">
            CONTACT US
          </a>
        </nav>
      </div>

      {/* Konten utama: form dan informasi kontak */}
      <div className="contact-main">
        <div className="contact-form-section">
          <p className="contact-description">Kami senang mendengar dari Anda. Jika Anda memiliki pertanyaan, masukan, atau membutuhkan informasi lebih lanjut mengenai website ini, silakan hubungi kami melalui kontak berikut.</p>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Nama Anda" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Email Anda" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" placeholder="Pesan Anda"></textarea>
            </div>
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="info-item">
            <h4>Email</h4>
            <p>info@website.com</p>
          </div>
          <div className="info-item">
            <h4>Nomor Telepon</h4>
            <p>+62 812-3456-7890</p>
          </div>
          <div className="info-item">
            <h4>Alamat</h4>
            <p>Jl. Contoh No.123, Medan, Sumatera Utara, Indonesia</p>
          </div>
          <div className="info-item">
            <h4>Jam Operasional</h4>
            <p>Senin – Jumat: 09.00 – 17.00 WIB</p>
            <p className="info-note">
              Anda juga dapat menghubungi kami melalui formulir yang tersedia di halaman ini dengan mengisi nama, alamat email, serta pesan yang ingin Anda sampaikan. Tim kami akan berusaha merespons pesan Anda secepat mungkin. Terima kasih
              atas perhatian dan kepercayaan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
