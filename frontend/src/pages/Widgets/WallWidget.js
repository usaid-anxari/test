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
  PhotoIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/solid";



const WallWidget = () => {
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
      icon: <PhotoIcon className="h-8 w-8" />,
      title: "Social Wall",
      description: "Display testimonials in a social media-style wall format."
    },
    {
      icon: <EyeIcon className="h-8 w-8" />,
      title: "Visual Appeal",
      description: "Create an engaging, scrollable wall of customer testimonials."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Perfect scrolling experience on all devices and screen sizes."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Engagement Tracking",
      description: "Monitor likes, comments, and interactions on each testimonial."
    }
  ];

  const benefits = [
    "Showcase all testimonials in an engaging social media format",
    "Perfect for testimonial pages and social proof sections",
    "Encourages user interaction and engagement",
    "Professional appearance that builds community",
    "Easy to browse and discover customer stories",
    "Optimized for both desktop and mobile viewing"
  ];

  const stats = [
    { number: "45%", label: "Higher engagement than traditional layouts" },
    { number: "∞", label: "Unlimited testimonials display" },
    { number: "100%", label: "Mobile responsive" },
    { number: "24/7", label: "Auto-updating content" }
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
                Wall Widget
              </h1>
              <p className="text-xl md:text-2xl text-violet-100 mb-8 leading-relaxed">
                Create a social media-style wall of testimonials. Display all your customer 
                feedback in an engaging, scrollable format that encourages interaction and discovery.
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
                
                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-6">
                  {[
                    { id: "all", label: "All", count: testimonials.length },
                    { id: "text", label: "Text", count: testimonials.filter(t => t.type === "text").length },
                    { id: "video", label: "Video", count: testimonials.filter(t => t.type === "video").length },
                    { id: "audio", label: "Audio", count: testimonials.filter(t => t.type === "audio").length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                        filter === tab.id
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
                
                {/* Wall Demo */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {filteredTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48x48/6B7280/FFFFFF?text=" + testimonial.name.charAt(0);
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-sm text-gray-500">•</div>
                            <div className="text-sm text-gray-500">{formatDate(testimonial.date)}</div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{testimonial.position} at {testimonial.company}</div>
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">{testimonial.rating}.0</span>
                          </div>
                          <p className="text-gray-800 mb-3 italic">"{testimonial.content}"</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                              <HeartIcon className="h-4 w-4" />
                              <span>{testimonial.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                              <ChatBubbleLeftIcon className="h-4 w-4" />
                              <span>{testimonial.comments}</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <PhotoIcon className="h-4 w-4" />
                              <span className="capitalize">{testimonial.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Wall Widget?</h2>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Wall Widget</h2>
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
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Social Proof Pages</h3>
              <p className="text-gray-600 text-sm">Create dedicated pages showcasing all customer testimonials in a social format.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Company Websites</h3>
              <p className="text-gray-600 text-sm">Display testimonials in an engaging wall format on your main website.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Landing Pages</h3>
              <p className="text-gray-600 text-sm">Add a testimonial wall to increase social proof and conversions.</p>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Design & Layout</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom colors and themes</li>
                <li>• Card layout options</li>
                <li>• Typography customization</li>
                <li>• Spacing and padding control</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content & Filtering</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content type filtering</li>
                <li>• Date range selection</li>
                <li>• Rating-based filtering</li>
                <li>• Search functionality</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interaction & Analytics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Like and comment features</li>
                <li>• Engagement tracking</li>
                <li>• Click-through analytics</li>
                <li>• Social sharing options</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Testimonial Wall?</h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using wall widgets to showcase their testimonials in an engaging social format.
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

export default WallWidget;
