import "../style/Login.css";
import {Link} from "react-router-dom";

function Register() {
    const handleRegister = () => {
      // simulasi login
      localStorage.setItem("loggedIn", true);
      alert("Berhasil Register!");
    };
  
    return (
      <div className="login-format">
        <h2>Register</h2>
        <p>Let's get started!</p>
        <div className="group-input">
            <label htmlFor="">Email or Mobile Number</label>
            <input type="text" />
            <label htmlFor="">Password</label>
            <input type="text" />
            <label htmlFor="">Confirm Password</label>
            <input type="text" />
            <Link to={`/Forgot-password`}>Forgot Password</Link>
            <button onClick={handleRegister}>Register</button>
            <p>or sign up with</p>
            <p>Already have an account? <Link to={`/Login`}>Login in</Link></p>
        </div>
      </div>
    );
  }
  
  export default Register;