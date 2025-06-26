import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import EvangadiLogo from "../../assets/images/EvangadiLogo.png";
import { profileAPI } from "../../utils/api";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (isAuthenticated) {
        try {
          const res = await profileAPI.getProfile();
          setProfilePic(res.data.profile.profile_picture);
        } catch {
          setProfilePic(null);
        }
      } else {
        setProfilePic(null);
      }
    };
    fetchProfilePic();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={EvangadiLogo} alt="Evangadi" className={styles.logoImg} />
          </Link>
        </div>

        {/* Hamburger Icon */}
        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Menu */}
        <nav className={`${styles.nav} ${menuOpen ? styles.showMenu : ""}`}>
          <ul className={styles.navList}>
            <li>
              <Link
                to="/"
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/How"
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className={styles.userInfo}>
                  <Link
                    to="/profile"
                    className={styles.avatarLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        className={styles.headerAvatar}
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                    ) : (
                      <FaUserCircle className={styles.avatarIcon} />
                    )}
                    <span
                      className={`${styles.statusDot} ${
                        isAuthenticated ? styles.green : styles.red
                      }`}
                    ></span>
                  </Link>
                  <span className={styles.welcomeText}>
                    Welcome, {user?.first_name || user?.username}
                  </span>
                </li>
                <li>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className={styles.signinBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  SIGN IN
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
