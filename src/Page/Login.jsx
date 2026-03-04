import "../style/Login.css";
import {Link} from "react-router-dom";

function Login() {
    const handleLogin = () => {
      // simulasi login
      localStorage.setItem("loggedIn", true);
      alert("Berhasil login!");
    };
  
    return (
      <div className="login-format">
        <h2>Login Page</h2>
        <p>Let's get started!</p>
        <div className="group-input">
            <label htmlFor="">Email or Mobile Number</label>
            <input type="text" />
            <label htmlFor="">Password</label>
            <input type="text" />
            <Link to={`/Forgot-password`}>Forgot Password</Link>
            <button onClick={handleLogin}>Login</button>
            <p>or sign up with</p>
            <div className="shortcut-login">
                <button className="google"></button>
                <button className="facebook"></button>
                <button className="biometrik"></button>
            </div>
            <p>Don't have an account?<Link to={`/Regis`}>Sign up</Link></p>
        </div>
      </div>
    );
  }
  
  export default Login;