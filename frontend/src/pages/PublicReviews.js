import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ContactInfoCard from "../components/ContactInfoCard";
import ReviewPreviewModal from "../components/ReviewPreviewModal";
import HeaderSocialIcons from "../components/HeaderSocialIcons";
import StarRating from "../components/StarRating";
import ReviewCard from "../components/ReviewCard";

const PublicReviews = ({ businessSlug }) => {
  const { businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
 const [reviewFilters, setReviewFilters] = useState({
    video: true,
    audio: false,
    text: false
  }); 
  
  // Fetching Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE(businessName || businessSlug));
       setBusiness(response.data.business || null);
       console.log(response);
      const allReviewsData = response.data.reviews || [];
      setAllReviews(allReviewsData);
      setReviews(allReviewsData); 
        if (response.data.business) {
        setFormData({
          name: response.data.business.name || '',
          description: response.data.business.description || '',
          industry: response.data.business.industry || '',
          website: response.data.business.website || '',
          contactEmail: response.data.business.contactEmail || '',
          phone: response.data.business.phone || '',
          address: response.data.business.address || '',
          city: response.data.business.city || '',
          state: response.data.business.state || '',
          country: response.data.business.country || '',
          postalCode: response.data.business.postalCode || '',
          companySize: response.data.business.companySize || '',
          foundedYear: response.data.business.foundedYear || '',
          brandColor: response.data.business.brandColor || '#ef7c00',
          thumbnailUrl: response.data.business.thumbnailUrl || '',
          bannerUrl: response.data.business.bannerUrl || '',
          businessHours: typeof response.data.business.businessHours === 'string' ? response.data.business.businessHours : JSON.stringify(response.data.business.businessHours || {}),
          socialLinks: typeof response.data.business.socialLinks === 'string' ? response.data.business.socialLinks : JSON.stringify(response.data.business.socialLinks || {})
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Could not load business data.");
    } finally {
      setLoading(false);
    }
  };

// Handle filter change
  const handleFilterChange = (type) => {
    if (type === 'all') {
      // Toggle all filters
      const allActive = reviewFilters.video && reviewFilters.audio && reviewFilters.text;
      setReviewFilters({
        video: !allActive,
        audio: !allActive,
        text: !allActive
      });
    } else {
      const newFilters = {
        ...reviewFilters,
        [type]: !reviewFilters[type]
      };
      setReviewFilters(newFilters);
    }
  };

  
// Filter reviews for display based on active filters
  const getFilteredReviews = () => {
    // Check if 'all' filter is active
    const allActive = reviewFilters.video && reviewFilters.audio && reviewFilters.text;
    
    if (allActive) {
      return allReviews;
    }
    
    return allReviews.filter(review => {
      if (review.type === 'video' && reviewFilters.video) return true;
      if (review.type === 'audio' && reviewFilters.audio) return true;
      if ((review.type === 'text' || review.type === 'google') && reviewFilters.text) return true;
      return false;
    });
  };

// Handle view review modal
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

// Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  // Get count for each review type
    const getReviewTypeCount = (type) => {
    if (type === 'all') {
      return allReviews.length;
    }
    if (type === 'text') {
      return allReviews.filter(review => review.type === 'text' || review.type === 'google').length;
    }
    return allReviews.filter(review => review.type === type).length;
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line
  }, [businessName, businessSlug]);

  // Render review form based on active widgets
  // const renderReviewForm = () => {
  //   if (!showReviewForm) return null;
    
  //   const activeWidgets = widgets.filter(w => w.active);
    
  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
  //       <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
  //         {/* Header */}
  //         <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
  //           <div className="flex items-center justify-between">
  //             <div className="flex items-center space-x-3">
  //               <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
  //                 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  //                 </svg>
  //               </div>
  //               <div>
  //                 <h3 className="text-xl font-bold text-white">Write a Review</h3>
  //                 <p className="text-green-100 text-sm">Share your experience with {business?.name}</p>
  //               </div>
  //             </div>
  //             <button
  //               onClick={() => setShowReviewForm(false)}
  //               className="text-white hover:text-green-100 transition-colors"
  //             >
  //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  //               </svg>
  //             </button>
  //           </div>
  //         </div>
          
  //         {/* Content */}
  //         <div className="p-6">
  //           <p className="text-gray-600 text-sm mb-6 text-center">
  //             Choose how you'd like to share your review
  //           </p>
            
  //           <div className="space-y-3">
  //             {activeWidgets.map((widget) => (
  //               <Link
  //                 key={widget.type}
  //                 to={`/record/${business?.slug}?type=${widget.type}`}
  //                 className="group block p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-200 hover:bg-green-50"
  //                 onClick={() => setShowReviewForm(false)}
  //               >
  //                 <div className="flex items-center space-x-4">
  //                   <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
  //                     widget.type === 'video' ? 'bg-orange-100 group-hover:bg-orange-200' :
  //                     widget.type === 'audio' ? 'bg-purple-100 group-hover:bg-purple-200' : 
  //                     'bg-green-100 group-hover:bg-green-200'
  //                   }`}>
  //                     {widget.type === 'video' && (
  //                       <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
  //                         <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
  //                       </svg>
  //                     )}
  //                     {widget.type === 'audio' && (
  //                       <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
  //                         <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
  //                       </svg>
  //                     )}
  //                     {widget.type === 'text' && (
  //                       <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
  //                         <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  //                       </svg>
  //                     )}
  //                   </div>
  //                   <div className="flex-1">
  //                     <h4 className="font-semibold text-gray-900 capitalize group-hover:text-green-700 transition-colors">
  //                       {widget.type} Review
  //                     </h4>
  //                     <p className="text-sm text-gray-600 mt-1">
  //                       {widget.type === 'video' && 'Record a video testimonial (up to 60 seconds)'}
  //                       {widget.type === 'audio' && 'Record an audio message (up to 60 seconds)'}
  //                       {widget.type === 'text' && 'Write a detailed text review'}
  //                     </p>
  //                   </div>
  //                   <div className="text-gray-400 group-hover:text-green-500 transition-colors">
  //                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  //                     </svg>
  //                   </div>
  //                 </div>
  //               </Link>
  //             ))}
  //           </div>
            
  //           {/* Footer */}
  //           <div className="mt-6 pt-4 border-t border-gray-100">
  //             <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
  //               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  //                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  //               </svg>
  //               <span>Your review will be published after verification</span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

 const calculateAverageRating = () => {
    if (allReviews.length === 0) return '0.0';
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };
  const averageRating = calculateAverageRating();
  const displayedReviews = getFilteredReviews();
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className={`min-h-screen bg-gray-50`} style={{ fontFamily: 'Inter, Poppins, system-ui, sans-serif' }}>
      
      {/* --- NEW HEADER (as per image) --- */}
      <div className="relative">
        {/* Banner Background */}
        {loading ? (
            <Skeleton height={200} />
        ) : (
            <div 
                className="h-48 md:h-64 bg-gray-300 relative group cursor-pointer"
                style={{
                backgroundImage: business?.bannerUrl ? `url(${business.bannerUrl})` : 'linear-gradient(to right, #6366f1, #a855f7)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
                }}
            >
            </div>
        )}

        {/* Content Overlap Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20">
            
            {/* Left Side: White Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-9xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                
                {/* Left: Logo + Business Info */}
                <div className="flex items-center space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0 relative group">
                    {loading ? (
                      <Skeleton circle width={80} height={80} />
                    ) : business?.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={business.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white">
                        <span className="text-white text-3xl font-bold">
                          {business?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Info */}
                  <div>
                    {loading ? (
                      <>
                        <Skeleton width={250} height={28} className="mb-2" />
                        <Skeleton width={120} height={16} className="mb-2" />
                        <Skeleton width={180} height={20} />
                      </>
                    ) : (
                      <>
                        {/* Business Name */}
                        <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                        
                        {/* Business Category */}
                        <span className="text-sm text-gray-600 mb-2 block">{business?.industry || 'Business Category'}</span>
                        
                        {/* Rating Display */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-800">{averageRating}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">({allReviews.length} reviews)</span>
                          </div>
                        </div>
                        
                        {/* Add Review Button */}
                        <Link to={`/record/${business?.slug}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Add Review
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Right Side: Social Icons (floating) */}
            <div className="absolute top-4 right-4 z-20">
                <HeaderSocialIcons business={business} />
            </div>

          </div>
        </div>
      </div>
      {/* --- END NEW HEADER --- */}


      {/* --- Main Content Grid (Two Columns) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About the company */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {loading ? (
                <>
                  <Skeleton height={28} width={200} className="mb-4" />
                  <Skeleton count={3} height={16} />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{business?.description || 'Tell customers about your business, what makes you unique, and what they can expect when working with you.'}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Employee Interest (Dynamic rating from backend) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Ratings</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-4xl font-bold text-gray-800">{averageRating}</div>
                  <StarRating rating={averageRating} reviewCount={allReviews.length} />
                </div>
                <div className="w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = allReviews.filter(review => review.rating === star).length;
                    const percentage = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-12">{star} star</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{Math.round(percentage)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 sm:mb-0">Customer Reviews</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'video', label: 'Video', color: 'orange', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                    { type: 'audio', label: 'Voice', color: 'purple', icon: 'M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' },
                    { type: 'text', label: 'Text', color: 'green', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { type: 'all', label: 'All', color: 'blue', icon: 'M19 11H5m14-7H3a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z' },
                  ].map(({ type, label, color, icon }) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange(type)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        type === 'all' 
                          ? (reviewFilters.video && reviewFilters.audio && reviewFilters.text)
                            ? `bg-${color}-100 text-${color}-800 border-${color}-200 shadow-sm`
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          : reviewFilters[type]
                            ? `bg-${color}-100 text-${color}-800 border-${color}-200 shadow-sm`
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      <span>{label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        type === 'all'
                          ? (reviewFilters.video && reviewFilters.audio && reviewFilters.text) ? 'bg-white bg-opacity-50' : 'bg-gray-200'
                          : reviewFilters[type] ? 'bg-white bg-opacity-50' : 'bg-gray-200'
                      }`}>
                        {type === 'all' ? allReviews.length : getReviewTypeCount(type)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                      <Skeleton height={200} />
                    </div>
                  ))
                ) : displayedReviews.length > 0 ? (
                  displayedReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onViewReview={handleViewReview}
                    />
                  ))
                ) : (
                  <div className="col-span-1 lg:col-span-2 text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Customer reviews of the selected types will appear here once they're approved.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- Right Column --- */}
          <div className="lg:col-span-1">
                        <ContactInfoCard
                          business={business}
                          editing={false}
                          formData={formData}
                          handleInputChange={false}
                          saveField={false}
                          toggleEdit={false}
                          isReadOnly={true}
                          loading={loading}
                          onSaveContact={false}
                        />
          </div>

        </div>
      </div>

      {/* Review Preview Modal */}
      {isModalOpen && selectedReview && (
        <ReviewPreviewModal
          review={selectedReview}
          isOpen={isModalOpen}
          onClose={closeModal}
          isReadOnly={false}
        />
      )}
      
    </div>
  );
};

export default PublicReviews;