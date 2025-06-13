import React, { useRef, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

const Login = ({toggleAuthMode}) => {
  const emailRef = useRef();
  const passwordRef = useRef();

  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState();

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  //Simple Message
  const showStatus = (message, type) => {
    setStatus({ message, type });

    //Auto clear Status after 5 secs
    setTimeout(() => {
      setStatus({ message: "", type: "" });
    }, 5000);
  };

  //Form Validation Function
  const validateForm = () => {
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    //CHECKING FOR EMPTY FELIDS
    if (!email || !password) {
      showStatus("Please Enter All the required fields ", "error");
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

      console.log(result);

      // showStatus("User Logged in successfully", "success");

      if (result.success) {
        showStatus("User Logged in successfully", "success");
        setTimeout(() => {
          navigate("/"); // redirect to home
        }, 1500);
      } else {
        showStatus(
          result.error || "Registration failed. Please try again later."
        );
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
        <div className="login-form">
          <h2>Login to your account</h2>
          <p className="login-subtitle">
            Don't have an account?
            <span className="login-link">
              <Button
                type="button"
                onClick={toggleAuthMode}
                variant="primary"
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc3545",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Create a new account
              </Button>
            </span>
          </p>

          {status.message && (
            <Alert variant={status.type === "error" ? "danger" : "success"}>
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
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

            <div className="form-group">
              <input
                ref={passwordRef}
                type="password"
                id="password"
                name="password"
                className={styles.input}
                placeholder="Password"
                disabled={loading}
              />
            </div>

            <Button
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
            </Button>
          </form>

          <p className="forgot-password">
            <Link to="#" className="login-link">
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
                Top Courses And Job Training
              </span>
            </h1>
          </div>

          <h4 className={styles.description}>
            Whether you are willing to share your knowledge or looking to meet
            mentors of your own, start by joining the network here.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Login;
