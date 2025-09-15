import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  EyeIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon
} from "@heroicons/react/16/solid";

const CarouselWidget = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp Inc.",
      rating: 5,
      content: "This product has completely transformed our marketing strategy. The results are incredible and the support team is outstanding!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      type: "video",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "CEO",
      company: "Innovate Solutions",
      rating: 5,
      content: "The ROI we've seen from this platform is remarkable. It's become an essential part of our business operations.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      type: "text"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Operations Manager",
      company: "StartupXYZ",
      rating: 5,
      content: "Easy to use, powerful features, and excellent customer service. Highly recommended for any business!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      type: "audio"
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const features = [
    {
      icon: <CogIcon className="h-8 w-8" />,
      title: "Customizable Design",
      description: "Fully customizable colors, fonts, and layout to match your brand."
    },
    {
      icon: <EyeIcon className="h-8 w-8" />,
      title: "Auto-Play Option",
      description: "Automatically cycle through testimonials or manual navigation."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Responsive",
      description: "Perfect display on all devices and screen sizes."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Track engagement, views, and conversion rates."
    }
  ];

  const benefits = [
    "Showcase multiple testimonials in a compact space",
    "Engage visitors with dynamic, rotating content",
    "Highlight your best customer stories",
    "Increase time on site and engagement",
    "Professional appearance that builds trust",
    "Easy to integrate into any website"
  ];

  const stats = [
    { number: "40%", label: "Higher engagement than static testimonials" },
    { number: "3x", label: "More testimonials displayed" },
    { number: "100%", label: "Mobile responsive" },
    { number: "24/7", label: "Automatic rotation" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Carousel Widget
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8 leading-relaxed">
                Display multiple testimonials in an engaging carousel format. Perfect for showcasing 
                your best customer stories with automatic rotation and smooth transitions.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-indigo-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-indigo-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
                <h3 className="text-lg font-bold mb-6 text-center">Live Demo</h3>
                
                {/* Carousel Demo */}
                <div className="relative overflow-hidden rounded-xl bg-gray-50">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {testimonials.map((testimonial, index) => (
                      <div key={testimonial.id} className="w-full flex-shrink-0 p-6">
                        <div className="text-center">
                          <div className="flex justify-center mb-4">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                          <div className="flex items-center justify-center gap-3">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/48x48/6B7280/FFFFFF?text=" + testimonial.name.charAt(0);
                              }}
                            />
                            <div>
                              <div className="font-semibold">{testimonial.name}</div>
                              <div className="text-sm text-gray-500">{testimonial.position} at {testimonial.company}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
                  >
                    <ArrowRightIcon className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                
                {/* Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Auto-play Toggle */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {isAutoPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                    {isAutoPlaying ? 'Auto-playing' : 'Paused'}
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
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Carousel Widget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Carousel Widget</h2>
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

        {/* Customization Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Customization Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CogIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Design & Layout</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom colors and fonts</li>
                <li>• Multiple layout options</li>
                <li>• Responsive design</li>
                <li>• Brand integration</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Animation & Timing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-play speed control</li>
                <li>• Transition effects</li>
                <li>• Pause on hover</li>
                <li>• Manual navigation</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content & Display</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Testimonial selection</li>
                <li>• Display order control</li>
                <li>• Rating display options</li>
                <li>• Customer information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Add a Carousel Widget?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using carousel widgets to showcase their testimonials effectively.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-indigo-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-indigo-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselWidget;
