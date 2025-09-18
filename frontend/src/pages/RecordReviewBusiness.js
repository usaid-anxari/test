import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  StopIcon,
  VideoCameraIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";

const RecordReviewBusiness = () => {
  const { getInitialData, user } = useContext(AuthContext);
  const { businessName: paramBusinessName } = useParams();
  const businessName = user?.business?.slug || paramBusinessName;

  const MAX_DURATION_SECONDS = 60;
  const [hasConsented, setHasConsented] = useState(false);
  const requireConsent = JSON.parse(
    localStorage.getItem("showConsent") || "true"
  );
  const [mediaType, setMediaType] = useState("video");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [title, setTitle] = useState("");
  const [textReview, setTextReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allowTextReviews, setAllowTextReviews] = useState(
    getInitialData("allowTextReviews", false)
  );
  const [allowTextGoogleReviews, setAllowTextGoogleReviews] = useState(
    getInitialData("allowTextGoogleReviews", false)
  );
  const navigate = useNavigate();

  // State for MediaRecorder
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [mediaChunks, setMediaChunks] = useState([]);
  const recordTimeoutRef = useRef(null);
  const recordStartAtRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const videoRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioAnimationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [mediaDurationSec, setMediaDurationSec] = useState(null);

  // Allowed mimetypes
  const allowedVideoMimetypes = ["video/webm", "video/mp4", "video/quicktime"];
  const allowedAudioMimetypes = ["audio/webm", "audio/mpeg", "audio/wav"];

  // Normalize mimetype (remove codec information)
  const normalizeMimetype = (mimetype) => mimetype.split(";")[0];

  useEffect(() => {
    const handleStorageChange = () => {
      setAllowTextReviews(getInitialData("allowTextReviews", false));
      setAllowTextGoogleReviews(
        getInitialData("allowTextGoogleReviews", false)
      );
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getInitialData]);

  const cleanupActiveMedia = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    } catch (_) {}
    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    if (stream) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch (_) {}
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (_) {}
    }
    setStream(null);
    setMediaRecorder(null);
    setIsRecording(false);
    setMediaChunks([]);
    setElapsedSeconds(0);
  };

  const handleMediaTypeChange = (next) => {
    if (mediaType === next) return;
    cleanupActiveMedia();
    setMediaType(next);
    setMediaFile(null);
  };

  useEffect(() => {
    if (mediaType === "video" && stream && videoRef.current) {
      try {
        videoRef.current.srcObject = stream;
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(() => {});
        }
      } catch (_) {}
    }
  }, [stream, mediaType]);

  useEffect(() => {
    (async () => {
      if (mediaFile) {
        try {
          const d = await getMediaDuration(mediaFile);
          if (isFinite(d)) setMediaDurationSec(Math.round(d));
          else setMediaDurationSec(null);
        } catch (e) {
          setMediaDurationSec(null);
        }
      } else {
        setMediaDurationSec(null);
      }
    })();
  }, [mediaFile]);

  useEffect(() => {
    if (mediaChunks.length > 0 && !isRecording) {
      const blob = new Blob(mediaChunks, {
        type: mediaType === "video" ? "video/webm" : "audio/webm",
      });
      const file = new File([blob], `review_${Date.now()}.webm`, {
        type: mediaType === "video" ? "video/webm" : "audio/webm",
      });
      setMediaFile(file);
    }
  }, [mediaChunks, isRecording, mediaType]);

  const startRecording = async () => {
    setMediaChunks([]);
    setMediaFile(null);
    setStream(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: mediaType === "video",
        audio: true,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const options = {
        mimeType: mediaType === "video" ? "video/webm" : "audio/webm",
      };
      const recorder = new MediaRecorder(mediaStream, options);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setMediaChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      recorder.onstop = () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setStream(null);
        setMediaRecorder(null);
        setIsRecording(false);
        toast.success("Recording completed successfully!");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success(`Recording started! Maximum ${MAX_DURATION_SECONDS} seconds.`);

      if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = setTimeout(() => {
        if (recorder && recorder.state !== "inactive") {
          recorder.stop();
          toast.error(
            `Maximum ${MAX_DURATION_SECONDS}s reached. Recording stopped.`
          );
        }
      }, MAX_DURATION_SECONDS * 1000);

      recordStartAtRef.current = Date.now();
      setElapsedSeconds(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(
          Math.min(
            MAX_DURATION_SECONDS,
            Math.floor((Date.now() - recordStartAtRef.current) / 1000)
          )
        );
      }, 200);

      if (mediaType === "audio") {
        try {
          const audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
          await audioCtx.resume();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(mediaStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.85;
          source.connect(analyser);
          audioAnalyserRef.current = analyser;
        } catch (e) {
          // Ignore waveform errors
        }
      }
    } catch (err) {
      console.error("Recording error:", err);
      toast.error(`Error starting recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (stream) {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch (_) {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    setStream(null);
    setMediaRecorder(null);
    setIsRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requireConsent && !hasConsented) {
      toast.error("Please agree to the terms before submitting.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a review title.");
      return;
    }
    if (!reviewerName.trim()) {
      toast.error("Please provide your name.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please provide a valid email address.");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }
    if (mediaType !== "text" && !mediaFile) {
      toast.error(`Please record or upload a ${mediaType}.`);
      return;
    }
    if (mediaType === "text" && textReview.trim().length < 10) {
      toast.error("Text review must be at least 10 characters.");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      const formData = new FormData();
      formData.append("type", mediaType);
      formData.append("title", title);
      formData.append("rating", rating.toString());
      formData.append("reviewerName", reviewerName);
      formData.append("consentChecked", hasConsented.toString());
      formData.append("reviewerContactJson", JSON.stringify({ email }));
      formData.append("source", "website");
      if (mediaType === "text") {
        formData.append("bodyText", textReview);
      }
      if (mediaType !== "text" && mediaFile) {
        const normalizedType = normalizeMimetype(mediaFile.type);
        const file = new File([mediaFile], mediaFile.name, {
          type: normalizedType,
        });
        formData.append("file", file);
      }

      const response = await axiosInstance.post(
        API_PATHS.REVIEWS.CREATE_REVIEW(businessName),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        toast.success("Your review has been submitted successfully!");
        setIsUploading(false);
        setProgress(0);
        setMediaFile(null);
        setTextReview("");
        setTitle("");
        setReviewerName("");
        setEmail("");
        setRating(0);
        setHasConsented(false);
      }
    } catch (error) {
      console.error("Submission failed:", error.response?.data || error);
      const errorMessage = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(", ")
        : error.response?.data?.message || error.message;
      toast.error(`Failed to submit review: ${errorMessage}`);
      setIsUploading(false);
      setProgress(0);
    }
  };

  const getMediaDuration = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const element = document.createElement(
        file.type.startsWith("audio") ? "audio" : "video"
      );
      element.preload = "metadata";
      element.src = url;
      element.onloadedmetadata = () => {
        const duration = element.duration;
        URL.revokeObjectURL(url);
        resolve(duration);
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load media metadata"));
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const isVideo = mediaType === "video";
        const allowedMimetypes = isVideo
          ? allowedVideoMimetypes
          : allowedAudioMimetypes;
        const normalizedType = normalizeMimetype(file.type);
        const isValidMimetype = allowedMimetypes.includes(normalizedType);
        if (!isValidMimetype) {
          toast.error(
            `Please upload a ${
              isVideo ? "video (WEBM, MP4, MOV)" : "audio (WEBM, MP3, WAV)"
            }.`
          );
          return;
        }

        const duration = await getMediaDuration(file);
        if (isFinite(duration) && duration > MAX_DURATION_SECONDS) {
          toast.error(
            `Media exceeds ${MAX_DURATION_SECONDS}s. Please upload a shorter file.`
          );
          return;
        }
        setMediaFile(file);
        setMediaType(isVideo ? "video" : "audio");
        toast.success("File uploaded successfully!");
      } catch (err) {
        toast.error(
          "Could not read media duration. Please try a different file."
        );
      }
    }
  };

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="min-h-screen hero-business">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 hero-content">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl hover-glow" style={{
                background: 'linear-gradient(135deg, #ef7c00 0%, #f97316 100%)'
              }}>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-slow">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="heading-1 mb-4">Share Your Experience</h1>
            <p className="text-lead max-w-2xl mx-auto mb-8">
              Your authentic review helps others discover {businessName}. Share your story in just a few minutes.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">Secure & Private</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Takes 3 Minutes</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">Help Others</span>
              </div>
            </div>
          </div>
          
          {/* Main Form Card */}
          <div className="card-business scale-in">
            {allowTextGoogleReviews && (
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <button
                  onClick={() => navigate("/reviews/google-embed")}
                  className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  disabled={isUploading}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>Leave a Google Review Instead</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-8">
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    Review Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-professional focus-ring-orange"
                    placeholder="e.g., Outstanding service and quality!"
                    disabled={isUploading}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="input-professional focus-ring"
                      placeholder="John Smith"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-professional focus-ring"
                      placeholder="john@example.com"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-gray-500 mt-2">We'll only use this to verify your review</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                            star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                          }`}
                          disabled={isUploading}
                        >
                          <StarIcon className="h-10 w-10" />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                        <span className="text-yellow-800 font-semibold">
                          {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good!' : rating === 2 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Type Selection */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m-6 0h8m-8 0a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2m-8 0V4" />
                    </svg>
                    Choose Review Type *
                  </h3>
                  <div className="grid-3">
                    {[
                      { type: 'video', icon: VideoCameraIcon, color: 'orange', desc: 'Record or upload video' },
                      { type: 'audio', icon: MicrophoneIcon, color: 'purple', desc: 'Record or upload audio' },
                      ...(allowTextReviews ? [{ type: 'text', icon: DocumentTextIcon, color: 'green', desc: 'Write your review' }] : [])
                    ].map(({ type, icon: Icon, color, desc }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleMediaTypeChange(type)}
                        className={`p-6 border-2 rounded-2xl text-center transition-all duration-300 hover-lift ${
                          mediaType === type
                            ? `border-${color}-500 bg-${color}-50 text-${color}-700 shadow-lg scale-105`
                            : "border-gray-300 hover:border-gray-400 bg-white"
                        }`}
                        disabled={isUploading}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                          mediaType === type ? `bg-${color}-100` : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            mediaType === type ? `text-${color}-600` : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="font-semibold capitalize mb-1">{type} Review</div>
                        <p className="text-xs text-gray-500">{desc}</p>
                        {mediaType === type && (
                          <div className="mt-3">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-medium`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Selected
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {mediaType === "text" && (
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Your Detailed Review *
                    </label>
                    <textarea
                      required
                      value={textReview}
                      onChange={(e) => setTextReview(e.target.value)}
                      rows={8}
                      className="textarea-professional focus-ring"
                      placeholder="Share your detailed experience... What did you love? What made it special? How did it help you?"
                      disabled={isUploading}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">Be specific and honest - your review helps others make informed decisions</p>
                      <span className={`text-xs font-medium ${
                        textReview.length < 50 ? 'text-red-500' : textReview.length < 100 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {textReview.length} characters
                      </span>
                    </div>
                  </div>
                )}

                {(mediaType === "video" || mediaType === "audio") && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8">
                    <div className="text-center">
                      <div className="mb-6">
                        <label className="form-label flex items-center justify-center gap-2 text-lg">
                          {mediaType === "video" ? (
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          )}
                          {mediaType === "video" ? "Video" : "Audio"} Review *
                        </label>

                        {isRecording && mediaType === "video" && (
                          <div className="relative w-full max-w-lg mx-auto mb-6">
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              className="w-full rounded-2xl bg-black aspect-video object-cover shadow-2xl border-4 border-white"
                            />
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg animate-pulse">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                {formatTime(elapsedSeconds)} / {formatTime(MAX_DURATION_SECONDS)}
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full">
                              Recording in progress...
                            </div>
                          </div>
                        )}

                        {isRecording && mediaType === "audio" && (
                          <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 mb-6">
                            <div className="relative w-full">
                              <canvas
                                ref={(el) => {
                                  audioCanvasRef.current = el;
                                  if (!el || !audioAnalyserRef.current) return;
                                  const canvas = el;
                                  const ctx = canvas.getContext("2d");
                                  const analyser = audioAnalyserRef.current;
                                  const bufferLength = analyser.frequencyBinCount;
                                  const dataArray = new Uint8Array(bufferLength);
                                  const draw = () => {
                                    audioAnimationRef.current = requestAnimationFrame(draw);
                                    analyser.getByteFrequencyData(dataArray);
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    const barWidth = 4;
                                    const gap = 2;
                                    const totalBars = Math.floor(canvas.width / (barWidth + gap));
                                    const step = Math.floor(bufferLength / totalBars);
                                    let x = 0;
                                    for (let i = 0; i < totalBars; i++) {
                                      const v = dataArray[i * step] / 255;
                                      const barHeight = Math.max(4, v * canvas.height);
                                      const y = (canvas.height - barHeight) / 2;
                                      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                                      gradient.addColorStop(0, '#8b5cf6');
                                      gradient.addColorStop(1, '#a855f7');
                                      ctx.fillStyle = gradient;
                                      ctx.fillRect(x, y, barWidth, barHeight);
                                      x += barWidth + gap;
                                    }
                                  };
                                  draw();
                                }}
                                width="800"
                                height="80"
                                className="w-full rounded-xl"
                              />
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="font-semibold">Recording</span>
                              </div>
                              <div className="text-purple-600 font-mono text-lg">
                                {formatTime(elapsedSeconds)} / {formatTime(MAX_DURATION_SECONDS)}
                              </div>
                            </div>
                          </div>
                        )}

                        {mediaFile ? (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
                            {mediaType === "video" && (
                              <video
                                src={URL.createObjectURL(mediaFile)}
                                controls
                                className="w-full max-h-80 mx-auto rounded-xl bg-black aspect-video object-contain shadow-lg"
                              />
                            )}
                            {mediaType === "audio" && (
                              <div className="text-center py-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                  </svg>
                                </div>
                                <audio
                                  src={URL.createObjectURL(mediaFile)}
                                  controls
                                  className="w-full max-w-md mx-auto"
                                />
                                {mediaDurationSec != null && (
                                  <p className="text-sm text-gray-600 mt-3 font-medium">
                                    Duration: {formatTime(mediaDurationSec)}
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="flex justify-center mt-4">
                              <button
                                type="button"
                                onClick={() => setMediaFile(null)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium"
                                disabled={isUploading}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove & Try Again
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex justify-center">
                              {isRecording ? (
                                <button
                                  type="button"
                                  onClick={stopRecording}
                                  className="inline-flex items-center gap-3 px-8 py-4 border border-transparent rounded-2xl shadow-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300 hover-lift font-semibold text-lg"
                                  disabled={isUploading}
                                >
                                  <StopIcon className="h-6 w-6" />
                                  Stop Recording
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={startRecording}
                                  className="inline-flex items-center gap-3 px-8 py-4 border border-transparent rounded-2xl shadow-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 hover-lift font-semibold text-lg"
                                  disabled={isUploading}
                                >
                                  {mediaType === "video" ? (
                                    <VideoCameraIcon className="h-6 w-6" />
                                  ) : (
                                    <MicrophoneIcon className="h-6 w-6" />
                                  )}
                                  Start Recording {mediaType === "video" ? "Video" : "Audio"}
                                </button>
                              )}
                            </div>
                            
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 text-gray-500 font-medium">OR</span>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <label
                                htmlFor="file-upload"
                                className={`group relative cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-medium text-gray-700 hover:text-blue-600 ${
                                  isUploading ? "cursor-not-allowed opacity-50" : "hover-lift"
                                }`}
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>Upload {mediaType === "video" ? "Video" : "Audio"} File</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept={
                                    mediaType === "video"
                                      ? "video/webm,video/mp4,video/quicktime"
                                      : "audio/webm,audio/mpeg,audio/wav"
                                  }
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                />
                              </label>
                              <p className="text-sm text-gray-500 mt-3">
                                Supported formats: {mediaType === "video" ? "MP4, MOV, WEBM" : "MP3, WAV, WEBM"} • Max 60 seconds • Up to 50MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Consent Section */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        checked={hasConsented}
                        onChange={() => setHasConsented(!hasConsented)}
                        className="h-5 w-5 text-orange-500 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-500/20 transition-all"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="consent"
                        className="text-sm font-medium text-gray-800 cursor-pointer"
                      >
                        <span className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Privacy & Consent Agreement
                        </span>
                        I consent to {businessName} using my review publicly on their website and marketing materials. I understand my review will be moderated before publication.
                      </label>
                      <p className="text-xs text-gray-600 mt-2">
                        Your personal information is secure and will only be used for review verification. You can request removal at any time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className={`w-full px-8 py-5 text-xl font-bold rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                      hasConsented &&
                      (mediaFile || (mediaType === "text" && textReview.trim())) &&
                      title.trim() &&
                      reviewerName.trim() &&
                      email &&
                      rating > 0
                        ? "text-white shadow-2xl hover-lift"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    style={{
                      background: hasConsented &&
                        (mediaFile || (mediaType === "text" && textReview.trim())) &&
                        title.trim() &&
                        reviewerName.trim() &&
                        email &&
                        rating > 0
                        ? 'linear-gradient(135deg, #ef7c00 0%, #f97316 100%)'
                        : undefined
                    }}
                    disabled={
                      isUploading ||
                      !(
                        hasConsented &&
                        (mediaFile || (mediaType === "text" && textReview.trim())) &&
                        title.trim() &&
                        reviewerName.trim() &&
                        email &&
                        rating > 0
                      )
                    }
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="loading-spinner w-6 h-6 border-3"></div>
                        <span>Uploading Your Review... {progress}%</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-3 relative z-10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Submit My Review</span>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        {hasConsented &&
                          (mediaFile || (mediaType === "text" && textReview.trim())) &&
                          title.trim() &&
                          reviewerName.trim() &&
                          email &&
                          rating > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Your review will be moderated before going live. Thank you for sharing your experience!
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordReviewBusiness;