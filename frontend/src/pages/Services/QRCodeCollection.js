import { useState } from "react";
import { Link } from "react-router-dom";
import {
  QrCodeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
} from "@heroicons/react/16/solid";

const QRCodeCollection = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a simple QR code pattern (this is a visual representation)
  const generateQRPattern = () => {
    const size = 21;
    const pattern = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Create a pattern that looks like a QR code
        const isBlack = Math.random() > 0.5;
        row.push(isBlack);
      }
      pattern.push(row);
    }
    return pattern;
  };

  const [qrPattern] = useState(generateQRPattern());

  const features = [
    {
      icon: <QrCodeIcon className="h-8 w-8" />,
      title: "Instant Generation",
      description: "Generate QR codes instantly for any business or campaign."
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Perfect for mobile users to scan and leave reviews on the go."
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8" />,
      title: "Offline Collection",
      description: "Collect reviews even when customers are offline or away from computers."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Track Performance",
      description: "Monitor QR code scans, conversions, and review submissions."
    }
  ];

  const benefits = [
    "Collect reviews from customers anywhere, anytime",
    "Perfect for physical locations and events",
    "No internet connection required for customers",
    "Easy to print and display on materials",
    "Track which QR codes generate the most reviews",
    "Integrate with existing marketing materials"
  ];

  const stats = [
    { number: "3x", label: "More reviews collected with QR codes" },
    { number: "85%", label: "Mobile scan rate" },
    { number: "24/7", label: "Always accessible" },
    { number: "100%", label: "Offline compatible" }
  ];

  const useCases = [
    {
      title: "Restaurants & Cafes",
      description: "Place QR codes on tables, receipts, and menus to collect dining experiences.",
      icon: "🍽️"
    },
    {
      title: "Retail Stores",
      description: "Display QR codes at checkout counters and product displays.",
      icon: "🛍️"
    },
    {
      title: "Service Businesses",
      description: "Include QR codes on business cards, invoices, and service reports.",
      icon: "🔧"
    },
    {
      title: "Events & Conferences",
      description: "Place QR codes on event materials, badges, and presentation slides.",
      icon: "🎪"
    }
  ];

  const handleDownloadQR = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would download the QR code image
      alert("QR Code downloaded successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                QR Code Collection
              </h1>
              <p className="text-xl md:text-2xl text-orange-100 mb-8 leading-relaxed">
                Collect customer reviews anywhere with QR codes. Perfect for physical locations, 
                events, and offline review collection.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 text-orange-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/support"
                  className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-orange-600 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sample QR Code</h3>
                  {/* QR Code Visualization */}
                  <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg mb-4">
                    <div className="grid grid-cols-21 gap-0.5">
                      {qrPattern.map((row, i) => (
                        row.map((cell, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`w-2 h-2 ${cell ? 'bg-black' : 'bg-white'}`}
                          />
                        ))
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Scan to leave a review</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleDownloadQR}
                      disabled={isGenerating}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2">
                      <ShareIcon className="h-4 w-4" />
                      Share
                    </button>
                  </div>
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
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose QR Code Collection?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-orange-100 text-orange-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of QR Code Collection</h2>
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

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Generate QR Code</h3>
              <p className="text-gray-600">Create a unique QR code for your business in seconds from your dashboard.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Display & Share</h3>
              <p className="text-gray-600">Print and display QR codes in your physical location or share digitally.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Collect Reviews</h3>
              <p className="text-gray-600">Customers scan the QR code and leave reviews directly on their mobile devices.</p>
            </div>
          </div>
        </div>

        {/* Example QR Codes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Example QR Code Uses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Table Tent", description: "Restaurant table display", views: 156 },
              { title: "Business Card", description: "Professional networking", views: 89 },
              { title: "Receipt", description: "Post-purchase follow-up", views: 234 }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="w-24 h-24 mx-auto bg-gray-300 rounded-lg flex items-center justify-center">
                    <QrCodeIcon className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <EyeIcon className="h-4 w-4" />
                  <span>{item.views} scans</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Collecting Reviews with QR Codes?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using QR codes to collect customer reviews anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-8 py-4 text-orange-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-orange-600 transition-colors duration-200"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCollection;
