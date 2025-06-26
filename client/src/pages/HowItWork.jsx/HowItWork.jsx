import React from 'react'
import styles from './HowItWork.module.css'
import { FaGithub, FaGlobe } from 'react-icons/fa';
import detailQuestionPage from '../../assets/images/Question Detail and answer page.jpg'
import homePage from '../../assets/images/Home page.jpg'
import landingPage from '../../assets/images/landingPage.jpg'
import signupPage from '../../assets/images/signUpPage.jpg' 
import { Link } from 'react-router-dom';

// Team data with placeholder links (replace with actual links)
const teamMembers = [
  { id: 1, firstName: 'Amanuel', lastName: 'Wubneh', role: 'Developer', github: 'https://github.com/AMETIY', portfolio: 'https://amanuelwubneh.com/' },
  { id: 2, firstName: 'Abenezer', lastName: 'Zewge', role: 'Developer', github: '#', portfolio: '#' },
  { id: 3, firstName: 'Helen', lastName: 'Zelalem', role: 'Developer', github: '#', portfolio: '#' },
  { id: 4, firstName: 'Heran', lastName: 'Yimer', role: 'Developer', github: '#', portfolio: '#' },
  { id: 5, firstName: 'Bereket', lastName: 'Abate', role: 'Developer', github: '#', portfolio: '#' },
  { id: 6, firstName: 'Getasew', lastName: 'Kiflea', role: 'Developer', github: '#', portfolio: '#' },
  { id: 7, firstName: 'Sara', lastName: 'Hailu', role: 'Developer', github: '#', portfolio: '#' },
  { id: 8, firstName: 'Bewket', lastName: 'Wondim', role: 'Developer', github: '#', portfolio: '#' },
  { id: 9, firstName: 'Amanuel', lastName: 'Olkaba', role: 'Developer', github: '#', portfolio: '#' },
  { id: 10, firstName: 'Nardos', lastName: 'Weldhana', role: 'Developer', github: '#', portfolio: '#' },
  { id: 11, firstName: 'Abraham', lastName: 'Gebremichael', role: 'Developer', github: '#', portfolio: '#' },
  { id: 12, firstName: 'Nardos', lastName: 'Gidey', role: 'Developer', github: '#', portfolio: '#' },
  { id: 13, firstName: 'Berhanu', lastName: 'Chondro', role: 'Developer', github: '#', portfolio: '#' },
  { id: 14, firstName: 'Kidist', lastName: 'Solomon', role: 'Developer', github: '#', portfolio: '#' }
];






const HowItWork = () => {
  return (
    <div className={styles.howContainer}>
      {/* Section 1: Getting Started */}
      <section className={styles.section}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>How Evangadi Forum Works</h2>
          <p className={styles.introText}>
            Join our community to share knowledge, ask questions, and connect with mentors and peers.
          </p>
          
          <div className={styles.stepsContainer}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              
              <h3 className={styles.stepTitle}>Create Your Account</h3>
              <p className={styles.stepDescription}>
                Sign up with your email, name, and password. Verification ensures a safe community.
              </p>
              <Link to={'/auth'}>
                 <button className={styles.actionButton}>Sign Up Now</button>
              </Link>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Post & Browse Questions</h3>
              <p className={styles.stepDescription}>
                Ask questions with clear titles and details. Browse existing questions by category.
              </p>
                 <Link to={'/'}>
                   <button className={styles.ghostButton}>Browse Questions</button>
                </Link>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Engage with Answers</h3>
              <p className={styles.stepDescription}>
                Provide helpful answers, upvote useful responses, and mark solutions as accepted.
              </p>
                  <button  onClick={() => {
                    const element = document.getElementById('sample');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }}} 
                  className={styles.ghostButton}>View Example</button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Screenshots */}
      <section  id='sample' className={`${styles.section} ${styles.screenshotSection}`}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>Platform Walkthrough</h2>
          <p className={styles.introText}>
            See how community members interact with the platform
          </p>
          
          <div className={styles.screenshotGallery}>
            {/* Replace these divs with your actual screenshot images */}
            <div className={styles.screenshotItem}>
              <div className={styles.screenshotPlaceholder}><img src={landingPage} alt="Landing Page" /></div>
              <p>Landing Page</p>
            </div>
            <div className={styles.screenshotItem}>
              <div className={styles.screenshotPlaceholder}><img src={signupPage} alt="Signup Page" /></div>
              <p>Sign Up Page</p>
            </div>
            <div className={styles.screenshotItem}>
              <div className={styles.screenshotPlaceholder}><img src={homePage} alt="Home page" /></div>
              <p>Posting and viewing questions</p>
            </div>
            <div className={styles.screenshotItem}>
              <div className={styles.screenshotPlaceholder}><img src={detailQuestionPage} alt="Detail question Page" /></div>
              <p>Providing and reviewing answers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Team */}
      <section className={`${styles.section} ${styles.teamSection}`}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={styles.introText}>
            The talented developers who built Evangadi Forum
          </p>
          
          <div className={styles.teamGrid}>
            {teamMembers.map(member => (
              <div key={member.id} className={styles.teamCard}>
                <div className={styles.teamImage}>
                  {/* Placeholder for team member image */}
                  <div className={styles.avatarPlaceholder}>
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                </div>
                <h3 className={styles.teamName}>{member.firstName} {member.lastName}</h3>
                <p className={styles.teamRole}>{member.role}</p>
                <div className={styles.teamLinks}>
                  <a href={member.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub className={styles.icon} />
                  </a>
                  <a href={member.portfolio} target="_blank" rel="noopener noreferrer">
                    <FaGlobe className={styles.icon} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWork