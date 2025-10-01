import { useEffect, useState } from "react";
import ReviewCard from "../../components/ReviewCard";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth0 } from "@auth0/auth0-react";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import useSubscription from "../../hooks/useSubscription";

const BusinessDashboard = () => {
  const { isAuthenticated } = useAuth0();
  const subscription = useSubscription();
  console.log({ subscription }); // Debug log
  
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("GRID");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState("");
  
  // Default theme values
  const DEFAULT_PRIMARY = "#f97316";
  const DEFAULT_BG = "#ffffff";
  const DEFAULT_TEXT = "#111827";
  const DEFAULT_CARD_BG = "#ffffff";
  const DEFAULT_MUTED_TEXT = "#6b7280";

  // Fetch business data and reviews in single API call
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Get business info and all reviews in single call
        const response = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
        );
        console.log(response);
        setBusiness(response.data.business);
        setReviews(response.data.reviews || []);
                
        setFormData({
          name: response.data.business?.name || "",
          website: response.data.business?.website || "",
          brandColor: response.data.business?.brandColor || DEFAULT_PRIMARY,
          logo: null,
        });
      } catch (error) {
        console.error("API Error:", error.response?.data || error);
        toast.error("Could not load dashboard.");
        setBusiness(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  // Theme setup
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const themeMode = systemPrefersDark ? "dark" : "light";
  const primaryColor = business?.brandColor || DEFAULT_PRIMARY;
  const bgColor = themeMode === "dark" ? "#111827" : DEFAULT_BG;
  const textColor = themeMode === "dark" ? "#f3f4f6" : DEFAULT_TEXT;
  const cardBg = themeMode === "dark" ? "#1f2937" : DEFAULT_CARD_BG;
  const mutedText = themeMode === "dark" ? "#9ca3af" : DEFAULT_MUTED_TEXT;

  // Container classes
  const containerClass = `
    p-8 sm:p-12 rounded-2xl transition-colors duration-300
    ${
      themeMode === "dark"
        ? "bg-slate-800 text-white"
        : "bg-white text-gray-800"
    }
    border ${themeMode === "dark" ? "border-gray-700" : "border-gray-200"}
    max-w-6xl mx-auto shadow-lg
  `;

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (files) {
      console.log("Selected file:", files[0]); // Debug log for file selection
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      if (formData.website) form.append("website", formData.website);
      if (formData.brandColor) form.append("brandColor", formData.brandColor);
      if (formData.logo instanceof File) {
        form.append("logo", formData.logo);
        console.log("Appending file to FormData:", formData.logo); // Debug log
      }

      await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
      // Refresh data with single API call
      const response = await axiosInstance.get(
        API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
      );
      setBusiness(response.data.business);
      setReviews(response.data.reviews || []);
      setFormData({
        name: response.data.business?.name,
        website: response.data.business?.website,
        brandColor: response.data.business?.brandColor,
      });
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data || error); // Enhanced error logging
      toast.error(
        `Failed to update profile: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Render logo or avatar
  const renderLogo = () => {
    if (loading) {
      return <Skeleton circle width={100} height={100} />;
    }
    if (business?.logoUrl) {
      return (
        <img
          src={business.logoUrl}
          alt={`${business.name} logo`}
          className="w-24 h-24 rounded-full object-cover border-4"
          style={{ borderColor: primaryColor }}
        />
      );
    }
    return (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
        style={{ backgroundColor: primaryColor, color: "#ffffff" }}
      >
        {business?.name?.[0]?.toUpperCase() || "?"}
      </div>
    );
  };

  // Render skeleton loader
  const renderProfileSkeleton = () => (
    <div className="flex flex-col items-center space-y-4 mb-12">
      <Skeleton circle width={100} height={100} />
      <Skeleton width={250} height={32} />
      <Skeleton width={150} height={20} />
    </div>
  );

  // Filter reviews
  const filteredReviews = Array.isArray(reviews)
    ? filter === "all"
      ? reviews
      : reviews.filter((review) => review.status === filter)
    : [];

  // Render review layouts
  const renderLayout = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} height={250} borderRadius={16} />
          ))}
        </div>
      );
    }

    if (filteredReviews.length === 0) {
      return (
        <p
          className={themeMode === "dark" ? "text-gray-400" : "text-gray-500"}
          style={{ fontSize: "1.1rem" }}
        >
          No {filter === "all" ? "reviews" : `${filter} reviews`} available yet.
        </p>
      );
    }

    switch (layout) {
      case "CAROUSEL":
        return (
          <div className="relative group">
            <div className="overflow-x-auto hide-scrollbar flex space-x-6 pb-6 snap-x snap-mandatory scroll-smooth">
              {filteredReviews.map((review) => (
                <motion.div
                  key={review.id}
                  className="min-w-[320px] max-w-[320px] snap-start flex-shrink-0"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ReviewCard
                    review={review}
                    theme={themeMode}
                    primaryColor={primaryColor}
                  />
                </motion.div>
              ))}
            </div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        );

      case "SPOTLIGHT":
        return (
          <div className="space-y-8">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  backgroundColor: index === 0 ? primaryColor : cardBg,
                  color: index === 0 ? "#ffffff" : textColor,
                }}
                className={`p-6 rounded-2xl border transition-all duration-300 shadow-md ${
                  index === 0
                    ? "scale-105 shadow-xl"
                    : "hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                <ReviewCard
                  review={review}
                  theme={themeMode}
                  primaryColor={index === 0 ? "#ffffff" : primaryColor}
                />
                {index === 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.3)",
                      backdropFilter: "blur(4px)",
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        );

      case "FLOATING_BUBBLE":
        return (
          <div className="relative h-[500px] sm:h-[600px]">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                  boxShadow: `0 20px 50px -10px ${primaryColor}40`,
                }}
                className="max-w-sm w-full mx-4 rounded-3xl border overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="h-2"
                ></div>
                <div className="p-8">
                  {filteredReviews.length > 0 ? (
                    <ReviewCard
                      review={filteredReviews[0]}
                      theme={themeMode}
                      primaryColor={primaryColor}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <p
                        className="text-base mt-4"
                        style={{ color: mutedText }}
                      >
                        No reviews yet
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-8 pb-6">
                  <span
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-opacity-30 border-current"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                      />
                    </svg>
                    {filteredReviews.length}{" "}
                    {filteredReviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>
              </div>
            </motion.div>
            <div
              className="absolute inset-0 pointer-events-none opacity-20 blur-3xl -z-10"
              style={{
                background: `radial-gradient(ellipse at center, ${primaryColor}50 0%, transparent 70%)`,
              }}
            ></div>
          </div>
        );

      case "GRID":
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                // Remove whileHover to avoid click interference
                className="relative"
              >
                <ReviewCard
                  review={review}
                  theme={themeMode}
                  primaryColor={primaryColor}
                />
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Business Dashboard
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage your business profile and customer reviews
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-sm text-blue-100">Total Reviews</div>
                <div className="text-2xl font-bold">{reviews.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-sm text-blue-100">Approved</div>
                <div className="text-2xl font-bold">
                  {reviews.filter(r => r.status === 'approved').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Subscription Banner */}
          <div className="p-6 pb-0">
            <SubscriptionBanner
              subscriptionStatus={subscription.status}
              tier={subscription.tier}
              storageUsage={subscription.storageUsage}
              trialActive={subscription.trialActive}
              trialDaysLeft={subscription.trialDaysLeft}
            />
          </div>
          {/* Executive Profile Section */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-8 border-b border-gray-100">
            {loading ? (
              renderProfileSkeleton()
            ) : business ? (
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex-shrink-0">
                  {renderLogo()}
                </div>
                <div className="flex-1 text-center lg:text-left">
                  {editing ? (
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Business Profile
                      </h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Business Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                              placeholder="Enter your business name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Website URL
                            </label>
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                              placeholder="https://yourbusiness.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Brand Color
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="color"
                                name="brandColor"
                                value={formData.brandColor}
                                onChange={handleInputChange}
                                className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.brandColor}
                                onChange={(e) => setFormData(prev => ({...prev, brandColor: e.target.value}))}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                                placeholder="#ef7c00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Business Logo
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                name="logo"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              />
                              {formData.logo && (
                                <div className="mt-2 flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {formData.logo.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="px-6 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        {business.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            Visit Website
                          </a>
                        )}
                        <button
                          onClick={() => setEditing(true)}
                          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Business Slug</div>
                          <div className="font-semibold text-gray-800">/{business.slug}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Brand Color</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: business.brandColor}}></div>
                            <span className="font-semibold text-gray-800">{business.brandColor}</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Created</div>
                          <div className="font-semibold text-gray-800">
                            {new Date(business.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-600 text-lg font-semibold">
                  Failed to load business profile
                </p>
              </div>
            )}
          </div>

          {/* Premium Reviews Management Section */}
          <div className="bg-white p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  Customer Reviews
                </h2>
                <p className="text-gray-600">Manage and showcase your customer feedback</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {["all", "approved", "pending"].map((status) => {
                    const count = status === 'all' ? reviews.length : reviews.filter(r => r.status === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          filter === status
                            ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg transform scale-105"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          filter === status ? "bg-white/20" : "bg-gray-200"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Layout Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Display Layout</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: "GRID", label: "Grid View", icon: "⊞" },
                  { key: "CAROUSEL", label: "Carousel", icon: "⟷" },
                  { key: "SPOTLIGHT", label: "Spotlight", icon: "★" },
                  { key: "FLOATING_BUBBLE", label: "Floating", icon: "○" }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setLayout(option.key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      layout === option.key
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Display */}
            <div className="bg-gray-50 rounded-xl p-6">
              {renderLayout()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
