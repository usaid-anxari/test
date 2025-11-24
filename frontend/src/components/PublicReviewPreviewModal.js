import  { useState, useRef } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { getS3Url } from "../utils/s3Utils";

const PublicReviewPreviewModal = ({ review, isOpen, onClose, onApprove, onReject, onDelete, isReadOnly,allowBtn = false }) => {
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const getMediaUrl = (mediaAsset) => {
    if (!mediaAsset?.s3Key) return null;
    return getS3Url(mediaAsset.s3Key);
  };

  const videoAsset = review.mediaAssets?.find(asset => asset.assetType === "video" || asset.type === "video") || (review.type === "video" ? review.mediaAssets?.[0] : null);
  const audioAsset = review.mediaAssets?.find(asset => asset.assetType === "audio" || asset.type === "audio") || (review.type === "audio" ? review.mediaAssets?.[0] : null);

  const togglePlay = () => {
    const media = review.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    const media = review.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const media = review.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      setDuration(media.duration);
      const minutes = Math.floor(media.duration / 60);
      const seconds = Math.floor(media.duration % 60);
      setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      if (review.type === 'audio') {
        generateWaveform(media);
      }
    }
  };

  const generateWaveform = async (audioElement) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(audioElement.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 60;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      const multiplier = Math.pow(Math.max(...filteredData), -1);
      const normalizedData = filteredData.map(n => n * multiplier);
      setWaveformData(normalizedData);
    } catch (error) {
      console.error('Error generating waveform:', error);
      setWaveformData(Array(60).fill(0.3));
    }
  };

  const handleSeek = (e) => {
    const media = review.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      media.currentTime = pos * media.duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video Review Modal */}
          {review.type === 'video' && (
            <>
              {videoAsset && (
                <video 
                  ref={videoRef}
                  className="w-full h-[500px] object-cover"
                  src={getMediaUrl(videoAsset)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                />
              )}
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlaying && (
                  <button onClick={togglePlay} className="pointer-events-auto w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl">
                    <PlayIcon className="w-10 h-10 text-gray-900 ml-1" />
                  </button>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
              
              <div className="absolute top-6 left-6 z-10 flex items-center gap-3 pointer-events-auto">
                <button onClick={onClose} className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all">
                  <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
                </button>
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-md border border-gray-200 max-w-48 truncate">
                  {review.title}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 pointer-events-auto">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-1.5 cursor-pointer" onClick={handleSeek}>
                  <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-xl font-bold text-white">{review.reviewerName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">{review.reviewerName}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-white/80 text-sm">•</span>
                      <span className="text-white/80 text-sm">{new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Audio Review Modal */}
          {review.type === 'audio' && (
            <>
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 h-[500px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="flex items-end gap-1">
                    {[3, 5, 4, 6, 3, 7, 4, 5, 3, 6, 4, 5, 3, 4, 5, 6, 4, 3, 5, 4, 6, 5, 3, 4].map((height, i) => (
                      <div key={i} className="w-2 bg-white rounded-full" style={{ height: `${height * 12}px` }} />
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <button onClick={togglePlay} className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 mb-6 hover:bg-white/30 transition-all">
                    {isPlaying ? <PauseIcon className="w-16 h-16 text-white" /> : <PlayIcon className="w-16 h-16 text-white ml-2" />}
                  </button>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {waveformData.length > 0 ? (
                      waveformData.map((amplitude, i) => {
                        const height = Math.max(amplitude * 80, 4);
                        const isActive = (i / waveformData.length) <= (currentTime / duration);
                        return (
                          <div 
                            key={i} 
                            className={`w-1.5 rounded-full transition-all ${isActive ? 'bg-white' : 'bg-white/40'}`} 
                            style={{ height: `${height}px` }} 
                          />
                        );
                      })
                    ) : (
                      [3, 5, 4, 6, 3, 7, 4, 5, 3, 6, 4, 5, 3, 4, 5, 6, 4, 3, 5, 4].map((height, i) => (
                        <div key={i} className="w-1.5 bg-white/60 rounded-full" style={{ height: `${height * 4}px` }} />
                      ))
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-white mb-4">
                    <span className="text-lg font-medium">{formatTime(currentTime)} / {audioDuration}</span>
                    <SpeakerWaveIcon className="w-8 h-8" />
                  </div>
                  
                  <div className="w-80 bg-white/20 backdrop-blur-sm rounded-full h-1.5 cursor-pointer" onClick={handleSeek}>
                    <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
                  </div>
                  
                  {audioAsset && (
                    <audio 
                      ref={audioRef}
                      src={getMediaUrl(audioAsset)} 
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      className="hidden"
                    />
                  )}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
              
              <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <button onClick={onClose} className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all">
                  <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
                </button>
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-md border border-gray-200 max-w-48 truncate">
                  {review.title}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-xl font-bold text-white">{review.reviewerName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">{review.reviewerName}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-white/80 text-sm">•</span>
                      <span className="text-white/80 text-sm">{new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Text Review Modal */}
          {review.type === 'text' && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
              `}</style>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-all">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
                  </button>
                  <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-900 max-w-48 truncate">
                    {review.title}
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-500">{new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{review.reviewerName?.charAt(0)}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{review.reviewerName}</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-800 text-base leading-relaxed">{review.bodyText || review.title}</p>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublicReviewPreviewModal;
