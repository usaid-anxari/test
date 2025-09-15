import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../../components/ReviewCard";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BusinessDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access the dashboard.");
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch business data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
        );
        console.log("API Response:", response.data.reviews); // Debug log
        const reviewsData = Array.isArray(response.data.reviews)
          ? response.data.reviews
          : [];
        setBusiness(response.data.business);
        setReviews(reviewsData);
        setFormData({
          name: response.data.business.name || "",
          website: response.data.business.website || "",
          brandColor: response.data.business.brandColor || DEFAULT_PRIMARY,
          logo: null, // Reset logo on fetch
        });
      } catch (error) {
        console.error("API Error:", error.response?.data || error); // Enhanced error logging
        toast.error("Could not load dashboard.");
        setBusiness(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

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

      await axiosInstance.put(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE, form, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set Content-Type
        },
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
      // Refresh data
      const response = await axiosInstance.get(
        API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
      );
      const reviewsData = Array.isArray(response.data.reviews)
        ? response.data.reviews
        : [];
      setBusiness(response.data.business);
      setReviews(reviewsData);
      setFormData({
        name: response?.data?.business?.name,
        website: response?.data?.business?.website,
        brandColor: response?.data?.business?.brandColor,
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
  console.log("Reviews State:", reviews); // Debug log
  const filteredReviews = Array.isArray(reviews)
    ? filter === "all"
      ? reviews
      : reviews.filter((review) => review.status === filter)
    : [];
  console.log("Filtered Reviews:", filteredReviews); // Debug log

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
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Profile</h2>
      <div className={containerClass}>
        {/* Profile Header */}
        {loading ? (
          renderProfileSkeleton()
        ) : business ? (
          <div className="mb-12">
            <div className="flex flex-col items-center text-center">
              {renderLogo()}
              {editing ? (
                <form
                  onSubmit={handleUpdateProfile}
                  className="mt-6 w-full max-w-md space-y-4"
                >
                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: textColor }}
                    >
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 w-full p-3 rounded-lg border ${
                        themeMode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: textColor }}
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`mt-1 w-full p-3 rounded-lg border ${
                        themeMode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: textColor }}
                    >
                      Brand Color
                    </label>
                    <input
                      type="color"
                      name="brandColor"
                      value={formData.brandColor}
                      onChange={handleInputChange}
                      className="mt-1 w-full h-10 rounded-lg"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: textColor }}
                    >
                      Logo
                    </label>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleInputChange}
                      className={`mt-1 w-full p-3 rounded-lg border ${
                        themeMode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    />
                    {formData.logo && (
                      <p className="mt-2 text-sm" style={{ color: mutedText }}>
                        Selected: {formData.logo.name}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      style={{ backgroundColor: primaryColor }}
                      className="px-6 py-3 text-white font-bold rounded-lg hover:brightness-110 transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <h1
                    className="text-4xl font-extrabold"
                    style={{ color: textColor }}
                  >
                    {business.name}
                  </h1>
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-lg font-medium hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Visit Website
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 px-6 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    style={{ color: primaryColor }}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500 text-lg">
            Failed to load business profile.
          </p>
        )}

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold" style={{ color: textColor }}>
              Reviews
            </h2>
            <div className="flex space-x-2">
              {["all", "approved", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === status
                      ? "text-white"
                      : themeMode === "dark"
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      filter === status ? primaryColor : "transparent",
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            {["GRID", "CAROUSEL", "SPOTLIGHT", "FLOATING_BUBBLE"].map(
              (option) => (
                <button
                  key={option}
                  onClick={() => setLayout(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    layout === option
                      ? "text-white"
                      : themeMode === "dark"
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      layout === option ? primaryColor : "transparent",
                  }}
                >
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              )
            )}
          </div>
        </div>
        {renderLayout()}
      </div>
    </>
  );
};

export default BusinessDashboard;
