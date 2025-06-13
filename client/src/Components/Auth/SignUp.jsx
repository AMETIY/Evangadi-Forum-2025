import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";

const SignUp = ({ toggleAuthMode }) => {
  //Ref for form inputs
  const usernameRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();
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
    const userName = usernameRef.current.value.trim();
    const firstName = firstNameRef.current.value.trim();
    const lastName = lastNameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    //CHECKING FOR EMPTY FELIDS
    if (!email || !password || !userName || !firstName || !lastName) {
      showStatus("Please Enter All the required fields ", "error");
      return false;
    }

    // Password length validation
    if (password.length < 8) {
      showStatus("Password must be at least 8 characters long", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    if (!validateForm()) return;
  
    const userData = {
      first_name: firstNameRef.current.value.trim(),
      last_name: lastNameRef.current.value.trim(),
      username: usernameRef.current.value.trim(),
      email: emailRef.current.value.trim(),
      password: passwordRef.current.value,
    };

    try {
      setLoading(true);

      const result = await registerUser(userData);

      if (result.success) {
        showStatus("User registered successfully", "success");
        setTimeout(() => {
          navigate("/auth"); // redirect to login
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
    <div className={styles.authPageContainer}>
      {/* Left Container - Form */}
      <div className={styles.leftContainer}>
        <div className={styles.authForm}>
          <h2 className={styles.title}>Join the network</h2>
          <p className={styles.authSubtitle}>
            Already have an account?
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
              Sign in
            </Button>
          </p>

          {status.message && (
            <Alert variant={status.type === "error" ? "danger" : "success"}>
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

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <input
                  ref={firstNameRef}
                  type="text"
                  id="first_name"
                  name="first_name"
                  className={styles.input}
                  placeholder="First Name"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <input
                  ref={lastNameRef}
                  type="text"
                  id="last_name"
                  name="last_name"
                  className={styles.input}
                  placeholder="Last Name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                className={styles.input}
                placeholder="Username"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
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
              className={styles.authSubmitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Registering...
                </>
              ) : (
                "Agree and Join"
              )}
            </Button>
          </form>

          <p className={styles.terms}>
            I agree to the{" "}
            <Link
              to="https://www.evangadi.com/legal/privacy/"
              className="auth-link"
            >
              privacy policy
            </Link>{" "}
            and{" "}
            <Link
              to="https://www.evangadi.com/legal/terms/"
              className={styles.authLink}
            >
              terms of service
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Container - about and image  */}
      {/* <div className={styles.rightWrapper}>
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 40C25.4247 40 40 25.4247 40 0C40 25.4247 54.5753 40 80 40C54.5753 40 40 54.5753 40 80C40 54.5753 25.4247 40 0 40Z"
            fill="#F39228"
          ></path>
        </svg>

        <div className={styles.textContainer}>
          <h1>
            Access To <span>Top Courses And Job Training</span>
          </h1>
        </div>
        <h4>
          Whether you are willing to share your knowledge or looking to meet
          mentors of your own, start by joining the network here.
        </h4>
      </div> */}
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

export default SignUp;
