import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { StarIcon, PlayIcon, SpeakerWaveIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";

const PublicReviews = ({ businessSlug }) => {
  const { businessName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.REVIEWS.GET_PUBLIC_REVIEWS(businessName || businessSlug),
        { params: { page, limit } }
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Could not load business reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [businessName, businessSlug, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStars = (rating, brandColor) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className="w-5 h-5"
            style={{ color: i < rating ? (brandColor || '#fbbf24') : '#d1d5db' }}
          />
        ))}
      </div>
    );
  };

  const getTypeIcon = (type, brandColor) => {
    const iconClass = "w-4 h-4";
    const iconStyle = { color: brandColor || '#6b7280' };
    
    switch (type) {
      case 'video':
        return <PlayIcon className={iconClass} style={iconStyle} />;
      case 'audio':
        return <SpeakerWaveIcon className={iconClass} style={iconStyle} />;
      case 'text':
        return <DocumentTextIcon className={iconClass} style={iconStyle} />;
      default:
        return <DocumentTextIcon className={iconClass} style={iconStyle} />;
    }
  };

  const renderMedia = (review) => {
    if (!review.media || review.media.length === 0) return null;
    
    const media = review.media[0];
    const mediaUrl = `${process.env.REACT_APP_S3_BASE_URL}/${media.s3Key}`;
    
    if (review.type === 'video') {
      return (
        <video 
          controls 
          className="w-full h-48 object-cover rounded-lg mb-4"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath fill='%23f97316' d='M8 5v14l11-7z'/%3E%3C/svg%3E"
        >
          <source src={mediaUrl} type="video/mp4" />
        </video>
      );
    }
    
    if (review.type === 'audio') {
      return (
        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: `${data?.business?.brandColor || '#8b5cf6'}20` }}>
          <audio controls className="w-full">
            <source src={mediaUrl} type="audio/mpeg" />
          </audio>
        </div>
      );
    }
    
    return null;
  };

  const renderPagination = () => {
    if (!data || data.total <= limit) return null;
    
    const totalPages = Math.ceil(data.total / limit);
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push('...');
      }
    }
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              style={currentPage === page ? { backgroundColor: business?.brandColor || '#3b82f6' } : {}}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Not Found</h2>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { business, reviews, total } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Business Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          {/* Hero Section with Brand Color */}
          <div 
            className="h-32 relative"
            style={{ 
              background: `linear-gradient(135deg, ${business.brandColor || '#3b82f6'}, ${business.brandColor || '#3b82f6'}dd)` 
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 mb-6">
              <div className="relative mb-4 md:mb-0">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-lg"
                    style={{ backgroundColor: business.brandColor || '#3b82f6' }}
                  >
                    {business.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{business.name}</h1>
                <p className="text-gray-600 text-lg mb-4">
                  {total} {total === 1 ? 'Review' : 'Reviews'}
                </p>
                
                {/* Business Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {business.website && (
                    <a 
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {business.email && (
                    <a 
                      href={`mailto:${business.email}`}
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{business.email}</span>
                    </a>
                  )}
                  {business.phone && (
                    <a 
                      href={`tel:${business.phone}`}
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>{business.phone}</span>
                    </a>
                  )}
                </div>
              </div>
              
              <Link
                to={`/record/${business.slug}`}
                className="text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg flex items-center space-x-2 mt-4 md:mt-0"
                style={{ 
                  backgroundColor: business.brandColor || '#3b82f6',
                  ':hover': { backgroundColor: `${business.brandColor || '#3b82f6'}dd` }
                }}
              >
                <PlayIcon className="w-5 h-5" />
                <span>Leave Review</span>
              </Link>
            </div>
            
            {/* Business Description */}
            {business.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{business.description}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Reviews Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Be the first to share your experience with {business.name}!
            </p>
            <Link
              to={`/record/${business.slug}`}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg inline-flex items-center space-x-2"
              style={{ backgroundColor: business.brandColor || '#3b82f6' }}
            >
              <PlayIcon className="w-5 h-5" />
              <span>Leave First Review</span>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4"
                  style={{ borderLeftColor: business.brandColor || '#3b82f6' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${business.brandColor || '#3b82f6'}20` }}
                      >
                        {getTypeIcon(review.type, business.brandColor)}
                      </div>
                      <span className="text-sm font-medium capitalize" style={{ color: business.brandColor || '#3b82f6' }}>
                        {review.type}
                      </span>
                    </div>
                    {renderStars(review.rating, business.brandColor)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {review.title}
                  </h3>
                  
                  {renderMedia(review)}
                  
                  {review.bodyText && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {review.bodyText}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">{review.reviewerName}</span>
                    <span>{new Date(review.publishedAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicReviews;