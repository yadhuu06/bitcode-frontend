import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import store from './store';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import LoadingIndicator from './components/ui/LoadingIndicator';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!googleClientId) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700 text-center">
          Configuration Error: Google Client ID is missing. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<LoadingIndicator />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </Router>
      </Provider>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </GoogleOAuthProvider>
  );
}

export default App;
