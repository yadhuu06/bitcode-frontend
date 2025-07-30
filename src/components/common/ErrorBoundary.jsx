import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Optionally send to a logging service (Sentry, LogRocket, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 font-mono text-center">
          <p className="mb-2">Your Battle is Getting Crashed.</p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
};

export default ErrorBoundary;
