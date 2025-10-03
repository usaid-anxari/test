import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ReviewCard from "../components/ReviewCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PublicReviews = ({ businessSlug }) => {
  const { businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("GRID");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Default theme values
  const DEFAULT_PRIMARY = "#f97316";
  const DEFAULT_BG = "#ffffff";
  const DEFAULT_TEXT = "#111827";
  const DEFAULT_CARD_BG = "#ffffff";
  const DEFAULT_MUTED_TEXT = "#6b7280";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [businessRes, reviewsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName || businessSlug)),
        axiosInstance.get(API_PATHS.REVIEWS.GET_PUBLIC_REVIEWS(businessName || businessSlug))
      ]);
      setBusiness(businessRes.data.business || null);
      setReviews(reviewsRes.data.reviews || []);
      // Mock widgets for now - replace with actual API call
      setWidgets([
        { type: 'video', active: true },
        { type: 'audio', active: true },
        { type: 'text', active: true }
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Could not load business data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessName, businessSlug]);

  // Theme setup
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeMode = systemPrefersDark ? "dark" : "light";
  const primaryColor = business?.brandColor || DEFAULT_PRIMARY;
  const bgColor = themeMode === "dark" ? "#111827" : DEFAULT_BG;
  const textColor = themeMode === "dark" ? "#f3f4f6" : DEFAULT_TEXT;
  const cardBg = themeMode === "dark" ? "#1f2937" : DEFAULT_CARD_BG;
  const mutedText = themeMode === "dark" ? "#9ca3af" : DEFAULT_MUTED_TEXT;
console.log(business);

  // Render logo or avatar
  const renderLogo = () => {
    if (loading) return <Skeleton circle width={100} height={100} />;
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
        <p
          className={themeMode === "dark" ? "text-gray-400" : "text-gray-500"}
          style={{ fontSize: "1.1rem" }}
        >
          No reviews available yet.
        </p>
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
                  {reviews.length > 0 ? (
                    <ReviewCard
                      review={reviews[0]}
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
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "Review" : "Reviews"}
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
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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

  // Render review form based on active widgets
  const renderReviewForm = () => {
    if (!showReviewForm) return null;
    
    const activeWidgets = widgets.filter(w => w.active);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Leave a Review</h3>
          
          <div className="space-y-4">
            {activeWidgets.map((widget) => (
              <Link
                key={widget.type}
                to={`/record/${business.slug}?type=${widget.type}`}
                className="block p-4 border-2 rounded-lg hover:shadow-md transition-all"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    widget.type === 'video' ? 'bg-orange-100' :
                    widget.type === 'audio' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      widget.type === 'video' ? 'text-orange-600' :
                      widget.type === 'audio' ? 'text-purple-600' : 'text-green-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      {widget.type === 'video' && <path d="M8 5v10l7-5z" />}
                      {widget.type === 'audio' && <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {widget.type === 'text' && <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" />}
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold capitalize">{widget.type} Review</h4>
                    <p className="text-sm text-gray-600">
                      {widget.type === 'video' && 'Record a video testimonial'}
                      {widget.type === 'audio' && 'Record an audio message'}
                      {widget.type === 'text' && 'Write a detailed review'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <button
            onClick={() => setShowReviewForm(false)}
            className="mt-6 w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                {business?.name || "Business Reviews"}
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Customer testimonials and feedback
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-sm text-blue-100">Total Reviews</div>
                <div className="text-2xl font-bold">{reviews.length}</div>
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Leave Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Minimal Business Profile Section */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-8 border-b border-gray-100">
            {loading ? (
              renderProfileSkeleton()
            ) : business ? (
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex-shrink-0">
                  {renderLogo()}
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-gray-800 mb-3">
                    {business.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {business.website && (
                      <a
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
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
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l7-5z" />
                      </svg>
                      Leave Review
                    </button>
                  </div>
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
                  Business not found
                </p>
              </div>
            )}
          </div>

          {/* Reviews Management Section */}
          <div className="bg-white p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  Customer Reviews
                </h2>
                <p className="text-gray-600">Authentic testimonials from our customers</p>
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
      
      {/* Review Form Modal */}
      {renderReviewForm()}
    </div>
  );
};

export default PublicReviews;