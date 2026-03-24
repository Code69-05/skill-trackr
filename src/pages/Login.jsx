import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebase/firebaseConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateLogin = () => {
    const newErrors = {};
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validateLogin();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setErrors({ general: "Invalid email or password." });
        return;
      }

      if (error.code === "auth/too-many-requests") {
        setErrors({
          general: "Too many failed attempts. Please try again later.",
        });
        return;
      }

      toast.error("Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    setErrors({});

    try {
      setLoading(true);

      await signInWithPopup(auth, provider);

      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {errors.general && (
        <p style={{ color: "red", marginBottom: "12px" }}>{errors.general}</p>
      )}

      <form onSubmit={handleLogin} noValidate>
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <p style={{ color: "red", marginTop: "6px" }}>{errors.email}</p>
        )}

        <br /><br />

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    className="w-full pr-10 px-3 py-2"
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

        {errors.password && (
          <p style={{ color: "red", marginTop: "6px" }}>{errors.password}</p>
        )}

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <br />

      <button type="button" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Loading..." : "Continue with Google"}
      </button>

      <p>
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
