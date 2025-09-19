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
    // console.log("ReviewCard: isPopupOpen changed to", isPopupOpen, "at", new Date().toISOString());
  }, [isPopupOpen]);

  // Debug window focus/blur
  useEffect(() => {
    const handleFocus = () => new Date().toISOString();
    const handleBlur = () => new Date().toISOString();
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
  const isGoogle = type === "google";

  // Final media URL
  const s3BaseUrl = process.env.REACT_APP_S3_BASE_URL;
  const finalMediaUrl = reviewUrl ? `${s3BaseUrl}${reviewUrl}` : null;
  console.log(finalMediaUrl);
  
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
              // console.log("ReviewCard: Video error in modal at", new Date().toISOString());
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
              // console.log("ReviewCard: Audio error in modal at", new Date().toISOString());
              setMediaError(true);
            }}
          />
        );
      case "text":
        return (
          <div className={`p-6 bg-gradient-to-r from-gray-50 to-gray-100 ${cardBorder} rounded-xl shadow-md`}>
            <p className="text-lg text-gray-800 italic leading-relaxed">
              "{bodyText || "No text provided."}"
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

  // Render video layout - Professional business design
  const renderVideoLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96 relative group">
      {/* Date badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md border border-gray-200">
          {formattedDate}
        </span>
      </div>
      
      {/* Video section */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 to-orange-50">
        {isVideo ? (
          <>
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onError={() => setMediaError(true)}
            >
              <source src={finalMediaUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform group-hover:shadow-2xl">
                <PlayIcon className="h-8 w-8 text-white ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Video Preview</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-6 h-40 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {renderStars(rating)}
            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{rating}.0</span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            {renderInitials(reviewerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{reviewerName}</p>
            <p className="text-xs text-gray-500 font-medium">Video Testimonial</p>
          </div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Render audio layout - Professional business design
  const renderAudioLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96 relative group p-6">
      {/* Date badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md border border-gray-200">
          {formattedDate}
        </span>
      </div>
      
      <div className="flex flex-col h-full pt-8">
        {/* Audio icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
            <MicrophoneIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        
        {/* Audio waveform */}
        <div className="flex items-end justify-center gap-1 h-16 mb-6 px-4">
          {Array.from({ length: 20 }, (_, index) => {
            const height = Math.random() * 80 + 20;
            return (
              <div
                key={index}
                className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-500 hover:from-orange-500 hover:to-blue-500"
                style={{ 
                  width: "4px", 
                  height: `${height}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            );
          })}
        </div>
        
        {/* Content */}
        <div className="text-center flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              {renderStars(rating)}
              <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{rating}.0</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2">{title}</h3>
          </div>
          
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {renderInitials(reviewerName)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">{reviewerName}</p>
              <p className="text-xs text-gray-500 font-medium">Audio Testimonial</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render text layout - Professional business design
  const renderTextLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96 relative group p-6">
      {/* Date badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md border border-gray-200">
          {formattedDate}
        </span>
      </div>
      
      <div className="flex flex-col h-full pt-8">
        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          {renderStars(rating)}
          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{rating}.0</span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">{title}</h3>
        
        {/* Quote icon and text */}
        <div className="flex-1 mb-6 relative">
          <div className="absolute -top-2 -left-2 text-4xl text-gray-200 font-serif">"</div>
          <p className="leading-relaxed text-gray-700 line-clamp-6 text-sm pl-6 italic">
            {bodyText || "No review text provided."}
          </p>
          <div className="absolute -bottom-2 right-0 text-4xl text-gray-200 font-serif rotate-180">"</div>
        </div>
        
        {/* Author */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            {renderInitials(reviewerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{reviewerName}</p>
            <p className="text-xs text-gray-500 font-medium">Written Testimonial</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Render Google review layout - Professional business design with Google branding
  const renderGoogleLayout = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96 relative group p-6">
      {/* Date badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md border border-gray-200">
          {formattedDate}
        </span>
      </div>
      
      {/* Google badge */}
      <div className="absolute top-4 left-4">
        <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </div>
      </div>
      
      <div className="flex flex-col h-full pt-12">
        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          {renderStars(rating)}
          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{rating}.0</span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">{title}</h3>
        
        {/* Quote icon and text */}
        <div className="flex-1 mb-6 relative">
          <div className="absolute -top-2 -left-2 text-4xl text-blue-200 font-serif">"</div>
          <p className="leading-relaxed text-gray-700 line-clamp-6 text-sm pl-6 italic">
            {bodyText || "No review text provided."}
          </p>
          <div className="absolute -bottom-2 right-0 text-4xl text-blue-200 font-serif rotate-180">"</div>
        </div>
        
        {/* Author */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            {renderInitials(reviewerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{reviewerName}</p>
            <p className="text-xs text-gray-500 font-medium">Google Review</p>
          </div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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
      case "google":
        return renderGoogleLayout();
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
          // console.log("ReviewCard: Card clicked at", new Date().toISOString());
          setIsPopupOpen(true);
          setTimeout(() => {
            // console.log("ReviewCard: Forcing modal check at", new Date().toISOString());
            setIsPopupOpen((prev) => prev);
          }, 0);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            // console.log("ReviewCard: Enter/Space pressed at", new Date().toISOString());
            setIsPopupOpen(true);
            setTimeout(() => {
              // console.log("ReviewCard: Forcing modal check at", new Date().toISOString());
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
                // console.log("ReviewCard: Background clicked at", new Date().toISOString());
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
                  // console.log("ReviewCard: Close button clicked at", new Date().toISOString());
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