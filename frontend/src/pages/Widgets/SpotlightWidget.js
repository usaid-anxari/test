import { useState, useEffect } from "react";
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
  SparklesIcon,
  UserIcon,
  HeartIcon,
} from "@heroicons/react/16/solid";

const SpotlightWidget = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp Inc.",
      rating: 5,
      content: "This product has completely transformed our marketing strategy. The results are incredible and the support team is outstanding! We've seen a 300% increase in our conversion rates since implementing this solution.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      type: "video",
      featured: true,
      stats: { views: 1247, likes: 89, shares: 23 }
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "CEO",
      company: "Innovate Solutions",
      rating: 5,
      content: "The ROI we've seen from this platform is remarkable. It's become an essential part of our business operations. The analytics and insights have helped us make data-driven decisions that have increased our revenue by 40%.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      type: "text",
      featured: true,
      stats: { views: 892, likes: 67, shares: 15 }
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Operations Manager",
      company: "StartupXYZ",
      rating: 5,
      content: "Easy to use, powerful features, and excellent customer service. Highly recommended for any business! The platform has streamlined our entire review process and our customers love the seamless experience.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      type: "audio",
      featured: true,
      stats: { views: 756, likes: 45, shares: 12 }
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Featured Spotlight",
      description: "Highlight your best testimonials with special spotlight treatment."
    },
    {
      icon: <EyeIcon className="h-8 w-8" />,
      title: "Visual Impact",
      description: "Create maximum visual impact with large, prominent testimonial display."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Perfect display on all devices with responsive design."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Engagement Analytics",
      description: "Track views, likes, and shares for each spotlight testimonial."
    }
  ];

  const benefits = [
    "Showcase your most impactful testimonials prominently",
    "Create maximum visual impact and attention",
    "Perfect for hero sections and landing pages",
    "Increase engagement with featured content",
    "Professional appearance that commands attention",
    "Easy to customize and brand to your style"
  ];

  const stats = [
    { number: "85%", label: "Higher engagement than regular testimonials" },
    { number: "3x", label: "More visual impact" },
    { number: "100%", label: "Mobile responsive" },
    { number: "24/7", label: "Automatic rotation" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Spotlight Widget
              </h1>
              <p className="text-xl md:text-2xl text-pink-100 mb-8 leading-relaxed">
                Put your best testimonials in the spotlight. Create maximum visual impact with 
                large, prominent displays that command attention and build trust instantly.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-pink-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-pink-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
                <h3 className="text-lg font-bold mb-6 text-center">Live Demo</h3>
                
                {/* Spotlight Demo */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-6">
                  <div className="absolute top-4 right-4">
                    <SparklesIcon className="h-6 w-6 text-pink-500" />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                        <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-800 mb-6 italic leading-relaxed">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <img
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x64/6B7280/FFFFFF?text=" + testimonials[currentTestimonial].name.charAt(0);
                        }}
                      />
                      <div>
                        <div className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                        <div className="text-sm text-gray-600">{testimonials[currentTestimonial].position} at {testimonials[currentTestimonial].company}</div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{testimonials[currentTestimonial].stats.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{testimonials[currentTestimonial].stats.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{testimonials[currentTestimonial].stats.shares}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentTestimonial ? 'bg-pink-600' : 'bg-gray-300'
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
                    {isAutoPlaying ? 'Auto-rotating' : 'Paused'}
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
                <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Spotlight Widget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-pink-100 text-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Spotlight Widget</h2>
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
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hero Sections</h3>
              <p className="text-gray-600 text-sm">Make a powerful first impression with a spotlight testimonial in your hero section.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Landing Pages</h3>
              <p className="text-gray-600 text-sm">Increase conversions by featuring your best customer story prominently.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Award Pages</h3>
              <p className="text-gray-600 text-sm">Showcase customer success stories and testimonials in a prestigious way.</p>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Customization Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-pink-100 text-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CogIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Design & Styling</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom colors and gradients</li>
                <li>• Multiple background options</li>
                <li>• Typography customization</li>
                <li>• Border and shadow effects</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-pink-100 text-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Animation & Timing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-rotation speed control</li>
                <li>• Transition effects</li>
                <li>• Pause on hover</li>
                <li>• Manual navigation</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="bg-pink-100 text-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content & Display</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Featured testimonial selection</li>
                <li>• Display order control</li>
                <li>• Rating display options</li>
                <li>• Customer information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Spotlight Your Best Testimonials?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using spotlight widgets to showcase their most impactful testimonials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-pink-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-pink-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightWidget;
