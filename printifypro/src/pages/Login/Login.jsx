import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUnlockAlt, FaExclamationCircle } from "react-icons/fa";
import "./Login.css";

const Login = ({ onLogin, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await onLogin({ email, password });
      if (result.success && result.token && result.user) {
        localStorage.setItem("token", result.token); // Store token
        localStorage.setItem("user", JSON.stringify(result.user)); // Store user
        setUser && setUser(result.user); // update App user state
        setError("");
        if (result.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Incorrect email or password combination");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="floating-elements">
        <span className="gold-glow"></span>
        <span className="gold-light"></span>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h2>
            <FaSignInAlt className="icon" /> Welcome Back
          </h2>
          <p>Sign in to your PrintifyPro account</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationCircle className="icon" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form-text">We'll never share your email</div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <a href="/forgot-password" className="forgot-password">
                Forgot password?
              </a>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FaUnlockAlt className="icon" /> Login
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="gold-link">
              Sign up
            </a>
          </p>
        </div>

        <div className="social-login mt-4">
          <p className="divider">or continue with</p>
          <div className="social-buttons">
            <button className="social-btn google">
              <img src="/icons/google.svg" alt="Google" />
            </button>
            <button className="social-btn facebook">
              <img src="/icons/facebook.svg" alt="Facebook" />
            </button>
            <button className="social-btn apple">
              <img src="/icons/apple.svg" alt="Apple" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
