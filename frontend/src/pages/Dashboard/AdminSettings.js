import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const AdminSettings = () => {
  const { getInitialData, hasFeature, tenant, refreshBusinessInfo } = useContext(AuthContext);
  const [allowTextReviews, setAllowTextReviews] = useState(true);
  const [allowGoogleReviews, setAllowGoogleReviews] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load settings from business data
  useEffect(() => {
    if (tenant?.settingsJson?.textReviewsEnabled !== undefined) {
      setAllowTextReviews(tenant.settingsJson.textReviewsEnabled);
    }
    if (tenant?.settingsJson?.googleReviewsEnabled !== undefined) {
      setAllowGoogleReviews(tenant.settingsJson.googleReviewsEnabled);
    }
  }, [tenant]);

  const handleToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newSetting = !allowTextReviews;
      
      await axiosInstance.post(API_PATHS.BUSINESSES.TOGGLE_TEXT_REVIEWS, {
        enabled: newSetting
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
      
      await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, {
        settingsJson: {
          ...tenant?.settingsJson,
          googleReviewsEnabled: newSetting
        }
      });
      
      setAllowGoogleReviews(newSetting);
      await refreshBusinessInfo();
      toast.success(
        `Google reviews are now ${newSetting ? "enabled" : "disabled"}.`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Google reviews setting.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Advanced Settings
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Configure your business preferences and advanced features
              </p>
            </div>
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold">{allowTextReviews ? '✓' : '✗'}</div>
                <div className="text-sm text-blue-100">Text Reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold">{allowGoogleReviews ? '✓' : '✗'}</div>
                <div className="text-sm text-blue-100">Google Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">

        {/* Review Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
              Review Configuration
            </h2>
            <p className="text-gray-600">Configure what types of reviews customers can submit</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Text Reviews Toggle */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Text Reviews
                    </h3>
                    <p className="text-gray-600">
                      Allow customers to submit written reviews in addition to video and audio testimonials
                    </p>
                    {!hasFeature("advanced_moderation") && (
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Pro Feature - Upgrade Required
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-semibold ${
                    allowTextReviews ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {allowTextReviews ? 'Enabled' : 'Disabled'}
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={!hasFeature("advanced_moderation") || loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      allowTextReviews ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-300"
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
            </div>

            {/* Google Reviews Toggle */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Google Reviews Integration
                    </h3>
                    <p className="text-gray-600">
                      Show Google review submission option on the record review page to encourage customers to also leave Google reviews
                    </p>
                    {!hasFeature("advanced_moderation") && (
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Pro Feature - Upgrade Required
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-semibold ${
                    allowGoogleReviews ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {allowGoogleReviews ? 'Enabled' : 'Disabled'}
                  </div>
                  <button
                    onClick={handleToggleGoogleReviews}
                    disabled={!hasFeature("advanced_moderation") || loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      allowGoogleReviews ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gray-300"
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
                        <CheckCircleIcon className="w-4 h-4 text-blue-500 m-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-gray-400 m-1" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>



        {/* Privacy & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
              Privacy & Compliance
            </h2>
            <p className="text-gray-600">Configure privacy settings and legal compliance requirements</p>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Consent Requirement
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Require customers to provide explicit consent before submitting reviews. This helps ensure GDPR and CCPA compliance.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Recommended:</strong> Keep this enabled to protect your business and comply with privacy regulations.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-semibold ${
                    showConsent ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {showConsent ? 'Required' : 'Optional'}
                  </div>
                  <button
                    onClick={() => {
                      setShowConsent(!showConsent);
                      saveConsent();
                    }}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:shadow-lg ${
                      showConsent ? "bg-gradient-to-r from-purple-500 to-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                        showConsent ? "translate-x-7" : "translate-x-1"
                      }`}
                    >
                      {showConsent ? (
                        <CheckCircleIcon className="w-4 h-4 text-purple-500 m-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-gray-400 m-1" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
