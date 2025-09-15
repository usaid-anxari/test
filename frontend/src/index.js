import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import { Auth0Provider } from "@auth0/auth0-react";

console.log(process.env.REACT_APP_AUTH0_AUDIENCE);
console.log(process.env.REACT_APP_AUTH0_CLIENT_ID);
console.log(process.env.REACT_APP_AUTH0_DOMAIN);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  
  <BrowserRouter>
 <Auth0Provider
    domain="dev-mfoxs3rbf7swowt7.us.auth0.com"
    clientId="rqsKYczySQrkC2LiKGoIoAo5VAROf64c"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >

    <AuthProvider>
      <App />
    </AuthProvider>
  </Auth0Provider>
  </BrowserRouter>
);

reportWebVitals();
