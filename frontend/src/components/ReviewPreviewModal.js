import { XMarkIcon } from "@heroicons/react/16/solid";
import { motion, AnimatePresence } from "framer-motion";

const ReviewPreviewModal = ({ review, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
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
          className="relative bg-white border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors p-2 cursor-pointer z-50 shadow-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
            {/* Header */}
            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Review Preview
            </h3>

            {/* Author Info */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow">
                {review.authorName ? review.authorName[0] : "?"}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {review.authorName || "Anonymous"}
                </p>
                {review.authorEmail && (
                  <p className="text-sm text-gray-500">{review.authorEmail}</p>
                )}
              </div>
              <div className="ml-auto">
                {review.title && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 shadow-sm">
                    {review.title}
                  </span>
                )}
              </div>
            </div>

            {/* Media Section */}
            {review.videoId && review.video?.url && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <video
                  src={review.video.url}
                  controls
                  className="w-full max-h-[400px] object-contain bg-black"
                />
              </div>
            )}
            {review.audioId && review.audio?.url && (
              <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 p-4 bg-gray-50">
                <audio src={review.audio.url} controls className="w-full" />
              </div>
            )}

            {/* Text Review */}
            {review.text && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md">
                <p className="text-lg text-gray-800 italic leading-relaxed">
                  “{review.text}”
                </p>
                <p className="mt-4 text-right text-sm text-gray-600 font-semibold">
                  — {review.authorName || "Anonymous"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewPreviewModal;
