import  { useEffect, useState } from "react";
import {   SpeakerWaveIcon} from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { getS3Url } from "../utils/s3Utils";

const PublicReviewCard = ({ review, onViewReview, badge }) => {
  const [audioDuration, setAudioDuration] = useState('0:00');

  useEffect(() => {
    if (review.type === 'audio' && review.mediaAssets?.[0]?.s3Key) {
      const audio = new Audio(getS3Url(review.mediaAssets[0].s3Key));
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });
    }
  }, [review.mediaAssets, review.type]);


  // Video Review Card (existing design)
  if (review.type === 'video') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gray-100"
        style={{ height: '340px' }}
        onClick={() => onViewReview(review)}
      >
        {review.mediaAssets && review.mediaAssets[0] && (
          <video 
            className="absolute inset-0 w-full h-full object-cover"
            src={getS3Url(review.mediaAssets[0].s3Key)}
            preload="metadata"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {!badge ? <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          <span className= "backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 shadow-md border border-gray-200 max-w-32 truncate">
            {review.title}
          </span>
        </div>: <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
        </div>}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/80">
              {new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Audio Review Card
  if (review.type === 'audio') {

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-purple-700"
        style={{ height: '340px' }}
        onClick={() => onViewReview(review)}
      >
        {/* Audio Waveform Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="flex items-end gap-1">
            {[3, 5, 4, 6, 3, 7, 4, 5, 3, 6, 4, 5, 3, 4, 5, 6, 4, 3, 5, 4, 6, 5, 3, 4].map((height, i) => (
              <div key={i} className="w-2 bg-white rounded-full" style={{ height: `${height * 12}px` }} />
            ))}
          </div>
        </div>
        
        {/* Center Audio Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
            <SpeakerWaveIcon className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {!badge ? <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          <span className= "backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 shadow-md border border-gray-200 max-w-32 truncate">
            {review.title}
          </span>
        </div>: <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
        </div>}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-white/80">• {audioDuration}</span>
              </div>
            </div>
            <div className="text-xs text-white/80">
              {new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Text Review Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-green-500 to-green-700"
      style={{ height: '340px' }}
      onClick={() => onViewReview(review)}
    >
      {/* Text Pattern Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="grid grid-cols-6 gap-2 transform rotate-12">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-8 h-1 bg-white rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Text Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{review.title}</h3>
          <p className="text-white/90 text-sm line-clamp-4">
            {review.bodyText && review.bodyText.length > 120 
              ? `${review.bodyText.substring(0, 120)}...` 
              : review.bodyText || 'No content available'}
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {!badge ? <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          <span className= "backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 shadow-md border border-gray-200 max-w-32 truncate">
            {review.title}
          </span>
        </div>: <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
        </div>}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
            <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/80">
            {new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicReviewCard;