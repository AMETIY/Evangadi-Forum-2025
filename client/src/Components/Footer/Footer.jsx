import React from 'react';
import styles from './Footer.module.css';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import EvangadiLogo from '../../assets/images/EvangadiLogo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* Logo and Social Links Section */}
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <img 
                src={EvangadiLogo} 
                alt="Evangadi" 
                className={styles.footerLogoImg} 
              />
            </div>
            <div className={styles.socialLinks}>
              <Link 
                to = "https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <FaFacebook />
              </Link>
              <Link 
                to ="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <FaInstagram />
              </Link>
              <Link 
                to ="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="YouTube"
              >
                <FaYoutube />
              </Link>
            </div>
          </div>

          {/* Useful Links Section */}
          <div className={styles.footerSection}>
            <div className={styles.footerLinks}>
              <h4>Useful Link</h4>
              <ul>
                <li><Link to ="/about">How it works</Link></li>
                <li><Link to ="https://www.evangadi.com/legal/terms/">Terms of Service</Link></li>
                <li><Link to ="https://www.evangadi.com/legal/privacy/">Privacy policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className={styles.footerSection}>
            <div className={styles.footerContact}>
              <h4>Contact Info</h4>
              <div className={styles.contactInfo}>
                <p className={styles.companyName}>Evangadi Networks</p>
                <p>support@evangadi.com</p>
                <p>+1-202-386-2702</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2024 Evangadi Networks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;