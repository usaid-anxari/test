import { Link } from "react-router-dom";
import {
  CloudArrowUpIcon,
  PencilIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CursorArrowRaysIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  CogIcon,
} from "@heroicons/react/16/solid";
import Features from "./Features";
import Pricing from "./Pricing";
import Contact from "../Contact";
import { MOCK_REVIEWS } from "../../assets/mockData";
import HomeReviewCard from "../../components/HomeReviewCard";

const Home = () => {
  const featuredReviews = MOCK_REVIEWS.filter(
    (r) => r.status === "approved" && r.type === "video"
  ).slice(0, 3);

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white px-6 py-16 md:p-20 border-b border-gray-200">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="absolute -top-24 -right-24 w-96 h-96 opacity-20 text-orange-300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M41.9,-64.5C54.8,-55.8,66.1,-46.5,73.1,-34.7C80.1,-22.8,82.9,-8.5,80.9,4.8C79,18.2,72.4,30.7,64.1,42.3C55.9,53.9,45.9,64.6,33.7,70.6C21.5,76.7,7.2,78,-5.8,76.3C-18.8,74.7,-30.5,70.1,-42,63.6C-53.4,57.1,-64.6,48.7,-71.9,37.5C-79.1,26.3,-82.4,12.1,-83.1,-2.2C-83.8,-16.5,-81.8,-33,-73.9,-45C-66.1,-56.9,-52.4,-64.4,-38.3,-72.1C-24.2,-79.8,-12.1,-87.6,0.1,-87.8C12.3,-88,24.7,-80.6,41.9,-64.5Z" transform="translate(100 100)" /></svg>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          Transform Customer Feedback Into
          <span className="text-orange-600"> Sales Power</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
          The #1 platform for collecting, moderating, and displaying authentic customer testimonials. 
          Boost trust, increase conversions, and grow your business with powerful video, audio, and text reviews.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Link
            to="/features"
            className="px-12 py-5 text-white bg-orange-600 font-bold text-lg tracking-wide transition-all hover:bg-orange-700 hover:shadow-lg transform hover:-translate-y-1 rounded-lg"
          >
            Explore Features
          </Link>
          <Link
            to="/pricing"
            className="px-12 py-5 text-blue-900 font-bold text-lg border-2 border-blue-900 hover:bg-blue-50 transition-all hover:shadow-lg transform hover:-translate-y-1 rounded-lg"
          >
            Check Pricing
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Enterprise Security</p>
              <p className="text-gray-600 text-sm">Bank-level protection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Global CDN</p>
              <p className="text-gray-600 text-sm">Lightning fast loading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Mobile Optimized</p>
              <p className="text-gray-600 text-sm">Works on all devices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CogIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Easy Integration</p>
              <p className="text-gray-600 text-sm">One-click setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="px-6 py-16 mt-5 md:p-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Trusted by Businesses Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-2xl font-bold text-orange-600 mb-2">10K+</div>
              <p className="text-gray-600 font-sans">Active Businesses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-2xl font-bold text-orange-600 mb-2">2M+</div>
              <p className="text-gray-600 font-sans">Reviews Collected</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-2xl font-bold text-orange-600 mb-2">98%</div>
              <p className="text-gray-600 font-sans">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-2xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600 font-sans">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 py-16 md:p-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-800 mb-16 tracking-tight">
            How TrueTestify Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-orange-100 text-orange-600 p-4 mb-6 rounded-full">
                <CloudArrowUpIcon className="h-7 w-7" />
              </div>
              <h3 className="text-1xl font-bold text-gray-800 mb-4">
                1. Collect Reviews
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Send personalized review links to customers. They can record video, audio, or write text reviews in seconds from any device.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-orange-100 text-orange-600 p-4 mb-6 rounded-full">
                <PencilIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                2. Moderate & Approve
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Review all submissions in your dashboard. Approve the best ones and request changes if needed before they go live.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-orange-100 text-orange-600 p-4 mb-6 rounded-full">
                <PuzzlePieceIcon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                3. Display & Convert
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Embed beautiful widgets on your website. Showcase authentic testimonials that build trust and drive sales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Showcase Section */}
      <div className="px-6 py-16 md:p-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Powerful Widget Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-blue-100 text-blue-900 p-4 mb-4 rounded-lg mx-auto w-16 h-16 flex items-center justify-center">
                <CursorArrowRaysIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Carousel</h3>
              <p className="text-gray-600">Smooth sliding testimonials with autoplay and navigation controls.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-green-100 text-green-500 p-4 mb-4 rounded-lg mx-auto w-16 h-16 flex items-center justify-center">
                <ChartBarIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Grid Layout</h3>
              <p className="text-gray-600">Clean grid display perfect for showcasing multiple testimonials.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-purple-100 text-purple-500 p-4 mb-4 rounded-lg mx-auto w-16 h-16 flex items-center justify-center">
                <StarIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Spotlight</h3>
              <p className="text-gray-600">Feature your best testimonials with prominent display options.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="bg-orange-100 text-orange-600 p-4 mb-4 rounded-lg mx-auto w-16 h-16 flex items-center justify-center">
                <UsersIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Wall</h3>
              <p className="text-gray-600">Social media-style wall showing all your customer reviews.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-6 py-16 md:p-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Why Choose TrueTestify?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-green-100 text-green-500 p-2 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-md font-bold text-gray-800 mb-3">Built-in Moderation</h3>
              <p className="text-gray-600">Review and approve all testimonials before they go live. Maintain quality and brand safety.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-blue-100 text-blue-500 p-3 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">60-Second Limit</h3>
              <p className="text-gray-600">Perfect length for social sharing. Keep testimonials concise and engaging.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-purple-100 text-purple-500 p-3 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <GlobeAltIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">QR Code Collection</h3>
              <p className="text-gray-600">Generate QR codes for offline review collection. Perfect for events and retail locations.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-orange-100 text-orange-500 p-3 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <DevicePhoneMobileIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Mobile-First Design</h3>
              <p className="text-gray-600">Optimized for mobile recording and viewing. Works seamlessly across all devices.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-red-100 text-red-500 p-3 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">Track performance, view engagement metrics, and optimize your testimonial strategy.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-indigo-100 text-indigo-500 p-3 mb-4 rounded-lg w-12 h-12 flex items-center justify-center">
                <CogIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Integration</h3>
              <p className="text-gray-600">One-click setup with WordPress, Shopify, and custom websites. No coding required.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Testimonials Section */}
      {featuredReviews.length > 0 && (
        <div className="px-6 py-16 md:p-20 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-3xl font-extrabold text-gray-800 mb-16 tracking-tight">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredReviews.map((review) => (
                <HomeReviewCard key={review.id} review={review} />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/testimonial"
                className="inline-block px-12 py-5 text-white bg-blue-900 font-bold text-lg tracking-wide transition-all hover:bg-blue-800 hover:shadow-lg transform hover:-translate-y-1 rounded-lg"
              >
                View All Testimonials
              </Link>
            </div>
          </div>
        </div>
      )}

      <Features />
      <Pricing />
      <Contact />
    </div>
  );
};

export default Home;
