import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Auth0Signup = () => {
  const { loginWithRedirect, isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const handleSignup = async () => {
    try {
      const user =   await loginWithRedirect({
      screen_hint: "signup",
      redirect_uri: window.location.origin,
    });      
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
        <button onClick={handleSignup}>Signup with Auth0</button>
      ) : (
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleGetToken}>Get Token</button>
        </div>
      )}
    </div>
  );
};

export default Auth0Signup;
