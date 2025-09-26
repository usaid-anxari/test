import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

const Auth0ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [businessStatus, setBusinessStatus] = useState('loading'); // loading, exists, missing
  const [userStatus, setUserStatus] = useState('loading'); // loading, active, inactive

  useEffect(() => {
    const checkUserAndBusiness = async () => {
      if (!isAuthenticated || isLoading) return;

      try {
        // Get Auth0 token
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        // Set token in axios
        axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
        // Check if user has business
        const response = await axiosInstance.get(API_PATHS.AUTH?.PROFILE);        
        if (response.data.user?.isActive === true) {
          setBusinessStatus('exists');
          setUserStatus('active');
        } else {
          setBusinessStatus('missing');
          setUserStatus('inactive');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // User exists but no business
          setBusinessStatus('missing');
          setUserStatus('inactive');
        } else {
          console.error('Error checking user status:', error);
          setBusinessStatus('missing');
          setUserStatus('inactive');
        }
      }
    };

    checkUserAndBusiness();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // Show loading spinner
  if (isLoading || businessStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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