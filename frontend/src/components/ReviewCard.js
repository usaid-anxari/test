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
  const s3BaseUrl = process.env.VITE_S3_BASE_URL;
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

  // Render video layout
  const renderVideoLayout = () => (
    <div className={`rounded-xl shadow-lg overflow-hidden ${cardBg} ${cardBorder} border transition-shadow duration-300 hover:shadow-xl`}>
      <div className="relative">
        {isVideo ? (
          <>
            <video
              className="w-full h-64 md:h-80 object-cover"
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
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayIcon className="h-12 w-12 text-white bg-black bg-opacity-50 p-3 rounded-full" />
            </div>
          </>
        ) : (
          <div className="w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center">
            <DocumentTextIcon className={`h-10 w-10 ${mutedColor}`} />
            <p className={`ml-2 text-sm font-medium ${mutedColor}`}>Video unavailable</p>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {renderStars(rating)}
          <span className={`text-sm ${textColor}`}>{rating}.0</span>
        </div>
        <span className={`text-sm font-medium ${mutedColor}`}>{formattedDate}</span>
        <h3 className={`font-bold ${titleColor} mb-2`}>{title}</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
            {renderInitials(reviewerName)}
          </div>
          <span className={mutedColor}>{reviewerName}</span>
        </div>
      </div>
    </div>
  );

  // Render audio layout
  const renderAudioLayout = () => (
    <div className={`rounded-xl shadow-lg p-6 ${cardBg} ${cardBorder} border transition-shadow duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-center mb-4">
        <div className="bg-purple-100 p-4 rounded-full">
          <MicrophoneIcon className="h-8 w-8 text-purple-600" />
        </div>
      </div>
      <div className="flex items-end justify-center gap-1 h-16 mb-4">
        {isAudio ? (
          Array.from({ length: 20 }, () => Math.random() * 100).map((height, index) => (
            <div
              key={index}
              className="bg-purple-400 rounded-full"
              style={{ width: "2px", height: `${height}%`, opacity: 0.6 }}
            />
          ))
        ) : (
          <p className={`text-sm ${mutedColor}`}>Audio unavailable</p>
        )}
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {renderStars(rating)}
          <span className={`text-sm ${textColor}`}>{rating}.0</span>
        </div>
        <span className={`text-sm font-medium ${mutedColor}`}>{formattedDate}</span>
        <h3 className={`font-bold ${titleColor} mb-2`}>{title}</h3>
        {/* <p className={`text-sm ${textColor} mb-3 line-clamp-2`}>"{bodyText || "No description provided."}"</p> */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
            {renderInitials(reviewerName)}
          </div>
          <span className={mutedColor}>{reviewerName}</span>
        </div>
      </div>
    </div>
  );

  // Render text layout
  const renderTextLayout = () => (
    <div className={`rounded-xl shadow-lg p-6 ${cardBg} ${cardBorder} border transition-shadow duration-300 hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {renderStars(rating)}
          <span className={`text-sm ${textColor}`}>{rating}.0</span>
        </div>
        <span className={`text-sm ${mutedColor}`}>{formattedDate}</span>
      </div>
      <h3 className={`text-lg font-bold ${titleColor} mb-3`}>{title}</h3>
      <p className={`leading-relaxed ${textColor} mb-4 line-clamp-3`}>{bodyText}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
            {renderInitials(reviewerName)}
          </div>
          <div>
            <div className={`font-semibold ${titleColor}`}>{reviewerName}</div>
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