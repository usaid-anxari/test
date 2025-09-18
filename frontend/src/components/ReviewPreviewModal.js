import {
  XMarkIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  StarIcon,
} from "@heroicons/react/16/solid";
import { motion, AnimatePresence } from "framer-motion";

const ReviewPreviewModal = ({ review, onClose }) => {
  console.log("ReviewPreviewModal - Review data:", review); // Debug

  const getMediaUrl = (mediaAsset) => {
    if (!mediaAsset?.s3Key) return null;
    const baseUrl =
      process.env.REACT_APP_S3_BASE_URL ||
      "https://truetestify.s3.amazonaws.com/";
    return `${baseUrl}${mediaAsset.s3Key}`;
  };

  // Try different possible structures for media assets
  const videoAsset =
    review.mediaAssets?.find(
      (asset) => asset.assetType === "video" || asset.type === "video"
    ) || (review.type === "video" ? review.media?.[0] : null);

  const audioAsset =
    review.mediaAssets?.find(
      (asset) => asset.assetType === "audio" || asset.type === "audio"
    ) || (review.type === "audio" ? review.media?.[0] : null);

  console.log("Video asset:", videoAsset);
  console.log("Audio asset:", audioAsset);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 rounded-full text-gray-600 bg-white hover:bg-gray-100 transition-colors p-2 cursor-pointer z-50 shadow-lg border border-gray-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        {/* Blurred Background */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-white border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    review.type === "video"
                      ? "bg-orange-100 text-orange-600"
                      : review.type === "audio"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {review.type === "video" && (
                    <VideoCameraIcon className="w-5 h-5" />
                  )}
                  {review.type === "audio" && (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                  {review.type === "text" && (
                    <DocumentTextIcon className="w-5 h-5" />
                  )}
                </div>
                {review.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  review.status?.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : review.status?.toLowerCase() === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {review.status}
              </span>
            </div>

            {/* Reviewer Info */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow">
                {review.reviewerName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  {review.reviewerName || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(review.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-gray-700">
                  {review.rating}/5
                </span>
              </div>
            </div>

            {/* Media Section */}
            {review.type === "video" && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                {videoAsset ? (
                  <video
                    src={getMediaUrl(videoAsset)}
                    controls
                    className="w-full max-h-[400px] object-contain bg-black"
                    onError={(e) => console.log("Video load error:", e)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="bg-gray-100 p-8 text-center">
                    <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video content not available</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Media assets: {JSON.stringify(review.mediaAssets)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {review.type === "audio" && (
              <div className="rounded-xl border border-gray-200 p-6 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Audio Review
                    </h4>
                    <p className="text-sm text-gray-600">
                      Click play to listen
                    </p>
                  </div>
                </div>
                {audioAsset ? (
                  <audio
                    src={getMediaUrl(audioAsset)}
                    controls
                    className="w-full"
                    onError={(e) => console.log("Audio load error:", e)}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                ) : (
                  <div className="bg-white p-4 rounded-lg text-center">
                    <p className="text-gray-600">Audio content not available</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Media assets: {JSON.stringify(review.mediaAssets)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Text Content - Always show for text reviews or when bodyText exists */}
            {(review.type === "text" || review.content) && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Review Content
                </h4>
                {review.content ? (
                  <p className="text-gray-800 leading-relaxed text-lg">
                    "{review.content}"
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No text content available for this review.
                  </p>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h5 className="font-semibold text-blue-800 mb-2">
                  Review Type
                </h5>
                <p className="text-blue-600 capitalize">{review.type} Review</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h5 className="font-semibold text-green-800 mb-2">Status</h5>
                <p className="text-green-600 capitalize">{review.status}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewPreviewModal;
