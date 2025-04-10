import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page or returning to the dashboard.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
          <div className="error-actions">
            <button className="retry-button" onClick={this.handleRefresh}>
              Try again
            </button>
            <Link to="/" className="home-link">
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};