import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PublicReviews = () => {
  const { businessName } = useParams();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("GRID");

  // Default theme values
  const DEFAULT_PRIMARY = "#f97316";
  const DEFAULT_BG = "#ffffff";
  const DEFAULT_TEXT = "#111827";
  const DEFAULT_CARD_BG = "#ffffff";
  const DEFAULT_MUTED_TEXT = "#6b7280";

  // Fetch business profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Get business info from public profile endpoint
        const businessResponse = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName)
        );
        setBusiness(businessResponse.data);
        
        // Get approved reviews only from public reviews endpoint
        const reviewsResponse = await axiosInstance.get(
          API_PATHS.REVIEWS.GET_PUBLIC_REVIEWS(businessName)
        );
        setReviews(reviewsResponse.data.reviews || reviewsResponse.data || []);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Could not load business profile.");
        setBusiness(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [businessName]);

  // Theme setup
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeMode = systemPrefersDark ? "dark" : "light";
  const primaryColor = business?.brandColor || DEFAULT_PRIMARY;
  const bgColor = themeMode === "dark" ? "#111827" : DEFAULT_BG;
  const textColor = themeMode === "dark" ? "#f3f4f6" : DEFAULT_TEXT;
  const cardBg = themeMode === "dark" ? "#1f2937" : DEFAULT_CARD_BG;
  const mutedText = themeMode === "dark" ? "#9ca3af" : DEFAULT_MUTED_TEXT;

  // Container classes
  const containerClass = `
    p-8 sm:p-12 rounded-2xl transition-colors duration-300
    ${themeMode === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}
    border ${themeMode === "dark" ? "border-gray-700" : "border-gray-200"}
    max-w-6xl mx-auto shadow-lg
  `;

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

    if (reviews.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-bounce-slow">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="heading-2 text-gray-800 mb-4">Be the First to Review!</h3>
          <p className="text-lead text-gray-600 mb-10 max-w-lg mx-auto">
            Help others discover {business?.name} by sharing your authentic experience. Your review matters!
          </p>
          <Link
            to={`/record/${businessName}`}
            className="btn-primary text-xl px-12 py-5"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Leave the First Review
          </Link>
          
          {/* Benefits */}
          <div className="grid-3 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Quick & Easy</p>
              <p className="text-xs text-gray-500">Takes 2 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Secure & Private</p>
              <p className="text-xs text-gray-500">Your data is safe</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Help Others</p>
              <p className="text-xs text-gray-500">Share your story</p>
            </div>
          </div>
        </div>
      );
    }

    switch (layout) {
      case "CAROUSEL":
        return (
          <div className="relative group">
            <div className="overflow-x-auto hide-scrollbar flex space-x-6 pb-6 snap-x snap-mandatory scroll-smooth">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  className="min-w-[320px] max-w-[320px] snap-start flex-shrink-0"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ReviewCard review={review} theme={themeMode} primaryColor={primaryColor} />
                </motion.div>
              ))}
            </div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        );

      case "SPOTLIGHT":
        return (
          <div className="space-y-8">
            {reviews.map((review, index) => (
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
                  index === 0 ? "scale-105 shadow-xl" : "hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                <ReviewCard review={review} theme={themeMode} primaryColor={index === 0 ? "#ffffff" : primaryColor} />
                {index === 0 && (
                  <div
                    style={{ backgroundColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <div style={{ backgroundColor: primaryColor }} className="h-2"></div>
                <div className="p-8">
                  {reviews.length > 0 ? (
                    <ReviewCard review={reviews[0]} theme={themeMode} primaryColor={primaryColor} />
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-base mt-4" style={{ color: mutedText }}>
                        No reviews yet
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-8 pb-6">
                  <span
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-opacity-30 border-current"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
                    </svg>
                    {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="absolute bottom-6 right-6"
            >
              <Link
                to={`/record/${businessName}`}
                style={{ backgroundColor: primaryColor }}
                className="flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-30"
                aria-label="Leave a review"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </motion.div>
            <div
              className="absolute inset-0 pointer-events-none opacity-20 blur-3xl -z-10"
              style={{ background: `radial-gradient(ellipse at center, ${primaryColor}50 0%, transparent 70%)` }}
            ></div>
          </div>
        );

  case "GRID":
    default:
      return (
        <div className="grid-responsive">
          {reviews?.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="fade-in"
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
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className={containerClass}>
        {/* Profile Header */}
        {loading ? (
          renderProfileSkeleton()
        ) : business ? (
          <div className="flex flex-col items-center mb-12 text-center">
            {renderLogo()}
            <h1 className="text-4xl font-extrabold mt-4" style={{ color: textColor }}>
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
            {/* Layout Selector */}
            <div className="mt-6 flex space-x-2">
              {["GRID", "CAROUSEL", "SPOTLIGHT", "FLOATING_BUBBLE"].map((option) => (
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
                  style={{ backgroundColor: layout === option ? primaryColor : "transparent" }}
                >
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500 text-lg">Failed to load business profile.</p>
        )}

        {/* Reviews Section */}
        <h2 className="text-2xl font-semibold mb-8 text-center" style={{ color: textColor }}>
          Customer Reviews
        </h2>
        {renderLayout()}

        {/* CTA Button */}
        {layout !== "FLOATING_BUBBLE" && (
          <div className="text-center mt-12">
            <Link
              to={`/record/${businessName}`}
              style={{ backgroundColor: primaryColor }}
              className="inline-block px-10 py-4 text-white text-lg font-bold rounded-full hover:brightness-110 transition-all duration-300 shadow-md"
            >
              Leave Your Own Review!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicReviews;