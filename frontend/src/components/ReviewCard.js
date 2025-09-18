import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  StarIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  XMarkIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const ReviewCard = ({ review, theme, primaryColor = "#ef7c00" }) => {
  const [mediaError, setMediaError] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log("ReviewCard: isPopupOpen changed to", isPopupOpen, "at", new Date().toISOString());
  }, [isPopupOpen]);

  // Debug window focus/blur
  useEffect(() => {
    const handleFocus = () => console.log("ReviewCard: Window focused at", new Date().toISOString());
    const handleBlur = () => console.log("ReviewCard: Window blurred at", new Date().toISOString());
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Determine media URL and type
  const reviewUrl = review.mediaAssets && review.mediaAssets.length > 0 ? review.mediaAssets[0].s3Key : null;

  // Destructure review data
  const {
    type,
    title = "Untitled Review",
    bodyText = "",
    rating = 0,
    reviewerName = "Anonymous",
    submittedAt,
  } = review;

  // Determine media type
  const isVideo = type === "video" && reviewUrl && !mediaError;
  const isAudio = type === "audio" && reviewUrl && !mediaError;
  const isText = type === "text" && bodyText;

  // Final media URL
  const s3BaseUrl = process.env.REACT_APP_S3_BASE_URL;
  const finalMediaUrl = reviewUrl ? `${s3BaseUrl}${reviewUrl}` : null;

  // Theme classes
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const cardBorder = isDark ? "border-gray-700" : "border-gray-200";
  const titleColor = isDark ? "text-gray-100" : "text-gray-900";
  const textColor = isDark ? "text-gray-200" : "text-gray-600";
  const mutedColor = isDark ? "text-gray-400" : "text-gray-500";

  // Format date
  const formattedDate = submittedAt ? format(new Date(submittedAt), "MMM d, yyyy") : "Unknown date";

  // Render stars for rating
  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          className={`h-5 w-5 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  // Render author initials
  const renderInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
      : "?";
  };

  // Render media player for modal
  const renderMediaPlayer = () => {
    switch (type) {
      case "video":
        return (
          <video
            src={finalMediaUrl}
            controls
            autoPlay
            className="w-full h-auto rounded-lg shadow-md"
            onError={() => {
              console.log("ReviewCard: Video error in modal at", new Date().toISOString());
              setMediaError(true);
            }}
          />
        );
      case "audio":
        return (
          <audio
            src={finalMediaUrl}
            controls
            autoPlay
            className="w-full rounded-lg shadow-md"
            onError={() => {
              console.log("ReviewCard: Audio error in modal at", new Date().toISOString());
              setMediaError(true);
            }}
          />
        );
      case "text":
        return (
          <div className={`p-6 bg-gradient-to-r from-gray-50 to-gray-100 ${cardBorder} rounded-xl shadow-md`}>
            <p className="text-lg text-gray-800 italic leading-relaxed">
              “{bodyText || "No text provided."}”
            </p>
            <p className="mt-4 text-right text-sm text-gray-600 font-semibold">
              — {reviewerName}
            </p>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-500 italic">
            No media content available for this review.
          </div>
        );
    }
  };

  // Render video layout - Professional design with proper height
  const renderVideoLayout = () => (
    <div className={`card-professional review-card-height review-type-video overflow-hidden`}>
      {/* Date in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {formattedDate}
        </span>
      </div>
      
      <div className="relative h-2/3">
        {isVideo ? (
          <>
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onError={() => {
                console.log("ReviewCard: Video error at", new Date().toISOString());
                setMediaError(true);
              }}
            >
              <source src={finalMediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <PlayIcon className="h-8 w-8 text-orange-600 ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Video unavailable</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(rating)}
            <span className="text-sm font-semibold text-gray-600">{rating}.0</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {renderInitials(reviewerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{reviewerName}</p>
            <p className="text-xs text-gray-500">Video Review</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render audio layout - Professional design with proper height
  const renderAudioLayout = () => (
    <div className={`card-professional review-card-height review-type-audio p-6`}>
      {/* Date in top-right corner */}
      <div className="absolute top-4 right-4">
        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {formattedDate}
        </span>
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center mb-6 mt-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg">
            <MicrophoneIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="flex items-end justify-center gap-1 h-20 mb-6">
          {isAudio ? (
            Array.from({ length: 24 }, () => Math.random() * 100).map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-full transition-all duration-300"
                style={{ 
                  width: "3px", 
                  height: `${Math.max(20, height)}%`, 
                  opacity: 0.8,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-purple-600">Audio unavailable</p>
            </div>
          )}
        </div>
        
        <div className="text-center flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              {renderStars(rating)}
              <span className="text-sm font-semibold text-gray-600">{rating}.0</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-4 line-clamp-2">{title}</h3>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              {renderInitials(reviewerName)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{reviewerName}</p>
              <p className="text-xs text-gray-500">Audio Review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render text layout - Professional design with proper height
  const renderTextLayout = () => (
    <div className={`card-professional review-card-height review-type-text p-6`}>
      {/* Date in top-right corner */}
      <div className="absolute top-4 right-4">
        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {formattedDate}
        </span>
      </div>
      
      <div className="flex flex-col h-full pt-8">
        <div className="flex items-center gap-3 mb-4">
          {renderStars(rating)}
          <span className="text-sm font-semibold text-gray-600">{rating}.0</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">{title}</h3>
        
        <div className="flex-1 mb-6">
          <p className="leading-relaxed text-gray-700 line-clamp-6 text-sm">
            "{bodyText || "No review text provided."}"
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {renderInitials(reviewerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{reviewerName}</p>
            <p className="text-xs text-gray-500">Text Review</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Choose layout based on type
  const renderLayout = () => {
    switch (type) {
      case "video":
        return renderVideoLayout();
      case "audio":
        return renderAudioLayout();
      case "text":
        return renderTextLayout();
      default:
        return (
          <div className={`rounded-xl shadow-lg p-6 ${cardBg} ${cardBorder} border text-center transition-shadow duration-300 hover:shadow-xl`}>
            <DocumentTextIcon className={`h-10 w-10 ${mutedColor} mx-auto mb-4`} />
            <p className={`text-sm ${mutedColor}`}>Review content unavailable</p>
          </div>
        );
    }
  };

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => {
          console.log("ReviewCard: Card clicked at", new Date().toISOString());
          setIsPopupOpen(true);
          setTimeout(() => {
            console.log("ReviewCard: Forcing modal check at", new Date().toISOString());
            setIsPopupOpen((prev) => prev);
          }, 0);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            console.log("ReviewCard: Enter/Space pressed at", new Date().toISOString());
            setIsPopupOpen(true);
            setTimeout(() => {
              console.log("ReviewCard: Forcing modal check at", new Date().toISOString());
              setIsPopupOpen((prev) => prev);
            }, 0);
          }
        }}
        aria-label={`Open review by ${reviewerName}`}
      >
        {renderLayout()}
      </div>
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Blurred Background */}
            <div
              onClick={() => {
                console.log("ReviewCard: Background clicked at", new Date().toISOString());
                setIsPopupOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`relative ${cardBg} ${cardBorder} shadow-2xl w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  console.log("ReviewCard: Close button clicked at", new Date().toISOString());
                  setIsPopupOpen(false);
                }}
                className={`absolute top-4 right-4 rounded-full ${isDark ? "bg-gray-700 text-white" : "bg-gray-800 text-white"} hover:bg-gray-600 transition-colors p-2 cursor-pointer z-50 shadow-lg`}
                aria-label="Close review modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
                {/* Header */}
                <h3 className={`text-2xl font-bold ${titleColor} border-b ${cardBorder} pb-3`}>
                  Review Preview
                </h3>
                {/* Author Info */}
                <div className={`flex items-center gap-4 ${isDark ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-xl ${cardBorder} shadow-sm`}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow">
                    {reviewerName ? reviewerName[0] : "?"}
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${titleColor}`}>
                      {reviewerName || "Anonymous"}
                    </p>
                    <p className={`text-sm ${mutedColor}`}>
                      {formattedDate}
                    </p>
                    {renderStars(rating)}
                  </div>
                  <div className="ml-auto">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDark ? "bg-blue-600 text-blue-100" : "bg-blue-100 text-blue-700"} shadow-sm`}>
                      {title}
                    </span>
                  </div>
                </div>
                {/* Media Section */}
                {renderMediaPlayer()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReviewCard;