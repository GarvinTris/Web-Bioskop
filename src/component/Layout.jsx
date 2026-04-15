import Navbar from "./Navbar";
import "../style/Navbar.css"; // Tambahkan import CSS

function Layout({ children }) {
  console.log("Layout rendering with children:", children);
  
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "75px" }}>{children}</main>
    </>
  );
}

export default Layout;