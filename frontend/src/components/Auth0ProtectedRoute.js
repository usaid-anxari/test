import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../service/axiosInstanse';

const Auth0ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  
  // States: 'LOADING' | 'AUTHORIZED' | 'NEEDS_SETUP' | 'ERROR'
  const [status, setStatus] = useState('LOADING'); 
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const MAX_RETRIES = 2;

    const verifyUserStatus = async (currentRetry = 0) => {
      // 1. If Auth0 is still loading, wait.
      if (isLoading) return;

      // 2. If not authenticated, we stop (render will handle redirect).
      if (!isAuthenticated) {
        if (isMounted) setStatus('UNAUTHORIZED');
        return;
      }

      try {
        // 3. Get Token
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        // 4. Call API (Pass token explicitly here, don't set global default)
        const response = await axiosInstance.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10s timeout
        });

        if (!isMounted) return;

        // 5. Check Business Logic
        if (response.data.user?.isActive === true) {
          setStatus('AUTHORIZED');
        } else {
          setStatus('NEEDS_SETUP');
        }

      } catch (error) {
        if (!isMounted) return;
        console.error('Profile Check Error:', error);

        // 6. Handle Specific Errors
        const status = error.response?.status;

        // If 404 (Not Found) or 401 (Unauthorized API), assume user needs setup
        if (status === 404 || status === 401) {
          setStatus('NEEDS_SETUP');
          return;
        }

        // If Network Error or Timeout, Try Again
        if (currentRetry < MAX_RETRIES) {
          setRetryCount(currentRetry + 1);
          setTimeout(() => verifyUserStatus(currentRetry + 1), 2000);
        } else {
          // If we exhausted retries, show error screen (don't redirect blindly)
          setStatus('ERROR'); 
        }
      }
    };

    verifyUserStatus();

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // --- RENDER LOGIC ---

  // 1. Loading State (Auth0 loading OR API checking)
  if (isLoading || status === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Verifying account...</p>
        {retryCount > 0 && (
           <span className="text-xs text-orange-500 mt-2">Taking longer than usual...</span>
        )}
      </div>
    );
  }

  // 2. Not Logged In -> Go to Home
  if (!isAuthenticated || status === 'UNAUTHORIZED') {
    return <Navigate to="/" replace />;
  }

  // 3. Logged In but No Business/Inactive -> Go to Create Business
  if (status === 'NEEDS_SETUP') {
    return <Navigate to="/create-business" replace />;
  }

  // 4. Fatal Error (Server down, etc) -> Don't redirect, show message
  if (status === 'ERROR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-4">We couldn't verify your account status. Please check your internet.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // 5. Success -> Render the Protected Page
  return children;
};

export default Auth0ProtectedRoute;