import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";

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
  const fetchWidgets = async (tenantId) => {
    if (!tenantId) return;
    try {
      const response = await axiosInstance.get(
        API_PATHS.WIDGETS.LIST_WIDGETS(tenantId)
      );
      setWidgets(response.data);
      if (response.data.length > 0) {
        setSelectedWidget(response.data); // Select the first widget by default
      }
    } catch (error) {
      toast.error("Failed to fetch widgets.");
      console.error("Error fetching widgets:", error);
    }
  };

  // Check for existing user and token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = getInitialData("user", null);
      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching user info
          const response = await axiosInstance.get(
            API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
          );
          setUser(response.data);
        } catch (error) {
          console.error("Token validation failed:", error);
          // Clear invalid token and user data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchTenantInfo = async (tenantId) => {
    try {
      // Correcting the API path
      const response = await axiosInstance.get(
        API_PATHS.TENANTS.GET_TENANTS(tenantId)
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tenant info:", error);
    }
  };

  // Set The User
  const updateUser = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });
      console.log(response);

      const { token, payload: payloadData } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(payloadData);

        // Set tenant if available
        if (payloadData) {
          setTenant(payloadData);
          await fetchWidgets(payloadData.businessId);
        }

        toast.success("Login successful!");
        return { success: true, payload: payloadData };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
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

  const signup = async (userData) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.REGISTER,
        userData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Explicitly set Content-Type
          },
        }
      );

      const { token, payload: payloadData } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(payloadData);

        if (payloadData) {
          setTenant(payloadData);
          await fetchWidgets(payloadData.id);
        }

        toast.success("Account created successfully!");
        return { success: true, payload: payloadData };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_) {}
    setUser(null);
    setTenant("");
    setWidgets([]);
    setSelectedWidget(null);
    toast.success("Logged out successfully.");
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
