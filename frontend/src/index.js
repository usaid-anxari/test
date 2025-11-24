import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext"; 
import { Auth0ProviderWithNavigate } from "./layouts/Auth0ProviderWithNavigate";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Auth0ProviderWithNavigate>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Auth0ProviderWithNavigate>
  </BrowserRouter>
);