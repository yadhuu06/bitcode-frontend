import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 font-mono">
          Something went wrong in the admin dashboard. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const AdminLayout = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);

  console.log('AdminLayout - accessToken:', accessToken ? 'Present' : 'Missing');
  if (!accessToken) {
    console.log('Redirecting to /admin_login due to missing accessToken');
    return <Navigate to="/admin_login" replace />;
  }

  console.log('AdminLayout rendering children:', children?.type?.name || 'Unknown');

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-black text-white font-mono" role="application" aria-label="Admin Dashboard">
        <Sidebar />
        <main
          className="flex-1 p-8 ml-64 min-h-screen"
          role="main"
          aria-label="Main Content"
        >
          
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;