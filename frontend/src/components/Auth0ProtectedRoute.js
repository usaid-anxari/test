import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

const Auth0ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [businessStatus, setBusinessStatus] = useState('loading'); // loading, exists, missing, error
  const [userStatus, setUserStatus] = useState('loading'); // loading, active, inactive
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef(null);
  const maxRetries = 2;

  useEffect(() => {
    const checkUserAndBusiness = async () => {
      if (!isAuthenticated || isLoading) return;

      let token;
      try {
        // Try to get token with longer timeout and fallback
        token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
          timeoutInSeconds: 30, // Auth0 built-in timeout
        });
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        // If token fails, assume user needs to create business
        setBusinessStatus('missing');
        setUserStatus('inactive');
        return;
      }

      // Set token immediately after getting it
      axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
      
      try {
        // Simple API call without AbortController to avoid interceptor issues
        const response = await axiosInstance({
          method: 'GET',
          url: '/auth/profile',
          timeout: 15000
        });
        
        if (response.data.user?.isActive === true) {
          setBusinessStatus('exists');
          setUserStatus('active');
        } else {
          setBusinessStatus('missing');
          setUserStatus('inactive');
        }
      } catch (apiError) {
        console.error('API check error:', apiError);
        
        if (apiError.response?.status === 401 || apiError.response?.status === 404) {
          setBusinessStatus('missing');
          setUserStatus('inactive');
        } else if (retryCount < maxRetries && (apiError.name === 'AbortError' || apiError.code === 'ECONNABORTED')) {
          // Retry on timeout/network errors
          setRetryCount(prev => prev + 1);
          timeoutRef.current = setTimeout(() => {
            checkUserAndBusiness();
          }, 2000 * (retryCount + 1)); // Longer exponential backoff
        } else {
          // After max retries, assume user needs business setup
          setBusinessStatus('missing');
          setUserStatus('inactive');
        }
      }
    };

    checkUserAndBusiness();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently, retryCount]);

  // Show loading spinner with retry info
  if (isLoading || businessStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        {retryCount > 0 && (
          <p className="text-gray-600">Retrying connection... ({retryCount}/{maxRetries})</p>
        )}
      </div>
    );
  }

  // Not authenticated - redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }



  // User authenticated but no business - redirect to create business
  if (businessStatus === 'missing' || userStatus === 'inactive') {
    return <Navigate to="/create-business" replace />;
  }

  // User has business - render protected content
  return children;
};

export default Auth0ProtectedRoute;