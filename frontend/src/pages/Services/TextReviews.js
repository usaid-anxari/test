import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  PencilIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/16/solid";

const TextReviews = () => {
  const [activeTab, setActiveTab] = useState("features");

  const features = [
    {
      icon: <DocumentTextIcon className="h-8 w-8" />,
      title: "Rich Text Editor",
      description: "Advanced text editor with formatting options and emoji support."
    },
    {
      icon: <PencilIcon className="h-8 w-8" />,
      title: "Easy Writing",
      description: "Simple, intuitive interface for customers to write detailed reviews."
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: "Quick Collection",
      description: "Fast and efficient review collection process for better response rates."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "SEO Optimized",
      description: "Reviews automatically optimized for search engines and social sharing."
    }
  ];

  const benefits = [
    "Fastest and most accessible review format",
    "Perfect for detailed customer feedback",
    "Easy to moderate and edit",
    "Great for SEO and search visibility",
    "Works on all devices and browsers",
    "Ideal for customers who prefer writing",
    "Fastest way to collect customer feedback with google reviews",
  ];

  const stats = [
    { number: "95%", label: "Device compatibility" },
    { number: "2x", label: "Faster than video/audio" },
    { number: "100%", label: "SEO friendly" },
    { number: "24/7", label: "Instant collection" }
  ];

  const exampleReviews = [
    {
      id: 1,
      rating: 5,
      title: "Exceptional Service and Quality",
      content: "I've been using this service for over a year now and I'm consistently impressed with the quality and attention to detail. The customer support team is incredibly responsive and helpful. The product has exceeded all my expectations and I would highly recommend it to anyone looking for a reliable solution.",
      author: "Sarah Johnson",
      position: "Marketing Director",
      company: "TechCorp Inc.",
      date: "2 days ago",
      helpful: 12
    },
    {
      id: 2,
      rating: 5,
      title: "Game-Changer for Our Business",
      content: "This platform has completely transformed how we handle customer feedback. The interface is intuitive, the analytics are comprehensive, and the results speak for themselves. We've seen a 40% increase in customer satisfaction since implementing this solution.",
      author: "Michael Chen",
      position: "Operations Manager",
      company: "Innovate Solutions",
      date: "1 week ago",
      helpful: 8
    },
    {
      id: 3,
      rating: 5,
      title: "Outstanding Value and Performance",
      content: "The ROI we've seen from this investment is incredible. The features are exactly what we needed, the pricing is fair, and the team behind it is genuinely committed to customer success. I can't imagine running our business without it now.",
      author: "Emily Rodriguez",
      position: "CEO",
      company: "StartupXYZ",
      date: "2 weeks ago",
      helpful: 15
    }
  ];

  const tabs = [
    { id: "features", name: "Features", icon: DocumentTextIcon },
    { id: "examples", name: "Examples", icon: ChatBubbleLeftRightIcon },
    { id: "benefits", name: "Benefits", icon: CheckCircleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Text Reviews
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
                Collect detailed, written testimonials from your customers. Perfect for comprehensive feedback 
                and SEO-optimized content that drives organic traffic.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-green-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">5.0</span>
                </div>
                <h3 className="text-lg font-bold mb-3">Amazing Product Experience</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "This product has completely transformed our workflow. The features are exactly what we needed, 
                  the interface is intuitive, and the customer support is outstanding. We've seen incredible results 
                  since implementing this solution."
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">SJ</span>
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-sm text-gray-500">Marketing Director</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">2 days ago</div>
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
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "features" && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Text Reviews?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "examples" && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Example Text Reviews</h2>
            <div className="space-y-6">
              {exampleReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <StarIcon key={index} className="h-5 w-5 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.rating}.0</span>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{review.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">
                          {review.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{review.author}</div>
                        <div className="text-sm text-gray-500">{review.position} at {review.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{review.helpful} found this helpful</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Text Reviews</h2>
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
        )}

        {/* SEO Benefits Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <GlobeAltIcon className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">SEO Benefits</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Text reviews provide powerful SEO benefits that help your business rank higher in search results.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fresh Content</h3>
                <p className="text-gray-600">Regular customer reviews keep your content fresh and relevant for search engines.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Long-tail Keywords</h3>
                <p className="text-gray-600">Customer language naturally includes long-tail keywords that improve search rankings.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">User Engagement</h3>
                <p className="text-gray-600">Reviews increase time on site and reduce bounce rates, improving SEO metrics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Collecting Text Reviews?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using text testimonials to build trust and improve SEO rankings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-green-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextReviews;
