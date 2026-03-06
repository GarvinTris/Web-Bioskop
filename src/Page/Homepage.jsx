import { Link } from "react-router-dom"
import "../style/Home.css"
import { useEffect, useState } from "react";

function Movie() {
    const [films, setFilms] = useState([]);

    useEffect(() => {
        fetch("http://localhost/24SI1_PHP/Bioskop.php")
        .then(response => response.json())
        .then(data => setFilms(data))
        .catch(error => console.log(error));
    }, []);
    
    return (
        <section>
            <h1>Now Showing In Cinema!</h1>
            <div className="rekomen">

            {films.map((movie, index) => (
                <div className="card" key={index}>
                    <Link to={`/Reservasi/${encodeURIComponent(movie.Judul_Film)}`} ><img src={`http://localhost/24SI1_PHP/uploads/${movie.image}`} alt={movie.Judul_Film} /></Link>
                    <h2>{movie.Judul_Film}</h2>
                </div>
            ))}
            </div>
        </section>
    );
  }

  function Jumbotron() {
    return (
        <div className="jumbotron">
            <h1>Experience the Magic of Cinema</h1>
            <p>Discover the latest blockbusters, book your seat, and enjoy the ultimate movie experience.</p>
            <input type="text" placeholder="Search your favorite movie..." />
            <img src="/Backgrounds.jpg" alt="Movie BG" />
        </div>
    );
  }
  
export {Movie,Jumbotron};