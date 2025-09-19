import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Auth0Login = () => {
  const {
    loginWithRedirect,
    isAuthenticated,
    user,
    getAccessTokenSilently,
    logout,
  } = useAuth0();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle email verification success redirect
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true' && isAuthenticated) {
      toast.success('Email verified successfully! Welcome to TrueTestify.');
      // Redirect to dashboard or home after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [searchParams, isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      const user = await loginWithRedirect();
      console.log(user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      console.log("Access Token:", token);
      alert("Check console for token");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with Auth0</button>
      ) : (
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleGetToken}>Get Token</button>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth0Login;
