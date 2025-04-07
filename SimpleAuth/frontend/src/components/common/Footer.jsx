import React from 'react';
import PropTypes from 'prop-types';
import './Footer.css';

function Footer({ copyright }) {
  return (
    <footer className="footer">
      <p>{copyright}</p>
    </footer>
  );
}

Footer.propTypes = {
  copyright: PropTypes.string,
};

Footer.defaultProps = {
  copyright: `© ${new Date().getFullYear()} Employee360. All rights reserved.`,
};

export default Footer;