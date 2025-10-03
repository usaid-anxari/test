import {
  DocumentTextIcon,
  TrashIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ReviewPreviewModal from "../../components/ReviewPreviewModal";
import { API_PATHS } from "../../service/apiPaths";
import axiosInstance from "../../service/axiosInstanse";
import { SpeakerWaveIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import PaymentPrompt from "../../components/PaymentPrompt";
import { useAuth0 } from "@auth0/auth0-react";
import useSubscription from "../../hooks/useSubscription";

const Moderation = () => {
  const { isAuthenticated } = useAuth0();
  const subscription = useSubscription();
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(true);
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch business and reviews data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);      
        // Get business info with reviews included
        const businessResponse = await axiosInstance.get(API_PATHS.BUSINESSES?.GET_PRIVATE_PROFILE);
        setBusiness(businessResponse.data?.business);
        setReviews(businessResponse.data?.reviews || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);
  
  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  // Filter and search reviews
  const filteredReviews = reviews.filter(review => {
    const reviewStatus = review.status?.toLowerCase() || '';
    const matchesFilter = filter === 'all' || reviewStatus === filter.toLowerCase();
    const matchesSearch = (review.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (review.reviewerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (review.bodyText?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      case 'oldest':
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status?.toLowerCase() === 'pending').length,
    approved: reviews.filter(r => r.status?.toLowerCase() === 'approved').length,
    rejected: reviews.filter(r => r.status?.toLowerCase() === 'rejected').length,
  };
  

  const updateReview = async (id, newStatus) => {
    if (!business?.slug) {
      toast.error("Business information not loaded");
      return;
    }
    
    console.log('Updating review with business slug:', business.slug);
    console.log('API URL:', API_PATHS.REVIEWS.UPDATE_REVIEW_STATUS(business.slug, id));
    
    try {
      await axiosInstance.post(
        API_PATHS.REVIEWS.UPDATE_REVIEW_STATUS(business.slug, id),
        { status: newStatus }
      );
      // Refresh reviews data
      const reviewsResponse = await axiosInstance.get(
        API_PATHS.REVIEWS.GET_REVIEWS(business.slug)
      );
      setReviews(reviewsResponse.data.reviews || []);
      toast.success(`Review has been ${newStatus}.`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review status");
    }
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Review Moderation
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage and moderate customer reviews for your business
              </p>
            </div>
            <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-blue-100">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
                <div className="text-sm text-blue-100">Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold text-green-300">{stats.approved}</div>
                <div className="text-sm text-blue-100">Approved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold text-red-300">{stats.rejected}</div>
                <div className="text-sm text-blue-100">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Payment Prompt for Free Users */}
        {showPaymentPrompt && subscription.tier === "free" && (
          <PaymentPrompt onDismiss={() => setShowPaymentPrompt(false)} />
        )}
        
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Filters and Search */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-8 border-b border-gray-100">
            <div className="space-y-6">
              {/* Filter Buttons Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-bold text-gray-800">Filter Reviews</span>
                  </div>
                </div>
                
                {/* Search and Sort Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search */}
                  <div className="relative min-w-[280px]">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, reviewer, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-sm"
                    />
                  </div>
                  
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm font-medium text-sm min-w-[160px]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                  </select>
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {['all', 'pending', 'approved', 'rejected'].map((status) => {
                  const count = status === 'all' ? stats.total : stats[status];
                  const isActive = filter === status;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-xl scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Status Icon */}
                      {status === 'all' && (
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === 'pending' && <ClockIcon className="w-4 h-4 mr-2" />}
                      {status === 'approved' && <CheckCircleIcon className="w-4 h-4 mr-2" />}
                      {status === 'rejected' && <XCircleIcon className="w-4 h-4 mr-2" />}
                      
                      {/* Status Text */}
                      <span>{status === 'all' ? 'All Reviews' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      
                      {/* Count Badge */}
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                        isActive 
                          ? 'bg-white/25 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Reviews List */}
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-32"></div>
                ))}
              </div>
            ) : filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1"
                    onClick={() => openModal(review)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Review Type Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        review.type === 'video' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                        review.type === 'audio' ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' : 
                        'bg-gradient-to-br from-green-400 to-green-600 text-white'
                      }`}>
                        {review.type === 'video' && <VideoCameraIcon className="w-7 h-7" />}
                        {review.type === 'audio' && <SpeakerWaveIcon className="w-7 h-7" />}
                        {review.type === 'text' && <DocumentTextIcon className="w-7 h-7" />}
                      </div>
                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-xl truncate">{review.title}</h3>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              review.status?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" :
                              review.status?.toLowerCase() === "approved" ? "bg-green-100 text-green-800" : 
                              "bg-red-100 text-red-800"
                            }`}>
                              {review.status?.toLowerCase() === "pending" && <ClockIcon className="w-4 h-4 mr-1" />}
                              {review.status?.toLowerCase() === "approved" && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                              {review.status?.toLowerCase() === "rejected" && <XCircleIcon className="w-4 h-4 mr-1" />}
                              {review.status}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); openModal(review); }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Reviewer</div>
                              <div className="font-semibold">{review.reviewerName}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Submitted</div>
                              <div className="font-semibold">{new Date(review.submittedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Rating</div>
                              <div className="flex items-center space-x-1">
                                <span className="font-semibold">{review.rating}.0</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.bodyText && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-gray-700 line-clamp-3 text-sm leading-relaxed">
                              "{review.bodyText}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      {review.status?.toLowerCase() === "pending" ? (
                        <>
                          <button
                            onClick={() => updateReview(review.id, "approved")}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateReview(review.id, "rejected")}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateReview(review.id, "hidden")}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <TrashIcon className="w-5 h-5 mr-2" />
                          Hide
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  {searchTerm || filter !== 'all' ? 'No Matching Reviews' : 'No Reviews Yet'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'When customers submit reviews, they\'ll appear here for moderation'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilter('all'); }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedReview && (
        <ReviewPreviewModal review={selectedReview} onClose={closeModal} />
      )}
    </div>
  );
};

export default Moderation;
