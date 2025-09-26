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

const RecordReview = () => {
  const { getInitialData, user } = useContext(AuthContext);
  const { businessName: paramBusinessName } = useParams();
  const businessName = user?.business?.slug || paramBusinessName;
  console.log(businessName);

  const MAX_DURATION_SECONDS = 60;
  const [hasConsented, setHasConsented] = useState(false);
  const requireConsent = JSON.parse(
    localStorage.getItem("showConsent") || "true"
  );
  const [mediaType, setMediaType] = useState("video"); // 'video', 'audio', 'text'
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [title, setTitle] = useState("");
  const [textReview, setTextReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [allowTextReviews, setAllowTextReviews] = useState(false);
  const [allowGoogleReviews, setAllowGoogleReviews] = useState(false);
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

  // Fetch business settings on component mount
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName)
        );
        setBusinessSettings(response.data.business);
        setAllowTextReviews(response.data.business.textReviewsEnabled ?? true);
        setAllowGoogleReviews(response.data.business.googleReviewsEnabled ?? false);
      } catch (error) {
        console.error("Failed to fetch business settings:", error);
        // Default to allowing text reviews if fetch fails
        setAllowTextReviews(true);
      }
    };

    if (businessName) {
      fetchBusinessSettings();
    }
  }, [businessName]);



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
        toast.success("Recording stopped.");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success(`Recording started! Click stop when you're done.`);

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
      toast.success("Review ready to submit!");
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
        toast.success("Your review has been submitted for moderation!");
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

        // Check file size (maximum 2MB limit)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 2) {
          toast.error("File too large. Maximum size is 2MB.");
          return;
        }
        setMediaFile(file);
        setMediaType(isVideo ? "video" : "audio");
      } catch (err) {
        toast.error(
          "Could not read media duration. Please try a different file."
        );
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <div className="relative">
      {/* Top Loading Bar */}
      {isUploading && (
        <div
          className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
        >
          <div
            className="h-full bg-orange-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Centered Loading Spinner */}
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-40">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 text-lg font-semibold">
              Uploading... {progress}%
            </p>
          </div>
        </div>
      )}

      <div
        className={`p-6 bg-white rounded-xl shadow-xl max-w-3xl mx-auto w-full transition-opacity ${
          isUploading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {allowGoogleReviews && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Also Leave a Google Review
            </h3>
            <p className="text-blue-600 text-sm mb-3">
              Help others find us by leaving a review on Google too!
            </p>
            <button
              onClick={() => {
                const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${businessSettings?.googlePlaceId || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}`;
                window.open(googleReviewUrl, '_blank');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              disabled={isUploading}
            >
              <ArrowRightIcon className="w-5 h-5 mr-2" /> 
              Leave Google Review
            </button>
          </div>
        )}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Leave a Review
        </h2>
        <div className="flex justify-center mb-6">
          <div className="flex justify-center space-x-3 bg-gray-100 p-2 rounded-lg">
            <button
              onClick={() => handleMediaTypeChange("video")}
              className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors ${
                mediaType === "video"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isUploading}
            >
              <VideoCameraIcon className="w-5 h-5 mr-2" /> Video
            </button>
            <button
              onClick={() => handleMediaTypeChange("audio")}
              className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors ${
                mediaType === "audio"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isUploading}
            >
              <MicrophoneIcon className="w-5 h-5 mr-2" /> Audio
            </button>
            {allowTextReviews && (
              <button
                onClick={() => handleMediaTypeChange("text")}
                className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors ${
                  mediaType === "text"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isUploading}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" /> Text
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="Great Service"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="John Doe"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="john@example.com"
              required
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>
            <div className="flex mt-2">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={`w-8 h-8 cursor-pointer ${
                    index < rating ? "text-orange-500" : "text-gray-300"
                  } ${isUploading ? "cursor-not-allowed" : ""}`}
                  onClick={() => !isUploading && handleRatingChange(index + 1)}
                />
              ))}
            </div>
          </div>
          {mediaType === "text" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Write your review
              </label>
              <textarea
                value={textReview}
                onChange={(e) => setTextReview(e.target.value)}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Amazing experience!"
                disabled={isUploading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Record or Upload {mediaType}
              </label>
              <div
                className="mt-2 flex justify-center px-4 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                onDrop={isUploading ? undefined : handleDrop}
                onDragOver={isUploading ? undefined : handleDragOver}
              >
                <div className="space-y-4 text-center">
                  {isRecording && mediaType === "video" && (
                    <div className="w-full rounded-lg overflow-hidden flex flex-col items-center justify-center bg-black relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-h-64 object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        REC
                      </div>
                      <div className="absolute bottom-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
                        {formatTime(elapsedSeconds)} /{" "}
                        {formatTime(MAX_DURATION_SECONDS)}
                      </div>
                    </div>
                  )}
                  {isRecording && mediaType === "audio" && (
                    <div className="w-full rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 bg-gray-100">
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
                            audioAnimationRef.current =
                              requestAnimationFrame(draw);
                            analyser.getByteFrequencyData(dataArray);
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            const barWidth = 3;
                            const gap = 2;
                            const totalBars = Math.floor(
                              canvas.width / (barWidth + gap)
                            );
                            const step = Math.floor(bufferLength / totalBars);
                            let x = 0;
                            for (let i = 0; i < totalBars; i++) {
                              const v = dataArray[i * step] / 255;
                              const barHeight = Math.max(2, v * canvas.height);
                              const y = (canvas.height - barHeight) / 2;
                              ctx.fillStyle = "#ef7c00";
                              ctx.fillRect(x, y, barWidth, barHeight);
                              x += barWidth + gap;
                            }
                          };
                          draw();
                        }}
                        width="600"
                        height="64"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        {formatTime(elapsedSeconds)} /{" "}
                        {formatTime(MAX_DURATION_SECONDS)}
                      </p>
                    </div>
                  )}
                  {mediaFile ? (
                    <>
                      {mediaType === "video" && (
                        <video
                          src={URL.createObjectURL(mediaFile)}
                          controls
                          className="w-full max-h-64 mx-auto rounded-md bg-black aspect-video object-contain"
                        />
                      )}
                      {mediaType === "audio" && (
                        <div className="w-full max-h-64 mx-auto px-10 rounded-md aspect-audio object-contain">
                          <audio
                            src={URL.createObjectURL(mediaFile)}
                            controls
                          />
                          {mediaDurationSec != null && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {formatTime(mediaDurationSec)}
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium mt-2"
                        disabled={isUploading}
                      >
                        Remove File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center space-x-4">
                        {isRecording ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            disabled={isUploading}
                          >
                            <StopIcon className="h-5 w-5 mr-2" /> Stop Recording
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            disabled={isUploading}
                          >
                           {mediaType === "video" ? (
                              <VideoCameraIcon className="h-5 w-5 mr-2" />
                            ) : (
                              <MicrophoneIcon className="h-5 w-5 mr-2" />
                            )}  Record{" "}
                            {mediaType} (WEBM)
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-4">OR</p>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500 ${
                            isUploading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        >
                          <span>Upload a file</span>
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
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {mediaType === "video"
                          ? "WEBM, MP4, MOV"
                          : "WEBM, MP3, WAV"}{" "}
                        up to 60 seconds, max 2MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-start">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={hasConsented}
              onChange={() => setHasConsented(!hasConsented)}
              className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              disabled={isUploading}
            />
            <label
              htmlFor="consent"
              className="ml-3 text-sm font-medium text-gray-700"
            >
              I agree to be recorded and allow {businessName} to use my review
              publicly.
            </label>
          </div>
          <div className="pt-5">
            <button
              type="submit"
              className={`w-full px-4 py-3 text-lg font-bold rounded-full transition-colors ${
                hasConsented &&
                (mediaFile || (mediaType === "text" && textReview.trim())) &&
                title.trim() &&
                reviewerName.trim() &&
                email &&
                rating > 0
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
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
              {isUploading ? `Uploading ${progress}%` : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordReview;
