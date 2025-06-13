import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';
import { FaAngleRight, FaUserCircle } from 'react-icons/fa';
import EvangadiLogo from '../../assets/images/EvangadiLogo.png'


const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/">
            <img src = {EvangadiLogo} alt="Evangadi" className={styles.logoImg} />
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link to="/" className={styles.navLink}>Home</Link></li>
            <li><Link to="/about" className={styles.navLink}>How it works</Link></li>
            {isAuthenticated ? (
              <>
                <li className={styles.userInfo}>
                  <FaUserCircle className={styles.icon} size={65} />
                  Welcome, {user?.first_name || user?.username}
                </li>
                <li>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth" className={styles.signinBtn}>
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
