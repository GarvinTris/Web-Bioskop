import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./component/Navbar.jsx"
import { Movie, Jumbotron } from "./Page/Homepage"
import Admin from "./Page/Admin.jsx"
import Reservasi from "./Page/Reservasi.jsx"
import Login from "./Page/Login.jsx"

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
      </Routes>
    </Router>
  )
}
export default App;