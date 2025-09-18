import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import { useAuth0 } from "@auth0/auth0-react";

export const AuthContext = createContext();

const getInitialData = (key, initialValue) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to parse localStorage item: ${key}`, e);
      return initialValue;
    }
  }
  return initialValue;
};

const AuthProvider = ({ children }) => {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently, isLoading } = useAuth0();
  const [tenant, setTenant] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(
    getInitialData("subscription", {
      plan: "Starter",
      status: "inactive", // inactive | pending | active
      startedAt: null,
    })
  );
  const [billingInfo, setBillingInfo] = useState(
    getInitialData("billingInfo", null)
  );
  // New state variables for widgets
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);

  // New function to fetch widgets and set state
  const fetchWidgets = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.WIDGETS.GET_WIDGETS
      );
      const widgetData = response.data.widgets || [];
      setWidgets(widgetData);
      if (widgetData.length > 0) {
        setSelectedWidget(widgetData[0]); // Select the first widget by default
      }
    } catch (error) {
      toast.error("Failed to fetch widgets.");
      console.error("Error fetching widgets:", error);
    }
  };

  // Check for Auth0 authentication and fetch business info
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;
      
      if (isAuthenticated && auth0User) {
        try {
          // Get Auth0 token
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            },
          });

          // Set token in axios
          axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;

          // Set user from Auth0
          setUser(auth0User);

          // Try to fetch business info
          const businessInfo = await fetchBusinessInfo();
          if (businessInfo) {
            setTenant(businessInfo);
            await fetchWidgets();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      } else {
        setUser(null);
        setTenant("");
        setWidgets([]);
        setSelectedWidget(null);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, auth0User, isLoading, getAccessTokenSilently]);

  const fetchBusinessInfo = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
      );
      return response.data.business;
    } catch (error) {
      console.error("Failed to fetch business info:", error);
      return null;
    }
  };

  // Set The User
  const updateUser = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Auth0 handles login, so this is simplified
  const login = async () => {
    // Auth0 login is handled by loginWithRedirect in components
    toast.success("Login successful!");
    return { success: true };
  };

  const loginPlatform = async (platform) => {
    const mockUser = {
      id: `platform_${platform}_${Date.now()}`,
      role: "admin",
      businessName: `My ${platform} Store`,
      publicReviewUrl: `my-${platform}-store`,
    };

    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    toast.success(`Connected to ${platform}.`);
    return mockUser;
  };

  // Auth0 handles signup, so this is simplified
  const signup = async () => {
    // Auth0 signup is handled by loginWithRedirect in components
    toast.success("Account created successfully!");
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setTenant("");
    setWidgets([]);
    setSelectedWidget(null);
    // Auth0 logout is handled in components
  };

  const selectPlan = (planName) => {
    const updated = {
      plan: planName,
      status: "pending",
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem("subscription", JSON.stringify(updated));
    setSubscription(updated);
    toast.success(`${planName} plan selected. Add billing to activate.`);
  };

  const saveBilling = (info) => {
    localStorage.setItem("billingInfo", JSON.stringify(info));
    setBillingInfo(info);
    const updated = { ...subscription, status: "active" };
    localStorage.setItem("subscription", JSON.stringify(updated));
    setSubscription(updated);
    toast.success("Billing information saved. Subscription active.");
  };

  const planFeatures = {
    Starter: new Set(["basic_moderation", "widget_embed", "layout_carousel"]),
    Pro: new Set([
      "basic_moderation",
      "advanced_moderation",
      "widget_embed",
      "analytics",
      "priority_support",
      "layout_carousel",
      "layout_grid",
      "layout_wall",
      "layout_spotlight",
    ]),
    Enterprise: new Set([
      "basic_moderation",
      "advanced_moderation",
      "widget_embed",
      "analytics",
      "priority_support",
      "api_access",
      "layout_carousel",
      "layout_grid",
      "layout_wall",
      "layout_spotlight",
    ]),
  };

  const hasFeature = (feature) => {
    const plan = subscription?.plan || "Starter";
    return planFeatures[plan]?.has(feature) || true;
  };

  const value = {
    user,
    updateUser,
    loading,
    login,
    signup,
    logout,
    getInitialData,
    loginPlatform,
    subscription,
    billingInfo,
    selectPlan,
    saveBilling,
    hasFeature,
    setTenant,
    tenant,
    // Provide the new state and functions here
    widgets,
    setWidgets,
    selectedWidget,
    setSelectedWidget,
    fetchWidgets,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
