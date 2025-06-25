import React, { useState } from "react";
import Login from "../../Components/Auth/Login";
import SignUp from "../../Components/Auth/SignUp";
import styles from "./AuthPage.module.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };
  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <div className={styles.authLeft}>
            <div className={styles.authFormContainer}>
              {isLogin ? (
                <Login toggleAuthMode={toggleAuthMode} />
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
