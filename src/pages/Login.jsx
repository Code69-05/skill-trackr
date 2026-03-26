import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import "./Login.css"; // <--- Import your CSS file here
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebase/firebaseConfig";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      setErrors({ general: "Invalid login credentials." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* LEFT SIDE */}
      <div className="left-panel">
        <h1 className="logo-text">Skill-Trackr</h1>
        <p className="tagline">Track your skills. Grow your career.</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">
        <div className="form-container">
          <h1 className="login-header">Login</h1>
          <p className="welcome-back">Welcome Back</p>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input-field"
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input-field"
              onChange={handleChange}
            />

            <Link to="/forgot" className="forgot-link">
              Forgot Password?
            </Link>

            <button type="submit" className="login-submit-btn">
              Login
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-btn"
            >
              {/* Wrap the logo to give it a white background */}
              <span className="logo-wrapper">
                <FcGoogle size={20} />
              </span>
              <span className="btn-text">Continue with Google</span>
            </button>
          </form>

          <p className="footer-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
