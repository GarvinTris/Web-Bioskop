import Navbar from "./Navbar"; 

function Layout({ children }) {
  console.log("Layout rendering with children:", children);
  
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default Layout;