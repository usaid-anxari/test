import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Compliance from "./Compliance";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import useSubscription from "../../hooks/useSubscription";

const AdminSettings = () => {
  const { hasFeature, tenant, refreshBusinessInfo } = useContext(AuthContext);
  const { subscriptionData } = useSubscription();
  const [allowTextReviews, setAllowTextReviews] = useState(true);
  const [allowGoogleReviews, setAllowGoogleReviews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consentLogs, setConsentLogs] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load settings from business data
  useEffect(() => {
    if (tenant?.settingsJson?.textReviewsEnabled !== undefined) {
      setAllowTextReviews(tenant.settingsJson.textReviewsEnabled);
    }
    if (tenant?.settingsJson?.googleReviewsEnabled !== undefined) {
      setAllowGoogleReviews(tenant.settingsJson.googleReviewsEnabled);
    }
  }, [tenant]);

  // Fetch consent logs for statistics
  useEffect(() => {
    const fetchConsentLogs = async () => {
      try {
        setStatsLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.COMPLIANCE.GET_CONSENT_LOGS
        );
        setConsentLogs(response.data.logs || []);
      } catch (error) {
        console.error("Failed to load consent logs:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchConsentLogs();
  }, []);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newSetting = !allowTextReviews;

      await axiosInstance.post(API_PATHS.BUSINESSES.TOGGLE_TEXT_REVIEWS, {
        enabled: newSetting,
      });

      setAllowTextReviews(newSetting);
      await refreshBusinessInfo(); // Refresh business data
      toast.success(
        `Text reviews are now ${newSetting ? "enabled" : "disabled"}.`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update setting.");
      console.error("Error toggling text reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoogleReviews = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newSetting = !allowGoogleReviews;

      const toggle = await axiosInstance.post(
        API_PATHS.BUSINESSES.TOGGLE_GOOGLE_REVIEWS,
        {
          enabled: newSetting,
        }
      );
      console.log(toggle);

      setAllowGoogleReviews(newSetting);
      await refreshBusinessInfo();
      toast.success(
        `Google reviews are now ${newSetting ? "enabled" : "disabled"}.`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update Google reviews setting."
      );
      console.error("Error toggling Google reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const [showConsent, setShowConsent] = useState(
    JSON.parse(localStorage.getItem("showConsent") || "true")
  );

  const saveConsent = () => {
    localStorage.setItem("showConsent", JSON.stringify(showConsent));
    toast.success("Consent preference saved");
  };

  const deletedReviews = consentLogs.filter(
    (log) => log.action === "DELETE_REVIEW"
  );
  const latestLog = consentLogs[0];

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "Founders Grotesk, system-ui, sans-serif" }}
          >
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <SubscriptionBanner 
          subscriptionStatus={subscriptionData?.status}
          tier={subscriptionData?.tier}
          storageUsage={subscriptionData?.storageUsage}
          trialActive={subscriptionData?.trialActive}
          trialDaysLeft={subscriptionData?.trialDaysLeft}
        />
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Deleted Reviews</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  style={{
                    fontFamily: "Founders Grotesk, system-ui, sans-serif",
                  }}
                >
                  {statsLoading ? "..." : deletedReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  GDPR Compliance Logs
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  style={{
                    fontFamily: "Founders Grotesk, system-ui, sans-serif",
                  }}
                >
                  {statsLoading ? "..." : consentLogs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-[#04A4FF]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">GDPR Compliant</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  style={{
                    fontFamily: "Founders Grotesk, system-ui, sans-serif",
                  }}
                >
                  {statsLoading ? "..." : consentLogs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        {/* Review Configuration */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "Founders Grotesk, system-ui, sans-serif" }}
            >
              Review Configuration
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Text Reviews Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-[#04A4FF]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    Review Configuration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Allow customers to submit review in addition to video and
                    audio
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleToggle}
                  disabled={!hasFeature("advanced_moderation") || loading}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#04A4FF] focus:ring-offset-2 ${
                    allowTextReviews ? "bg-green-500" : "bg-gray-300"
                  } ${
                    !hasFeature("advanced_moderation") || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                      allowTextReviews ? "translate-x-7" : "translate-x-1"
                    }`}
                  >
                    {allowTextReviews ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 m-1" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-gray-400 m-1" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          

          {/* Google Reviews Toggle */}
          {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-[#04A4FF]">G</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  Google Review Integration
                </h3>
                <p className="text-sm text-gray-600">
                  Show google review submission option on the record review page
                  to encourage also to leave google reviews
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleToggleGoogleReviews}
                disabled={!hasFeature("advanced_moderation") || loading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#04A4FF] focus:ring-offset-2 ${
                  allowGoogleReviews ? "bg-[#04A4FF]" : "bg-gray-300"
                } ${
                  !hasFeature("advanced_moderation") || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                    allowGoogleReviews ? "translate-x-7" : "translate-x-1"
                  }`}
                >
                  {allowGoogleReviews ? (
                    <CheckCircleIcon className="w-4 h-4 text-[#04A4FF] m-1" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-gray-400 m-1" />
                  )}
                </span>
              </button>
            </div>
          </div> */}
          </div>
        </div>
      </div>

      {/* Compliance Section */}
      <Compliance />
    </div>
  );
};

export default AdminSettings;
