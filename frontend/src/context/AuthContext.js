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
  const [privateInfo, setPrivateInfo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
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

  // 🚀 OPTIMIZED: Fetch widgets with caching and error handling
  const fetchWidgets = async () => {
    // Skip if already loading or if widgets already exist
    if (widgets.length > 0) return;
    
    try {
      const response = await axiosInstance.get(API_PATHS.WIDGETS.GET_WIDGETS);
      const widgetData = response.data.widgets || [];
      
      setWidgets(widgetData);
      
      // Set default selected widget only if none selected
      if (widgetData.length > 0 && !selectedWidget) {
        setSelectedWidget(widgetData[0]);
      }
    } catch (error) {
      // Only show error if it's not a 404 (no widgets yet)
      if (error.response?.status !== 404) {
        console.error("Error fetching widgets:", error);
        // Don't show toast error for widgets - it's not critical
      }
    }
  };

  // 🚀 OPTIMIZED: Minimal Auth Check - Reduce API calls
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;
      
      if (isAuthenticated && auth0User) {
        try {
          // ✅ STEP 2: Get token only once and cache it
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            },
          });
          axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
             
          // ✅ STEP 3: Set user from Auth0 (no API call needed)
          if (!user || user.sub !== auth0User.sub) {
            setUser(auth0User);
          }

          // ✅ STEP 4: Fetch business info only if needed
          if (!tenant) {
            const businessInfo = await fetchBusinessInfo();
            if (businessInfo) {
              setNeedsOnboarding(false);
              setTenant(businessInfo);
              // ✅ STEP 5: Fetch widgets only after business is confirmed
              setTimeout(() => fetchWidgets(), 100);
            } else {
              setNeedsOnboarding(true);
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          if (error.message?.includes('network') || error.message?.includes('timeout')) {
            toast.error('Connection issue. Please refresh the page.');
          }
        }
      } else {
        if (user || tenant || widgets.length > 0) {
          setUser(null);
          setWidgets([]);
          setTenant("");
          setSelectedWidget(null);
          setNeedsOnboarding(false);
        }
      }
      setLoading(false);
    };
    
    const timeoutId = setTimeout(checkAuth, 50);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, auth0User?.sub, auth0User?.email_verified, isLoading]);


  const fetchBusinessInfo = async () => {
    try {
      refreshNotifications()
      const response = await axiosInstance.get(
        API_PATHS.BUSINESSES?.GET_PRIVATE_PROFILE
      );
      return response.data.business;
    } catch (error) {
      console.error("Failed to fetch business info:", error);
      return null;
    }
  };

  const refreshBusinessInfo = async () => {
    const businessInfo = await fetchBusinessInfo();
    if (businessInfo) {
      setTenant(businessInfo);
    }
    return businessInfo;
  };

  const refreshNotifications = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUSINESSES?.GET_NOTIFICATIONS
      );
      setPrivateInfo(prev => ({
        ...prev,
        business: {
          ...prev?.business,
          unreadNotifications: response?.data?.count || 0,
          reviewNotifications: response?.data?.reviews || []
        }
      }));
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
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
    refreshBusinessInfo,
    refreshNotifications,
    widgets,
    setWidgets,
    selectedWidget,
    setSelectedWidget,
    fetchWidgets,
    needsOnboarding,
    setNeedsOnboarding,
    privateInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
