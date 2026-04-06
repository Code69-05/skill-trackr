import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import "./Auth.css";

export const Auth = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLogin = mode === "login";

  const validateSignup = () => {
    const newErrors = {};
    const name = signupData.name.trim();
    const email = signupData.email.trim();
    const password = signupData.password;
    const confirmPassword = signupData.confirmPassword;

    if (!name) newErrors.name = "Full name is required.";
    else if (name.length < 2) newErrors.name = "Full name must be at least 2 characters.";

    if (!email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    else if (!/[A-Z]/.test(password)) newErrors.password = "Password must contain at least one uppercase letter.";
    else if (!/[a-z]/.test(password)) newErrors.password = "Password must contain at least one lowercase letter.";
    else if (!/[0-9]/.test(password)) newErrors.password = "Password must contain at least one number.";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = "Email is required.";
    if (!loginData.password) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
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
      await signInWithEmailAndPassword(auth, loginData.email.trim(), loginData.password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch {
      setErrors({ general: "Invalid login credentials." });
    } finally {
      setLoading(false);
    }
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
        signupData.email.trim(),
        signupData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: signupData.name.trim(),
        email: signupData.email.trim(),
        provider: "email",
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already in use." });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address." });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak. Use a stronger password." });
      } else {
        toast.error("Something went wrong during signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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

      toast.success(isLogin ? "Google login successful!" : "Google signup successful!");
      navigate("/dashboard");
    } catch (error) {
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const panelTransition = {
    duration: 0.45,
    ease: "easeInOut",
  };

  const formVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 40 },
  };

  const logoVariants = {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 40 },
  };

  const loginForm = (
    <motion.div
      key="login-form"
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={panelTransition}
      className="panel-content"
    >
      <h2 className="panel-title">Login</h2>
      <p className="panel-subtitle">Welcome back</p>

      {errors.general && <p className="error-message">{errors.general}</p>}

      <form onSubmit={handleLogin} className="auth-form">
        <div className="field-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleLoginChange}
            className="auth-input"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="field-group">
          <div className="password-field">
            <input
              type={showLoginPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="auth-input"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <p className="helper-text">Forgot Password? (Coming soon)</p>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleAuth} className="google-btn" disabled={loading}>
        <FcGoogle size={20} />
        <span>{loading ? "Loading..." : "Continue with Google"}</span>
      </button>

      <p className="switch-text">
        Don&apos;t have an account?{" "}
        <button type="button" className="switch-btn" onClick={() => setMode("signup")}>
          Sign Up
        </button>
      </p>
    </motion.div>
  );

  const signupForm = (
    <motion.div
      key="signup-form"
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={panelTransition}
      className="panel-content"
    >
      <h2 className="panel-title">Signup</h2>
      <p className="panel-subtitle">Create your account</p>

      {errors.general && <p className="error-message">{errors.general}</p>}

      <form onSubmit={handleSignup} className="auth-form" noValidate>
        <div className="field-group">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={signupData.name}
            onChange={handleSignupChange}
            className="auth-input"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        <div className="field-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupData.email}
            onChange={handleSignupChange}
            className="auth-input"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="field-group">
          <div className="password-field">
            <input
              type={showSignupPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleSignupChange}
              className="auth-input"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowSignupPassword(!showSignupPassword)}
            >
              {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <div className="field-group">
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              className="auth-input"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleAuth} className="google-btn" disabled={loading}>
        <FcGoogle size={20} />
        <span>{loading ? "Loading..." : "Sign up with Google"}</span>
      </button>

      <p className="switch-text">
        Already have an account?{" "}
        <button type="button" className="switch-btn" onClick={() => setMode("login")}>
          Login
        </button>
      </p>
    </motion.div>
  );

  const logoPanel = (
    <motion.div
      key={`logo-${mode}`}
      variants={logoVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.08 }}
      className="panel-content brand-content"
    >
      <h1 className="brand-title">Skill Trackr</h1>
      <p className="brand-subtitle">
        Track your skills. Build projects. Measure progress. Grow your career.
      </p>
    </motion.div>
  );

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-overlay"></div>

      <div className={`auth-container ${mode}`}>
        <div className="panel left-panel">
          <AnimatePresence mode="wait">
            {isLogin ? logoPanel : signupForm}
          </AnimatePresence>
        </div>

        <div className="panel right-panel">
          <AnimatePresence mode="wait">
            {isLogin ? loginForm : logoPanel}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

//export default Auth;
