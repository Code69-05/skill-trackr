import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateSignup = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      newErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
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

  const handleSignup = async (e) => {
    e.preventDefault();

    const validationErrors = validateSignup();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        provider: "email",
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already in use." });
        return;
      }

      if (error.code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address." });
        return;
      }

      if (error.code === "auth/weak-password") {
        setErrors({
          password: "Password is too weak. Use a stronger password.",
        });
        return;
      }

      toast.error("Something went wrong during signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();

    setErrors({});

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "No Name",
          email: user.email,
          provider: "google",
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Google signup successful!");
      navigate("/dashboard");
    } catch (error) {
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      toast.error("Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>

      {errors.general && (
        <p style={{ color: "red", marginBottom: "12px" }}>{errors.general}</p>
      )}

      <form onSubmit={handleSignup} noValidate>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && (
          <p style={{ color: "red", marginTop: "6px" }}>{errors.name}</p>
        )}

        <br /><br />

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
    className="w-full pr-10"
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

        {errors.password && (
          <p style={{ color: "red", marginTop: "6px" }}>{errors.password}</p>
        )}

        <br /><br />

        <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    placeholder="Confirm Password"
    value={formData.confirmPassword}
    onChange={handleChange}
    className="w-full pr-10"
  />

  <span
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
  >
    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

        {errors.confirmPassword && (
          <p style={{ color: "red", marginTop: "6px" }}>
            {errors.confirmPassword}
          </p>
        )}

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <br />

      <button type="button" onClick={handleGoogleSignup} disabled={loading}>
        {loading ? "Loading..." : "Continue with Google"}
      </button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;