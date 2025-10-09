import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PublicReviews = ({ businessSlug }) => {
  const { businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFilters, setReviewFilters] = useState({
    video: true,
    audio: true,
    text: true,
    google: true
  });  
  

  // Fetching Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName || businessSlug));
      setBusiness(response.data.business || null);
      const allReviewsData = response.data.reviews || [];
      setAllReviews(allReviewsData);
      setReviews(allReviewsData);
      setWidgets([
        { type: 'video', active: true },
        { type: 'audio', active: true },
        { type: 'text', active: response.data.business?.textReviewsEnabled ?? true }
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Could not load business data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    const newFilters = {
      ...reviewFilters,
      [type]: !reviewFilters[type]
    };
    setReviewFilters(newFilters);
    
    // Apply filters
    const filtered = allReviews.filter(review => {
      return newFilters[review.type] === true;
    });
    setReviews(filtered);
  };

  // Get count for each review type
  const getReviewTypeCount = (type) => {
    return allReviews.filter(review => review.type === type).length;
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line
  }, [businessName, businessSlug]);

  // Render review form based on active widgets
  const renderReviewForm = () => {
    if (!showReviewForm) return null;
    
    const activeWidgets = widgets.filter(w => w.active);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Write a Review</h3>
                  <p className="text-green-100 text-sm">Share your experience with {business?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-white hover:text-green-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-6 text-center">
              Choose how you'd like to share your review
            </p>
            
            <div className="space-y-3">
              {activeWidgets.map((widget) => (
                <Link
                  key={widget.type}
                  to={`/record/${business?.slug}?type=${widget.type}`}
                  className="group block p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-200 hover:bg-green-50"
                  onClick={() => setShowReviewForm(false)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                      widget.type === 'video' ? 'bg-orange-100 group-hover:bg-orange-200' :
                      widget.type === 'audio' ? 'bg-purple-100 group-hover:bg-purple-200' : 
                      'bg-green-100 group-hover:bg-green-200'
                    }`}>
                      {widget.type === 'video' && (
                        <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                      {widget.type === 'audio' && (
                        <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                      )}
                      {widget.type === 'text' && (
                        <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 capitalize group-hover:text-green-700 transition-colors">
                        {widget.type} Review
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {widget.type === 'video' && 'Record a video testimonial (up to 60 seconds)'}
                        {widget.type === 'audio' && 'Record an audio message (up to 60 seconds)'}
                        {widget.type === 'text' && 'Write a detailed text review'}
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-green-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Your review will be published after verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {loading ? (
                <Skeleton width={80} height={80} borderRadius={8} />
              ) : business?.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {business?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {loading ? (
                <div>
                  <Skeleton width={300} height={32} className="mb-2" />
                  <Skeleton width={200} height={20} className="mb-2" />
                  <Skeleton width={150} height={16} />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {business?.name || "Business"} Reviews
                  </h1>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold mr-1">{calculateAverageRating()}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(calculateAverageRating()) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">| {allReviews.length} reviews</span>
                    </div>
                {business?.isVerified && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Verified Company</span>
                  </div>
                )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {business?.website && (
                      <a
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        {business.name}.com
                      </a>
                    )}
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Visit this website
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Write a review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Trustindex Style */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  Source filter
                </h3>
              </div>
              
              <div className="p-4">
                {/* Review Type Filters */}
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center flex-1">
                          <Skeleton circle width={16} height={16} className="mr-3" />
                          <Skeleton width={100} height={16} />
                        </div>
                        <Skeleton width={40} height={20} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { type: 'video', label: 'Video Reviews', bgColor: 'bg-orange-500' },
                      { type: 'audio', label: 'Audio Reviews', bgColor: 'bg-purple-500' },
                      { type: 'text', label: 'Text Reviews', bgColor: 'bg-green-500' },
                      { type: 'google', label: 'Google Reviews', bgColor: 'bg-blue-500' }
                    ].map(({ type, label, bgColor }) => {
                      const count = getReviewTypeCount(type);
                      if (count === 0) return null;
                      
                      return (
                        <div key={type} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={reviewFilters[type]}
                              onChange={() => handleFilterChange(type)}
                              className="sr-only"
                            />
                            <div className="flex items-center flex-1">
                              <div className={`w-4 h-4 rounded-full mr-3 ${reviewFilters[type] ? bgColor : 'bg-gray-300'} flex items-center justify-center transition-all`}>
                                {reviewFilters[type] && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{label}</span>
                            </div>
                          </label>
                          <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">{count} pcs</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                

                
                {/* Quick Actions */}
                {loading ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Skeleton width={80} height={32} />
                      <Skeleton width={80} height={32} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const allTrue = { video: true, audio: true, text: true, google: true };
                          setReviewFilters(allTrue);
                          setReviews(allReviews);
                        }}
                        className="flex-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => {
                          const allFalse = { video: false, audio: false, text: false, google: false };
                          setReviewFilters(allFalse);
                          setReviews([]);
                        }}
                        className="flex-1 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
            </div>
            
            {/* Company Activity */}
            <div className="bg-white rounded-lg border p-4 mt-4">
              <h3 className="font-semibold mb-4">Company activity</h3>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton circle width={16} height={16} className="mr-2" />
                      <Skeleton width={120} height={16} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Displaying Reviews</span>
                  </div>
                
                <div className="flex items-center text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                  <span>Responding to Reviews</span>
                </div>
                
                {business?.createdAt && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Member since {new Date(business.createdAt).getFullYear()}</span>
                  </div>
                )}
                
                <div className="flex items-center text-purple-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Collecting Reviews</span>
                </div>
                
                {allReviews.length > 0 && (
                  <div className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    <span>Latest review: {new Date(Math.max(...allReviews.map(r => new Date(r.submittedAt || r.publishedAt)))).toLocaleDateString()}</span>
                  </div>)}
                </div>
              )}
            </div>
            
            {/* About Section */}
            {loading ? (
              <div className="bg-white rounded-lg border p-4 mb-6">
                <Skeleton width={120} height={20} className="mb-4" />
                <Skeleton circle width={64} height={64} className="mb-4" />
                <Skeleton count={2} height={16} className="mb-2" />
              </div>
            ) : business?.description && (
              <div className="bg-white rounded-lg border p-4 mb-6">
                <h3 className="font-semibold mb-4">About {business.name}</h3>
                <div className="bg-orange-500 w-16 h-16 rounded mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {business.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{business.description}</p>
                {business.industry && (
                  <p className="text-sm text-gray-600">{business.industry}</p>
                )}
              </div>
            )}
            
            {/* Contact Info */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <h3 className="font-semibold mb-4">Contact</h3>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton circle width={16} height={16} className="mr-2" />
                      <Skeleton width={150} height={16} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                {business?.contactEmail && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-blue-600">{business.contactEmail}</span>
                  </div>
                )}
                {business?.phone && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{business.phone}</span>
                  </div>
                )}
                {business?.website && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                       target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {business.website}
                    </a>
                  </div>
                )}
                
                {/* Social Links */}
                {(() => {
                  const socialLinks = business?.socialLinks ? JSON.parse(business.socialLinks) : {};
                  const hasLinks = Object.values(socialLinks).some(link => link);
                  return hasLinks && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3">Follow Us</h4>
                      <div className="flex space-x-3">
                        {socialLinks.facebook && (
                          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {socialLinks.twitter && (
                          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </a>
                        )}
                        {socialLinks.linkedin && (
                          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-700 hover:text-blue-900 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        {socialLinks.instagram && (
                          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                             className="text-pink-600 hover:text-pink-800 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.897-1.387-2.048-1.387-3.345s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
                </div>
              )}
            </div>
            
            {/* Location */}
            {loading ? (
              <div className="bg-white rounded-lg border p-4">
                <Skeleton width={80} height={20} className="mb-4" />
                <Skeleton count={2} height={16} />
              </div>
            ) : (business?.address || business?.city) && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-4">Location</h3>
                <div className="text-sm text-gray-600">
                  {business.address && <div>{business.address}</div>}
                  {business.city && business.state && (
                    <div>{business.city}, {business.state}</div>
                  )}
                  {business.country && <div>{business.country}</div>}
                </div>
              </div>
            )}
            
            {/* Business Hours */}
            {loading ? (
              <div className="bg-white rounded-lg border p-4">
                <Skeleton width={100} height={20} className="mb-4" />
                <Skeleton count={3} height={16} />
              </div>
            ) : (() => {
              const hours = business?.businessHours ? JSON.parse(business.businessHours) : {};
              const hasHours = Object.values(hours).some(hour => hour);
              return hasHours && (
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Business Hours</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(hours).map(([day, time]) => (
                      time && (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span className="font-medium">{time}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Main Reviews Section */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-6">
                    <Skeleton height={150} />
                  </div>
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg border p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {review.reviewerName?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              review.type === 'video' ? 'bg-orange-100 text-orange-600' :
                              review.type === 'audio' ? 'bg-purple-100 text-purple-600' :
                              review.type === 'text' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {review.type.charAt(0).toUpperCase() + review.type.slice(1)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(review.submittedAt || review.publishedAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex text-yellow-400 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        
                        {review.bodyText && (
                          <p className="text-gray-700 leading-relaxed">{review.bodyText}</p>
                        )}
                        
                        {/* Media Display */}
                        {review.media && review.media.length > 0 && (
                          <div className="mt-4">
                            {review.media.map((asset, index) => (
                              <div key={index} className="mb-2">
                                {asset.type === 'video' && (
                                  <video 
                                    controls 
                                    className="max-w-xs rounded-lg"
                                    src={`${process.env.REACT_APP_S3_BASE_URL}/${asset.s3Key}`}
                                  />
                                )}
                                {asset.type === 'audio' && (
                                  <audio 
                                    controls 
                                    className="w-full max-w-xs"
                                    src={`${process.env.REACT_APP_S3_BASE_URL}/${asset.s3Key}`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border p-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p className="text-gray-500">
                    {allReviews.length === 0 ? 'No reviews available yet.' : 'No reviews match the selected filters.'}
                  </p>
                  {allReviews.length === 0 ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Be the first to review
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const allTrue = { video: true, audio: true, text: true, google: true };
                        setReviewFilters(allTrue);
                        setReviews(allReviews);
                      }}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Show All Reviews
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Form Modal */}
      {renderReviewForm()}
    </div>
  );
};

export default PublicReviews;