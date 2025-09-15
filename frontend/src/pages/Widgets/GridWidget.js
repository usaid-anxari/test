import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  RectangleStackIcon,
} from "@heroicons/react/16/solid";

const GridWidget = () => {
  const [activeLayout, setActiveLayout] = useState("2x2");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp Inc.",
      rating: 5,
      content: "This product has completely transformed our marketing strategy. The results are incredible!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      type: "video"
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "CEO",
      company: "Innovate Solutions",
      rating: 5,
      content: "The ROI we've seen from this platform is remarkable. Essential for our business.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      type: "text"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Operations Manager",
      company: "StartupXYZ",
      rating: 5,
      content: "Easy to use, powerful features, and excellent customer service. Highly recommended!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      type: "audio"
    },
    {
      id: 4,
      name: "David Kim",
      position: "Product Manager",
      company: "Digital Solutions",
      rating: 5,
      content: "Outstanding platform that has streamlined our entire review process.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      type: "text"
    }
  ];

  const layouts = [
    { id: "2x2", name: "2x2 Grid", icon: Squares2X2Icon, cols: 2 },
    { id: "3x2", name: "3x2 Grid", icon: ViewColumnsIcon, cols: 3 },
    { id: "4x1", name: "4x1 Row", icon: RectangleStackIcon, cols: 4 }
  ];

  const features = [
    {
      icon: <Squares2X2Icon className="h-8 w-8" />,
      title: "Flexible Layouts",
      description: "Choose from multiple grid layouts to fit your website design."
    },
    {
      icon: <EyeIcon className="h-8 w-8" />,
      title: "Visual Impact",
      description: "Display multiple testimonials in an organized, visually appealing grid."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Responsive",
      description: "Automatically adapts to different screen sizes and devices."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Track which testimonials get the most engagement and clicks."
    }
  ];

  const benefits = [
    "Showcase multiple testimonials in a clean, organized layout",
    "Perfect for product pages and landing pages",
    "Easy to scan and read customer feedback",
    "Professional appearance that builds trust",
    "Flexible grid options for different content needs",
    "Optimized for both desktop and mobile viewing"
  ];

  const stats = [
    { number: "35%", label: "Higher engagement than single testimonials" },
    { number: "4x", label: "More testimonials visible at once" },
    { number: "100%", label: "Mobile responsive" },
    { number: "3", label: "Layout options available" }
  ];

  const getGridCols = () => {
    const layout = layouts.find(l => l.id === activeLayout);
    return layout ? layout.cols : 2;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Grid Widget
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
                Display multiple testimonials in a clean, organized grid layout. Perfect for showcasing 
                customer feedback in a visually appealing and easy-to-scan format.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-emerald-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-emerald-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
                <h3 className="text-lg font-bold mb-6 text-center">Live Demo</h3>
                
                {/* Layout Selector */}
                <div className="flex justify-center gap-2 mb-6">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setActiveLayout(layout.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                        activeLayout === layout.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <layout.icon className="h-4 w-4" />
                      {layout.name}
                    </button>
                  ))}
                </div>
                
                {/* Grid Demo */}
                <div className={`grid gap-4 ${getGridCols() === 2 ? 'grid-cols-2' : getGridCols() === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {testimonials.slice(0, getGridCols() * 2).map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{testimonial.rating}.0</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 italic">"{testimonial.content}"</p>
                      <div className="flex items-center gap-2">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32x32/6B7280/FFFFFF?text=" + testimonial.name.charAt(0);
                          }}
                        />
                        <div>
                          <div className="text-xs font-semibold">{testimonial.name}</div>
                          <div className="text-xs text-gray-500">{testimonial.position}</div>
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
                    {isAutoPlaying ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
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
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Grid Widget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Grid Widget</h2>
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

        {/* Layout Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Layout Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {layouts.map((layout) => (
              <div key={layout.id} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <layout.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{layout.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {layout.id === "2x2" && "Perfect for showcasing 4 key testimonials"}
                  {layout.id === "3x2" && "Great for displaying 6 testimonials in a compact space"}
                  {layout.id === "4x1" && "Ideal for a horizontal row of testimonials"}
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className={`grid gap-2 ${
                    layout.id === "2x2" ? "grid-cols-2" : 
                    layout.id === "3x2" ? "grid-cols-3" : "grid-cols-4"
                  }`}>
                    {Array.from({ length: layout.id === "2x2" ? 4 : layout.id === "3x2" ? 6 : 4 }).map((_, i) => (
                      <div key={i} className="w-full h-8 bg-emerald-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Homepage</h3>
              <p className="text-gray-600 text-sm">Display key testimonials prominently on your homepage to build immediate trust.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Product Pages</h3>
              <p className="text-gray-600 text-sm">Showcase customer reviews for specific products or services.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Landing Pages</h3>
              <p className="text-gray-600 text-sm">Add social proof to your landing pages to increase conversions.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Add a Grid Widget?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using grid widgets to showcase their testimonials effectively.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-emerald-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-emerald-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridWidget;
