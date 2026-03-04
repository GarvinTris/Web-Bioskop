function Navbar(){
    return(
        <>
            <nav>
                <div className="layout">
                    <i className="fa-solid fa-bars"></i>
                    <select className="dropdown">
                        <option value="en">EN</option>
                        <option value="id">ID</option>
                    </select>
                    <h1>FilmOut</h1>
                </div>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Movies</a></li>
                    <li><a href="#">TV Shows</a></li>
                    <li>|</li>
                    <li><a href="/Login">Login</a></li>
                </ul>
            </nav>
        </>
    )
}
export default Navbar