import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./component/Layout.jsx";
import Homepage from "./Page/Homepage";
import Admin from "./Page/Admin.jsx";
import Reservasi from "./Page/Reservasi.jsx";
import Login from "./Page/Login.jsx";
import Register from "./Page/Register.jsx";
import SeatSelection from "./Page/SeatSelection.jsx";
import Payment from "./Page/Payment.jsx";
import PaymentSuccess from "./Page/PaymentSucess.jsx";
import RiwayatTiket from "./Page/RiwayatTiket.jsx";
import About from "./Page/About.jsx";
import Contact from "./Page/Contact.jsx";
import ForgotPassword from "./Page/ForgotPassword.jsx";
import DetailTiket from "./Page/DetailTiket.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Homepage />
          </Layout>
        } />
        
        <Route path="/admin" element={<Admin />}/>
        
        <Route path="/Reservasi/:Judul_Film" element={
          <Layout>
            <Reservasi />
          </Layout>
        } />

        <Route path="/Forgot-Password" element={
          <Layout>
            <ForgotPassword/>
          </Layout>
        } />
        
        <Route path="/Login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        
        <Route path="/Register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        
        <Route path="/seat-selection" element={
          <Layout>
            <SeatSelection />
          </Layout>
        } />
        
        <Route path="/payment" element={
          <Layout>
            <Payment />
          </Layout>
        } />
        
        <Route path="/payment-success" element={
          <Layout>
            <PaymentSuccess />
          </Layout>
        } />
        
        <Route path="/riwayat-tiket" element={
          <Layout>
            <RiwayatTiket />
          </Layout>
        } />
        
        <Route path="/about" element={
          <Layout>
            <About />
          </Layout>
        } />
        
        <Route path="/contact" element={
          <Layout>
            <Contact />
          </Layout>
        } />
        
        <Route path="/detail-tiket" element={
          <Layout>
            <DetailTiket />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App;