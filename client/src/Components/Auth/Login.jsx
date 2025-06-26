import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ toggleAuthMode, successMessage = "" }) => {
  const emailRef = useRef();
  const passwordRef = useRef();

  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser, user, tokenExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  //  Checking for token expiration message
  useEffect(() => {
    if (tokenExpired) {
      showStatus("Your session has expired. Please login again.", "warning");
    }
  }, [tokenExpired]);

  // Checking for redirected from expired session
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const expired = urlParams.get("expired");

    if (expired === "true") {
      showStatus("Your session has expired. Please login again.", "warning");
    }
  }, [location]);

  // Redirecting if user is already logged in, but NOT if there's a success message to show
  useEffect(() => {
    if (user && !tokenExpired && !status.message) {
      navigate("/", { replace: true });
    }
  }, [user, tokenExpired, navigate, status.message]);

  // Show success message from props on mount
  useEffect(() => {
    if (successMessage) {
      showStatus(successMessage, "success");
    }
    // eslint-disable-next-line
  }, [successMessage]);

  //Simple Message
  const showStatus = (message, type = "error") => {
    setStatus({ message, type });

    // //Auto clear Status after 5 secs
    // setTimeout(() => {
    //   setStatus({ message: "", type: "" });
    // }, 5000);
  };

  //Form Validation Function
  const validateForm = () => {
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    //CHECKING FOR EMPTY FELIDS
    if (!email) {
      showStatus("Please Enter Your Email ", "error");
      emailRef.current.focus();
      return false;
    }

    //email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus("Please enter a valid email address", "error");
      emailRef.current.focus();
      return false;
    }

    if (!password) {
      showStatus("Please Enter Your Password", "error");
      passwordRef.current.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ message: "", type: "" });

    if (!validateForm()) return;

    const credentials = {
      email: emailRef.current.value.trim(),
      password: passwordRef.current.value,
    };

    try {
      setLoading(true);

      const result = await loginUser(credentials);

      if (result.success) {
        showStatus("User Logged in successfully", "success");

        setTimeout(() => {
          navigate("/", { replace: true }); // redirect to home
        }, 1500);
      } else {
        const errorMessage = result.error || "Login failed. Please try again.";
        showStatus(errorMessage, "error");

        emailRef.current.focus(); //Focusing on email field for retry
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Something went wrong!";
      showStatus(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.loginForm}>
          <h2>Login to your account</h2>
          <p className={styles.loginSubtitle}>
            Don't have an account?
            <button
              type="button"
              onClick={toggleAuthMode}
              className={styles.toggleButton}
            >
              Create a new account
            </button>
          </p>

          {status.message && (
            <Alert
              variant={
                status.type === "error"
                  ? "danger"
                  : status.type === "success"
                  ? "success"
                  : "info"
              }
              className="mb-3"
            >
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                placeholder="Your Email"
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordContainer}>
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`${styles.input} ${styles.passwordInput}`}
                  placeholder="Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginSubmitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className={styles.forgotPassword}>
            <Link to="/forgot-password" className={styles.loginLink}>
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>

      {/* Right Container - about and image  */}
      <div className={styles.rightWrapper}>
        <div className={styles.rightWrapperOverlay}></div>
        <div className={styles.rightWrapperContent}>
          <div className={styles.iconContainer}>
            <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 40C25.4247 40 40 25.4247 40 0C40 25.4247 54.5753 40 80 40C54.5753 40 40 54.5753 40 80C40 54.5753 25.4247 40 0 40Z"
                fill="#F39228"
              ></path>
            </svg>
          </div>

          <div className={styles.textContainer}>
            <h1 className={styles.mainHeading}>
              Access To{" "}
              <span className={styles.highlightText}>
                Evangadi Networks Q&A
              </span>
            </h1>
          </div>

          <h4 className={styles.description}>
            <p>
              {" "}
              No matter what stage of life you are in, whether you're just
              starting elementary school or being promoted to CEO of a Fortune
              500 company, you have much to offer to those who are trying to
              follow in your footsteps.
            </p>

            <p>
              {" "}
              Whether you are willing to share your knowledge or you are just
              looking to meet mentors of your own, please start by joining the
              network here.
            </p>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Login;
