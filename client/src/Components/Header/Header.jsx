// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import styles from "./Header.module.css";
// import { FaUserCircle } from "react-icons/fa";
// import EvangadiLogo from "../../assets/images/EvangadiLogo.png";

// const Header = () => {
//   const { user, isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/auth");
//   };

//   return (
//     <header className={styles.header}>
//       <div className={styles.headerContainer}>
//         <div className={styles.logo}>
//           <Link to="/">
//             <img src={EvangadiLogo} alt="Evangadi" className={styles.logoImg} />
//           </Link>
//         </div>

//         <nav className={styles.nav}>
//           <ul className={styles.navList}>
//             <li>
//               <Link to="/" className={styles.navLink}>
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link to="/How" className={styles.navLink}>
//                 How it works
//               </Link>
//             </li>
//             {isAuthenticated ? (
//               <>
//                 <li className={styles.userInfo}>
//                   <FaUserCircle className={styles.avatarIcon} />
//                   <span className={`${styles.icon} ${user ? styles.green : styles.red}`}>{" "}</span>
//                   <span className={styles.welcomeText}>
//                     Welcome, {user?.first_name || user?.username}
//                   </span>
//                 </li>

//                 <li>
//                   <button onClick={handleLogout} className={styles.logoutBtn}>
//                     LOGOUT
//                   </button>
//                 </li>
//               </>
//             ) : (
//               <li>
//                 <Link to="/auth" className={styles.signinBtn}>
//                   SIGN IN
//                 </Link>
//               </li>
//             )}
//           </ul>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import EvangadiLogo from "../../assets/images/EvangadiLogo.png";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
                  {/* Avatar shown only on desktop */}
                  <FaUserCircle
                    className={`${styles.avatarIcon} ${styles.desktopOnly}`}
                  />
                  <span
                    className={`${styles.icon} ${
                      user ? styles.green : styles.red
                    } ${styles.desktopOnly}`}
                  ></span>
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
