import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./component/Navbar.jsx"
import { Movie, Jumbotron } from "./Page/Homepage"
import Admin from "./Page/Admin.jsx"
import Reservasi from "./Page/Reservasi.jsx"
import Login from "./Page/Login.jsx"
import Register from "./Page/Register.jsx"
import SeatSelection from "./Page/SeatSelection.jsx";
import Payment from "./Page/Payment.jsx";
import PaymentSuccess from "./Page/PaymentSucess.jsx";
import HistoryTransaksi from "./Page/HistoryTransaksi.jsx";

function HomePage() {
  return (
    <>
      <Navbar />
      <Jumbotron />
      <Movie />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/Reservasi/:Judul_Film" element={<Reservasi />} />
        <Route path="/Login" element={<Login />}></Route>
        <Route path="/Register" element={<Register />}></Route>
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/riwayat-transaksi" element={<HistoryTransaksi />} />
      </Routes>
    </Router>
  )
}
export default App;