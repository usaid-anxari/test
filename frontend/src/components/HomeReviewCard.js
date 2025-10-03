import { useState } from "react";
import { StarIcon, PlayIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const HomeReviewCard = ({ review }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  
  console.log(review);
  
  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          className={`h-4 w-4 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handlePlayClick = () => {
    if (videoRef) {
      videoRef.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-96"
    >
      {/* Video Section */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 to-orange-50">
        {review.type === "video" && review.media?.[0]?.url && !videoError ? (
          <>
            <video
              ref={setVideoRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              controls
              onPlay={handleVideoPlay}
              onError={handleVideoError}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath fill='%23f97316' d='M8 5v14l11-7z'/%3E%3C/svg%3E"
            >
              <source src={review.media[0].url} type="video/mp4" />
            </video>
            {!isPlaying && (
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center cursor-pointer"
                onClick={handlePlayClick}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                  <PlayIcon className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <PlayIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Video Testimonial</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 h-40 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {renderStars(review.rating)}
            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              {review.rating}.0
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">
            {review.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            {review.reviewerName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {review.reviewerName}
            </p>
            <p className="text-xs text-gray-500 font-medium">Video Testimonial</p>
          </div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeReviewCard;