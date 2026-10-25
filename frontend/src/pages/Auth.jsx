import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import { supabase } from "../utils/supabaseClient";

export default function Auth({ defaultMode = "login" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, loginAsDemo } = useAuth();

  const isInitialSignup =
    defaultMode === "signup" ||
    location.pathname === "/signup" ||
    location.search.includes("mode=signup");

  const [mode, setMode] = useState(isInitialSignup ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Password strength calculator
  const pwdStrength = useMemo(() => {
    if (!password) return { score: 0, text: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["", "Weak", "Medium", "Strong"];
    return { score, text: labels[score] || "Weak" };
  }, [password]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password, remember: rememberMe });
        setSuccessMessage("Welcome back! Loading your Japan travel dashboard...");
      } else {
        await signup({
          name,
          email,
          password,
          travelStyle: "Balanced comfort",
        });
        setSuccessMessage("Account created successfully! Welcome to Nihon.");
      }

      setTimeout(() => {
        navigate("/plan");
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (profileKey = "arjun") => {
    setLoading(true);
    setErrorMessage("");
    const demo = loginAsDemo(profileKey);
    setSuccessMessage(`Signed in as ${demo.name}! Redirecting...`);
    setTimeout(() => {
      navigate("/plan");
    }, 600);
  };

  const handleSocialLogin = async (provider) => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase(), // 'google' ya 'apple'
      options: {
        redirectTo: `${window.location.origin}/plan`,
      },
    });
    if (error) throw error;
  } catch (err) {
    setErrorMessage(err.message || "Social login failed.");
    setLoading(false);
  }
};
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
    }, 2400);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("auth-modal-backdrop")) {
      navigate("/");
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal-popup-container">
        <div className="auth-card">
          {/* Top Navigation Row */}
          <div className="auth-top-nav">
            <Link to="/" className="auth-back-btn">
              <ArrowLeft size={16} />
              <span>Return to home</span>
            </Link>
            <span className="auth-lang-badge">日本語 · ENGLISH</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs-wrapper">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Create Account
            </button>
          </div>

          {/* Welcome Headings */}
          <div className="auth-headings">
            <span className="auth-headings-kanji">
              {mode === "login" ? "おかえりなさい · WELCOME BACK" : "ようこそ · JOIN NIHON"}
            </span>
            <h2>
              {mode === "login"
                ? "Sign in to your journey."
                : "Begin your Japan adventure."}
            </h2>
            <p>
              {mode === "login"
                ? "Access your saved travel schedules, dining cards, and yen budget plans."
                : "Create your free traveler companion account in less than a minute."}
            </p>
          </div>

          {/* Quick 1-Click Demo Traveler Login */}
          <div className="auth-demo-banner">
            <div className="auth-demo-info">
              <div className="auth-demo-icon">
                <Zap size={16} />
              </div>
              <div>
                <span className="auth-demo-title">Fast Hackathon Review</span>
                <span className="auth-demo-desc">
                  Instant 1-click login as Arjun Sharma
                </span>
              </div>
            </div>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => handleQuickDemo("arjun")}
            >
              Demo Sign In
            </button>
          </div>

          {/* Social Authentication */}
          <div className="auth-social-row">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialLogin("Apple")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#292b27">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.79 1.1-1.9 1.01-2.89-.96.04-2.11.64-2.77 1.43-.59.69-1.1 1.8-1 2.88 1.07.08 2.14-.58 2.76-1.42z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="auth-alert-box error" role="alert">
              <AlertCircle size={17} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert-box success" role="alert">
              <CheckCircle2 size={17} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><User size={18} /></span>
                  <input
                    id="auth-name"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={18} /></span>
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-pwd">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={18} /></span>
                <input
                  id="auth-pwd"
                  type={showPassword ? "text" : "password"}
                  className="auth-input has-toggle"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === "signup" && password && (
                <div className="auth-pwd-strength">
                  <div className="auth-strength-bars">
                    <div className={`auth-strength-bar ${pwdStrength.score >= 1 ? "medium" : ""}`} />
                    <div className={`auth-strength-bar ${pwdStrength.score >= 2 ? "strong" : ""}`} />
                  </div>
                  <span className="auth-strength-text">{pwdStrength.text}</span>
                </div>
              )}
            </div>

            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              {mode === "login" && (
                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Nihon" : "Create My Account"}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-prompt">
            {mode === "login" ? (
              <span>
                New to Nihon?{" "}
                <button type="button" className="auth-switch-link" onClick={() => switchMode("signup")}>
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button type="button" className="auth-switch-link" onClick={() => switchMode("login")}>
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="auth-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset your password</h3>
            <p>Enter your email and we'll send you a recovery link.</p>

            {forgotSent ? (
              <div className="auth-alert-box success">
                <CheckCircle2 size={18} />
                <span>Reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Mail size={18} /></span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button type="button" className="button-text" style={{ flex: 1 }} onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="auth-submit-btn" style={{ flex: 2, height: "42px" }}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}