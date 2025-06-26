import React, { useState, useEffect } from "react";
import Login from "../../Components/Auth/Login";
import SignUp from "../../Components/Auth/SignUp";
import styles from "./AuthPage.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AuthPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  // Read mode from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "signup") setIsLogin(false);
    else if (mode === "login") setIsLogin(true);
  }, [location.search]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Accept an optional message to show on login
  const toggleAuthMode = (message = "") => {
    setIsLogin((prev) => !prev);
    setLoginSuccessMessage(message);
  };

  if (loading) return null;

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <div className={styles.authLeft}>
            <div className={styles.authFormContainer}>
              {isLogin ? (
                <Login
                  toggleAuthMode={toggleAuthMode}
                  successMessage={loginSuccessMessage}
                />
              ) : (
                <SignUp toggleAuthMode={toggleAuthMode} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
