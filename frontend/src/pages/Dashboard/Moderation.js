import  { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import ReviewPreviewModal from "../../components/ReviewPreviewModal";
import { API_PATHS } from "../../service/apiPaths";
import axiosInstance from "../../service/axiosInstanse";
import { 
  SpeakerWaveIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import PaymentPrompt from "../../components/PaymentPrompt";
import { useAuth0 } from "@auth0/auth0-react";
import useSubscription from "../../hooks/useSubscription";
import { useTrialStatus } from "../../components/TrialGuard";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import ReviewCard from "../../components/ReviewCard";

const Moderation = () => {
  const { isAuthenticated } = useAuth0();
  const subscription = useSubscription();
  const { isReadOnly } = useTrialStatus();
  const { subscriptionData } = subscription;
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(true);
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewToReject, setReviewToReject] = useState(null);
  
  // ------ Fetch business and reviews data
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

  
  // ------ Filter and search reviews
  const filteredReviews = reviews.filter(review => {
    const reviewStatus = review.status?.toLowerCase() || '';
    const reviewType = review.type?.toLowerCase() || '';
    const matchesStatusFilter = statusFilter === 'all' || reviewStatus === statusFilter.toLowerCase();
    const matchesTypeFilter = typeFilter === 'all' || reviewType === typeFilter.toLowerCase();
    const matchesSearch = (review.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (review.reviewerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (review.bodyText?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatusFilter && matchesTypeFilter && matchesSearch;
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

  // -- Stats Calculation
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status?.toLowerCase() === 'pending').length,
    approved: reviews.filter(r => r.status?.toLowerCase() === 'approved').length,
    rejected: reviews.filter(r => r.status?.toLowerCase() === 'rejected').length,
  };
    // ------ openModal
  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  // ------ handleViewReview
  const handleViewReview = useCallback((review) => {
    openModal(review);
  }, []);
  // ------ closeModal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };


  
  // ------- updateReview
  const updateReview = useCallback(async (id, newStatus) => {
    if (!business?.slug) {
      toast.error("Business information not loaded");
      return;
    }
    
    try {
      await axiosInstance.post(
        API_PATHS.REVIEWS.UPDATE_REVIEW_STATUS(business.slug, id),
        { status: newStatus }
      );
      
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Review has been ${newStatus}.`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review status");
    }
  }, [business?.slug]);

  // ------ handleUpdateStatus
  const handleUpdateStatus = useCallback((id, status) => {
    updateReview(id, status);
  }, [updateReview]);

    // ------ handleRejectReview
  const handleRejectReview = useCallback((review) => {
    setReviewToReject(review);
    setShowRejectModal(true);
  }, []);

   // ------ confirmRejectReview
  const confirmRejectReview = useCallback(async () => {
    try {
      await axiosInstance.delete(API_PATHS.COMPLIANCE.DELETE_REVIEW_PERMANENTLY(reviewToReject.id));
      setReviews(prev => prev.filter(r => r.id !== reviewToReject.id));
      toast.success('Review rejected and permanently deleted');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to reject review:', error);
      toast.error('Failed to reject review');
    } finally {
      setShowRejectModal(false);
      setReviewToReject(null);
    }
  }, [reviewToReject]);

  
  // ------ handleDeleteReview
  const handleDeleteReview = useCallback((review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  }, []);

  // ------ confirmDeleteReview
  const confirmDeleteReview = useCallback(async () => {
    try {
      await axiosInstance.delete(API_PATHS.COMPLIANCE.DELETE_REVIEW_PERMANENTLY(reviewToDelete.id));
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      toast.success('Review permanently deleted for compliance');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  }, [reviewToDelete]);

// Review Card Component
// const ReviewCard = ({ review, onViewReview, onUpdateStatus, onDeleteReview, onRejectReview, isReadOnly }) => {
//   const [audioDuration, setAudioDuration] = useState('0:00');
  
//   useEffect(() => {
//     if (review.type === 'audio' && review.mediaAssets?.[0]?.s3Key) {
//       const audio = new Audio(`${process.env.REACT_APP_S3_BASE_URL}/${review.mediaAssets[0].s3Key}`);
//       audio.addEventListener('loadedmetadata', () => {
//         const minutes = Math.floor(audio.duration / 60);
//         const seconds = Math.floor(audio.duration % 60);
//         setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
//       });
//     }
//   }, [review.mediaAssets, review.type]);
//   const getStatusBadge = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'approved': 
//         return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
//       case 'pending': 
//         return <ClockIcon className="w-5 h-5 text-gray-400" />;
//       case 'rejected': 
//         return <XCircleIcon className="w-5 h-5 text-red-500" />;
//       case 'hidden':
//         return <XCircleIcon className="w-5 h-5 text-gray-400" />;
//       default: 
//         return <ClockIcon className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   // Video Review Card (existing design)
//   if (review.type === 'video') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gray-100"
//         style={{ height: '340px' }}
//         onClick={() => onViewReview(review)}
//       >
//         {review.mediaAssets && review.mediaAssets[0] && (
//           <video 
//             className="absolute inset-0 w-full h-full object-cover"
//             src={`${process.env.REACT_APP_S3_BASE_URL}/${review.mediaAssets[0].s3Key}`}
//             preload="metadata"
//           />
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
//         <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
//           {getStatusBadge(review.status)}
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 p-5">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
//               <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
//             </div>
//             <div className="flex-1">
//               <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
//               <div className="flex">
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
//                 ))}
//               </div>
//             </div>
//             <div className="text-xs text-white/80">
//               {new Date(review.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//             </div>
//           </div>
//           {!isReadOnly && (
//             <div className="flex gap-2">
//               {review.status === 'pending' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg">✓ Approve</button>
//                   <button onClick={(e) => { e.stopPropagation(); onRejectReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">✕ Reject</button>
//                 </>
//               )}
//               {review.status === 'approved' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'hidden'); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2"><XCircleIcon className="w-4 h-4" />Hide</button>
//                   <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete Review</button>
//                 </>
//               )}
//               {review.status === 'hidden' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"><CheckCircleIcon className="w-4 h-4" />Unhide</button>
//                   <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete Review</button>
//                 </>
//               )}
//               {review.status === 'rejected' && (
//                 <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">🗑️ Delete</button>
//               )}
//             </div>
//           )}
//         </div>
//       </motion.div>
//     );
//   }

//   // Audio Review Card
//   if (review.type === 'audio') {

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-purple-700"
//         style={{ height: '340px' }}
//         onClick={() => onViewReview(review)}
//       >
//         {/* Audio Waveform Background */}
//         <div className="absolute inset-0 flex items-center justify-center opacity-20">
//           <div className="flex items-end gap-1">
//             {[3, 5, 4, 6, 3, 7, 4, 5, 3, 6, 4, 5, 3, 4, 5, 6, 4, 3, 5, 4, 6, 5, 3, 4].map((height, i) => (
//               <div key={i} className="w-2 bg-white rounded-full" style={{ height: `${height * 12}px` }} />
//             ))}
//           </div>
//         </div>
        
//         {/* Center Audio Icon */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
//             <SpeakerWaveIcon className="w-12 h-12 text-white" />
//           </div>
//         </div>
        
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
//         <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
//           {getStatusBadge(review.status)}
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 p-5">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
//               <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
//             </div>
//             <div className="flex-1">
//               <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
//               <div className="flex items-center gap-2">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
//                   ))}
//                 </div>
//                 <span className="text-xs text-white/80">• {audioDuration}</span>
//               </div>
//             </div>
//             <div className="text-xs text-white/80">
//               {new Date(review.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//             </div>
//           </div>
//           {!isReadOnly && (
//             <div className="flex gap-2">
//               {review.status === 'pending' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg">✓ Approve</button>
//                   <button onClick={(e) => { e.stopPropagation(); onRejectReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">✕ Reject</button>
//                 </>
//               )}
//               {review.status === 'approved' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'hidden'); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2"><XCircleIcon className="w-4 h-4" />Hide</button>
//                   <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete</button>
//                 </>
//               )}
//               {review.status === 'hidden' && (
//                 <>
//                   <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"><CheckCircleIcon className="w-4 h-4" />Unhide</button>
//                   <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete</button>
//                 </>
//               )}
//               {review.status === 'rejected' && (
//                 <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">🗑️ Delete</button>
//               )}
//             </div>
//           )}
//         </div>
//       </motion.div>
//     );
//   }

//   // Text Review Card
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-green-500 to-green-700"
//       style={{ height: '340px' }}
//       onClick={() => onViewReview(review)}
//     >
//       {/* Text Pattern Background */}
//       <div className="absolute inset-0 flex items-center justify-center opacity-10">
//         <div className="grid grid-cols-6 gap-2 transform rotate-12">
//           {Array.from({ length: 24 }).map((_, i) => (
//             <div key={i} className="w-8 h-1 bg-white rounded-full" />
//           ))}
//         </div>
//       </div>
      
//       {/* Text Content */}
//       <div className="absolute inset-0 p-6 flex flex-col justify-center">
//         <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
//           <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{review.title}</h3>
//           <p className="text-white/90 text-sm line-clamp-4">
//             {review.bodyText && review.bodyText.length > 120 
//               ? `${review.bodyText.substring(0, 120)}...` 
//               : review.bodyText || 'No content available'}
//           </p>
//         </div>
//       </div>
      
//       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
//       <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
//         {getStatusBadge(review.status)}
//       </div>
//       <div className="absolute bottom-0 left-0 right-0 p-5">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
//             <span className="text-sm font-semibold text-white">{review.reviewerName?.charAt(0)}</span>
//           </div>
//           <div className="flex-1">
//             <div className="text-white font-semibold text-sm">{review.reviewerName}</div>
//             <div className="flex">
//               {[...Array(5)].map((_, i) => (
//                 <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-white/30'}`}>★</span>
//               ))}
//             </div>
//           </div>
//           <div className="text-xs text-white/80">
//             {new Date(review.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//           </div>
//         </div>
//         {!isReadOnly && (
//           <div className="flex gap-2">
//             {review.status === 'pending' && (
//               <>
//                 <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg">✓ Approve</button>
//                 <button onClick={(e) => { e.stopPropagation(); onRejectReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">✕ Reject</button>
//               </>
//             )}
//             {review.status === 'approved' && (
//               <>
//                 <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'hidden'); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2"><XCircleIcon className="w-4 h-4" />Hide</button>
//                 <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete</button>
//               </>
//             )}
//             {review.status === 'hidden' && (
//               <>
//                 <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(review.id, 'approved'); }} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"><CheckCircleIcon className="w-4 h-4" />Unhide</button>
//                 <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">Delete</button>
//               </>
//             )}
//             {review.status === 'rejected' && (
//               <button onClick={(e) => { e.stopPropagation(); onDeleteReview(review); }} className="flex-1 bg-red-600/90 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-lg">🗑️ Delete</button>
//             )}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header with Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-500 rounded-xl px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
                <div className="text-sm font-medium mt-1">Total</div>
              </div>
              <div className="text-white/30">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="bg-orange-500 rounded-xl px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.pending.toLocaleString()}</div>
                <div className="text-sm font-medium mt-1">Pending</div>
              </div>
              <div className="text-white/30">
                <ClockIcon className="w-8 h-8" />
              </div>
            </div>
            <div className="bg-green-500 rounded-xl px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.approved.toLocaleString()}</div>
                <div className="text-sm font-medium mt-1">Approved</div>
              </div>
              <div className="text-white/30">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
            </div>
            <div className="bg-red-500 rounded-xl px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.rejected.toLocaleString()}</div>
                <div className="text-sm font-medium mt-1">Rejected</div>
              </div>
              <div className="text-white/30">
                <XCircleIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <SubscriptionBanner 
          subscriptionStatus={subscriptionData?.status}
          tier={subscriptionData?.tier}
          storageUsage={subscriptionData?.storageUsage}
          trialActive={subscriptionData?.trialActive}
          trialDaysLeft={subscriptionData?.trialDaysLeft}
        />
        {/* Payment Prompt for Free Users */}
        {showPaymentPrompt && subscription.tier === "free" && (
          <PaymentPrompt onDismiss={() => setShowPaymentPrompt(false)} />
        )}
        
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
              />
            </div>
            
            {/* Filter Button and Dropdown */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FunnelIcon className="w-5 h-5 text-gray-600" />
              </button>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">No reviews found</div>
            <div className="text-gray-500">Try adjusting your filters or search terms</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onViewReview={handleViewReview}
                onUpdateStatus={handleUpdateStatus}
                onDeleteReview={handleDeleteReview}
                onRejectReview={handleRejectReview}
                isReadOnly={isReadOnly}
                allowBtn={true}
                badge={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Preview Modal */}
      {isModalOpen && selectedReview && (
        <ReviewPreviewModal
          review={selectedReview}
          isOpen={isModalOpen}
          onClose={closeModal}
          onApprove={() => updateReview(selectedReview.id, 'approved')}
          onReject={() => handleRejectReview(selectedReview)}
          onDelete={() => handleDeleteReview(selectedReview)}
          isReadOnly={isReadOnly}
          allowBtn={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reject and permanently delete this review?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default Moderation;