import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  MicrophoneIcon,
  ClockIcon,
  ChartBarIcon,
  MusicalNoteIcon,
} from "@heroicons/react/16/solid";

const AudioReviews = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Auto-play audio when component mounts
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play was prevented, that's okay
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const features = [
    {
      icon: <MicrophoneIcon className="h-8 w-8" />,
      title: "Crystal Clear Audio",
      description: "High-quality audio recording with noise cancellation technology."
    },
    {
      icon: <MusicalNoteIcon className="h-8 w-8" />,
      title: "Voice Visualization",
      description: "Beautiful waveform visualization that responds to customer voices."
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: "60-Second Limit",
      description: "Perfect length for concise, impactful audio testimonials."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Track audio engagement and conversion rates."
    }
  ];

  const benefits = [
    "Capture authentic customer voices and emotions",
    "Lightweight and fast-loading compared to video",
    "Perfect for mobile users and slower connections",
    "Easy to record and share on social media",
    "Build trust through personal voice connections",
    "Ideal for podcast-style testimonials"
  ];

  const stats = [
    { number: "92%", label: "Higher engagement than text reviews" },
    { number: "2.5x", label: "Faster loading than video testimonials" },
    { number: "60s", label: "Optimal length for maximum retention" },
    { number: "24/7", label: "Automatic collection and processing" }
  ];

  // Generate waveform bars for visualization
  const waveformBars = Array.from({ length: 50 }, () => Math.random() * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Audio Reviews
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
                Capture the power of voice with audio testimonials. Let your customers share their experiences 
                in their own words with crystal-clear audio quality.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-purple-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-black rounded-2xl p-8 shadow-2xl">
                {/* Audio Player */}
                <div className="mb-6">
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    muted={isMuted}
                    loop
                  >
                    <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  
                  {/* Waveform Visualization */}
                  <div className="flex items-end justify-center gap-1 h-24 mb-4">
                    {waveformBars.map((height, index) => (
                      <div
                        key={index}
                        className="bg-purple-400 rounded-full transition-all duration-300"
                        style={{
                          width: '3px',
                          height: `${height}%`,
                          opacity: isPlaying ? 0.8 : 0.4
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Audio Controls */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={togglePlay}
                      className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-all duration-200"
                    >
                      {isPlaying ? (
                        <PauseIcon className="h-6 w-6" />
                      ) : (
                        <PlayIcon className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-all duration-200"
                    >
                      {isMuted ? (
                        <SpeakerXMarkIcon className="h-4 w-4" />
                      ) : (
                        <SpeakerWaveIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  
                  {/* Time Display */}
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Sample Audio Testimonial</h3>
                  <p className="text-gray-300 text-sm">"This product changed everything for our business!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Section */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Audio Reviews?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Audio Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Example Audio Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Example Audio Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <MicrophoneIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                
                {/* Mini Waveform */}
                <div className="flex items-end justify-center gap-1 h-16 mb-4">
                  {Array.from({ length: 20 }, () => Math.random() * 100).map((height, index) => (
                    <div
                      key={index}
                      className="bg-purple-400 rounded-full"
                      style={{
                        width: '2px',
                        height: `${height}%`,
                        opacity: 0.6
                      }}
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">5.0</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Incredible Service</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    "The customer service was outstanding and the product exceeded all expectations!"
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span>Mike Chen, Manager</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Collecting Audio Reviews?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using audio testimonials to build trust and increase conversions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-purple-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioReviews;
