import { useState } from "react";
import "../style/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showMessage("error", "Semua field harus diisi!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Gunakan FormData (bukan JSON)
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("subject", formData.subject);
      formDataObj.append("message", formData.message);
      
      const response = await fetch("http://localhost/Web_Bioskop/API_PHP/contact_us.php", {
        method: "POST",
        body: formDataObj  // FormData, bukan JSON
      });
      
      const result = await response.json();
      console.log("Response:", result);
      
      if (result.success) {
        showMessage("success", result.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        showMessage("error", result.error || "Gagal mengirim pesan");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Terjadi kesalahan server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-main">
        <div className="contact-form-section">
          <p className="contact-description">
            Kami senang mendengar dari Anda. Jika Anda memiliki pertanyaan, masukan, 
            atau membutuhkan informasi lebih lanjut mengenai website ini, silakan hubungi kami.
          </p>
          
          {message.text && (
            <div style={{
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
              color: message.type === "success" ? "#065f46" : "#991b1b"
            }}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Nama Anda"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Email Anda"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subjek</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                placeholder="Subjek pesan"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Pesan</label>
              <textarea 
                id="message" 
                name="message" 
                rows="5" 
                placeholder="Pesan Anda"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="info-item">
            <h4>📧 Email</h4>
            <p>info@cinema-xxi.com</p>
          </div>
          <div className="info-item">
            <h4>📞 Nomor Telepon</h4>
            <p>+62 812-3456-7890</p>
          </div>
          <div className="info-item">
            <h4>📍 Alamat</h4>
            <p>Jl. Sudirman No. 123, Jakarta Selatan, Indonesia</p>
          </div>
          <div className="info-item">
            <h4>⏰ Jam Operasional</h4>
            <p>Senin – Jumat: 09.00 – 21.00 WIB</p>
            <p>Sabtu – Minggu: 08.00 – 22.00 WIB</p>
            <p className="info-note">
              Tim kami akan merespon pesan Anda dalam 1x24 jam.
              Terima kasih atas perhatian dan kepercayaan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;