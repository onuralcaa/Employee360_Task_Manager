import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Employee360</h3>
          <p>Task management made simple for teams of all sizes.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            {/* Add more links as features are implemented */}
          </nav>
        </div>

        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Employee360. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;