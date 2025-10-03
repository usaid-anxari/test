import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  EyeIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ChatBubbleBottomCenterTextIcon,
  CursorArrowRaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

const FloatingWidget = () => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [filter, setFilter] = useState("all");

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp Inc.",
      rating: 5,
      content: "This product has completely transformed our marketing strategy. The results are incredible!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      type: "video",
      date: "2024-01-15",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "CEO",
      company: "Innovate Solutions",
      rating: 5,
      content: "The ROI we've seen from this platform is remarkable. Essential for our business.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      type: "text",
      date: "2024-01-14",
      likes: 18,
      comments: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Operations Manager",
      company: "StartupXYZ",
      rating: 5,
      content: "Easy to use, powerful features, and excellent customer service. Highly recommended!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      type: "audio",
      date: "2024-01-13",
      likes: 31,
      comments: 12
    },
    {
      id: 4,
      name: "David Kim",
      position: "Product Manager",
      company: "Digital Solutions",
      rating: 5,
      content: "Outstanding platform that has streamlined our entire review process.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      type: "text",
      date: "2024-01-12",
      likes: 15,
      comments: 3
    },
    {
      id: 5,
      name: "Lisa Wang",
      position: "Customer Success",
      company: "Growth Co.",
      rating: 5,
      content: "The customer support is exceptional. They really care about our success!",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      type: "video",
      date: "2024-01-11",
      likes: 42,
      comments: 15
    },
    {
      id: 6,
      name: "Alex Thompson",
      position: "Founder",
      company: "TechStart",
      rating: 5,
      content: "This has been a game-changer for our startup. The analytics are invaluable.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      type: "text",
      date: "2024-01-10",
      likes: 28,
      comments: 9
    }
  ];

  const filteredTestimonials = filter === "all" 
    ? testimonials 
    : testimonials.filter(t => t.type === filter);

  const features = [
    {
      icon: <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />,
      title: "Always Visible",
      description: "Floating bubble stays visible as users scroll through your site."
    },
    {
      icon: <CursorArrowRaysIcon className="h-8 w-8" />,
      title: "High Engagement",
      description: "Catches attention with subtle animations and hover effects."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Friendly",
      description: "Responsive design that works perfectly on all screen sizes."
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Customizable",
      description: "Match your brand colors and choose the perfect position."
    }
  ];

  const benefits = [
    "Maximum visibility with always-on-screen presence",
    "Perfect for highlighting your best testimonial",
    "Non-intrusive design that doesn't block content",
    "Increases trust and credibility across all pages",
    "Easy one-click setup with customizable positioning",
    "Subtle animations that draw attention without being annoying"
  ];

  const stats = [
    { number: "65%", label: "Higher visibility than static testimonials" },
    { number: "1", label: "Featured testimonial always visible" },
    { number: "100%", label: "Mobile responsive" },
    { number: "24/7", label: "Continuous social proof" }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Floating Widget
              </h1>
              <p className="text-xl md:text-2xl text-violet-100 mb-8 leading-relaxed">
                Add a floating testimonial bubble that stays visible as users scroll. Perfect for 
                showcasing your best review with maximum visibility and engagement.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-violet-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-violet-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
                <h3 className="text-lg font-bold mb-6 text-center">Live Demo</h3>
                
                {/* Floating Widget Demo */}
                <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 min-h-[300px]">
                  <div className="text-center text-gray-500 mb-4">
                    <p className="text-sm">Your website content goes here...</p>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                  </div>
                  
                  {/* Floating Bubble */}
                  <div className="absolute bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-4 max-w-xs border border-gray-100 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="flex items-start gap-3">
                      <img
                        src={testimonials[0].image}
                        alt={testimonials[0].name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: testimonials[0].rating }).map((_, i) => (
                            <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-gray-800 mb-2 italic">
                          "{testimonials[0].content.substring(0, 60)}..."
                        </p>
                        <div className="text-xs text-gray-600">
                          <div className="font-semibold">{testimonials[0].name}</div>
                          <div>{testimonials[0].position}</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    {isAutoPlaying ? 'Auto-updating enabled' : 'Auto-updating disabled'}
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
                <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Floating Widget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Floating Widget</h2>
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

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Homepage</h3>
              <p className="text-gray-600 text-sm">Add persistent social proof that follows visitors as they browse your site.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">E-commerce</h3>
              <p className="text-gray-600 text-sm">Build trust throughout the shopping experience with floating testimonials.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Service Pages</h3>
              <p className="text-gray-600 text-sm">Showcase relevant testimonials on specific service or product pages.</p>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Customization Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CogIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Position & Style</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Corner positioning options</li>
                <li>• Custom colors and branding</li>
                <li>• Size and shape customization</li>
                <li>• Animation preferences</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content & Display</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Featured testimonial selection</li>
                <li>• Auto-rotation options</li>
                <li>• Show/hide on specific pages</li>
                <li>• Mobile responsiveness</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Behavior & Analytics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click-through tracking</li>
                <li>• Visibility analytics</li>
                <li>• Conversion measurement</li>
                <li>• A/B testing support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Add a Floating Widget?</h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using floating widgets to maintain constant social proof across their entire website.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-violet-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-violet-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingWidget;
