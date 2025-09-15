import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/16/solid";

const VideoReviews = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play was prevented, that's okay
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const features = [
    {
      icon: <PlayIcon className="h-8 w-8" />,
      title: "High-Quality Recording",
      description: "Capture crystal-clear video testimonials with our advanced recording technology."
    },
    {
      icon: <UsersIcon className="h-8 w-8" />,
      title: "Easy Collection",
      description: "Customers can record video reviews directly from their devices with one click."
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: "60-Second Limit",
      description: "Perfect length for concise, impactful testimonials that keep viewers engaged."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Analytics & Insights",
      description: "Track video performance, engagement rates, and conversion impact."
    }
  ];

  const benefits = [
    "Build trust through authentic customer faces and voices",
    "Increase conversion rates by up to 80% compared to text reviews",
    "Showcase real customer experiences and product benefits",
    "Create compelling social media content",
    "Improve SEO with video content",
    "Stand out from competitors using only text reviews"
  ];

  const stats = [
    { number: "85%", label: "Higher conversion rate with video testimonials" },
    { number: "3x", label: "More engaging than text-only reviews" },
    { number: "60s", label: "Optimal length for maximum engagement" },
    { number: "24/7", label: "Automatic collection and moderation" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Video Reviews
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Capture authentic customer testimonials in video format. Let your customers tell their story 
                in their own voice and build trust like never before.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-blue-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                <video
                  onClick={togglePlay}
                  ref={videoRef}
                  className="w-full h-64 md:h-80 object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 flex items-center justify-center">
                 
                </div>
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={toggleMute}
                    className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="h-5 w-5 text-white" />
                    ) : (
                      <SpeakerWaveIcon className="h-5 w-5 text-white" />
                    )}
                  </button>
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
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Video Reviews?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Video Testimonials</h2>
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

        {/* Example Video Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Example Video Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <video
                  className="w-full h-64 md:h-80 object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                >
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="h-12 w-12 text-white bg-black bg-opacity-50 p-3 rounded-full" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} className="h-5 w-5 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">5.0</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Amazing Product Experience</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    "This product completely transformed my business. The results were incredible and the support team was amazing!"
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>
                    <span>Sarah Johnson, CEO</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Collecting Video Reviews?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using video testimonials to build trust and increase conversions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-blue-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoReviews;
