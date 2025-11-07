import { useEffect, useState } from "react";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTrialStatus } from "../../components/TrialGuard";
import ReviewPreviewModal from "../../components/ReviewPreviewModal";
import ReviewCard from "../../components/ReviewCard";
import ContactInfoCard from "../../components/ContactInfoCard";
import HeaderSocialIcons from "../../components/HeaderSocialIcons";
import StarRating from "../../components/StarRating";

const BusinessDashboard = () => {
  const { isReadOnly } = useTrialStatus();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]); // This will hold ONLY approved reviews
  const [loading, setLoading] = useState(true);
  const [reviewFilters, setReviewFilters] = useState({
    video: true,
    audio: false,
    text: false
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState({});
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Fetch business data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE);
      setBusiness(response.data.business || null);
      
      const allReviewsData = response.data.reviews || [];
      const approvedReviewsData = allReviewsData.filter(r => r.status === 'approved');
      
      setAllReviews(approvedReviewsData);
      setReviews(approvedReviewsData); 
      
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

  // Get count for each review type (from the approved list)
  const getReviewTypeCount = (type) => {
    if (type === 'all') {
      return allReviews.length;
    }
    if (type === 'text') {
      return allReviews.filter(review => review.type === 'text' || review.type === 'google').length;
    }
    return allReviews.filter(review => review.type === type).length;
  };

  // Handle edit toggle
  const toggleEdit = (field) => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save single field
  const saveField = async (field) => {
    try {
      const form = new FormData();
      form.append(field, formData[field]);
      
      await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setBusiness(prev => ({ ...prev, [field]: formData[field] }));
      setEditing(prev => ({ ...prev, [field]: false }));
      toast.success(`${field} updated successfully!`);
    } catch (error) {
      toast.error(`Failed to update ${field}`);
    }
  };

  // Save multiple contact/location fields
  const saveContactInfo = async () => {
    const fieldsToSave = [
      'contactEmail', 'phone', 'website', 'socialLinks', 
      'address', 'city', 'state', 'country', 'postalCode'
    ];
    
    try {
      const form = new FormData();
      const updatedBusinessData = {};
      
      fieldsToSave.forEach(field => {
        if (formData[field] !== undefined) {
          form.append(field, formData[field]);
          updatedBusinessData[field] = formData[field];
        }
      });
      
      await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setBusiness(prev => ({ ...prev, ...updatedBusinessData }));
      setEditing(prev => ({ ...prev, contact: false, location: false }));
      toast.success('Contact info updated successfully!');
    } catch (error) {
      toast.error('Failed to update contact info');
    }
  };


  // Handle logo upload
  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    setLogoUploading(true);
    try {
      const form = new FormData();
      form.append('logo', file);
      
      const response = await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setBusiness(prev => ({ ...prev, logoUrl: response.data.business.logoUrl }));
      toast.success('Logo updated successfully!');
    } catch (error) {
      toast.error('Failed to update logo');
    } finally {
      setLogoUploading(false);
      setLogoFile(null);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async (file) => {
    if (!file) return;
    
    setBannerUploading(true);
    try {
      const form = new FormData();
      form.append('banner', file);
      
      const response = await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setBusiness(prev => ({ ...prev, bannerUrl: response.data.business.bannerUrl }));
      setFormData(prev => ({ ...prev, bannerUrl: response.data.business.bannerUrl }));
      toast.success('Banner updated successfully!');
    } catch (error) {
      toast.error('Failed to update banner');
    } finally {
      setBannerUploading(false);
      setBannerFile(null);
    }
  };

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
                {/* Banner upload overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                    if (isReadOnly) {
                        toast.error('Upgrade to edit banner');
                        return;
                    }
                    const file = e.target.files[0];
                    if (file) {
                        setBannerFile(file);
                        handleBannerUpload(file);
                    }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={bannerUploading || isReadOnly}
                />
                {bannerUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                    <div className="text-white text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-sm font-medium">Change Banner</p>
                    </div>
                )}
                </div>
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
                    {/* Logo upload overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (isReadOnly) { toast.error('Upgrade to edit business profile'); return; }
                          const file = e.target.files[0];
                          if (file) { setLogoFile(file); handleLogoUpload(file); }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={logoUploading || isReadOnly}
                      />
                      {logoUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </div>
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
                        {editing.name ? (
                          <div className="flex items-center space-x-2 mb-1">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="text-2xl font-bold border-b-2 border-blue-500 bg-transparent focus:outline-none"
                            />
                            <button onClick={() => isReadOnly ? null : saveField('name')} disabled={isReadOnly} className={`${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => toggleEdit('name')} className="text-red-600 hover:text-red-800">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                            <button onClick={() => isReadOnly ? toast.error('Upgrade to edit business info') : toggleEdit('name')} className={`${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                        )}
                        
                        {/* Business Category */}
                        {editing.industry ? (
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={formData.industry}
                              onChange={(e) => handleInputChange('industry', e.target.value)}
                              className="text-sm text-gray-600 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                              placeholder="Business category"
                            />
                            <button onClick={() => isReadOnly ? null : saveField('industry')} disabled={isReadOnly} className={`${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => toggleEdit('industry')} className="text-red-600 hover:text-red-800">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">{business?.industry || 'Business Category'}</span>
                            <button onClick={() => isReadOnly ? toast.error('Upgrade to edit business info') : toggleEdit('industry')} className={`${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                          </div>
                        )}
                        
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
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Add Review
                        </button>
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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                    {!editing.description && (
                      <button onClick={() => isReadOnly ? toast.error('Upgrade to edit description') : toggleEdit('description')} className={`p-2 rounded-lg ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                    )}
                  </div>
                  {editing.description ? (
                    <div className="space-y-3">
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="6"
                        placeholder="Tell customers about your business, what makes you unique, your story, and what they can expect..."
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => isReadOnly ? null : saveField('description')} disabled={isReadOnly} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          Save Changes
                        </button>
                        <button onClick={() => toggleEdit('description')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">{business?.description || 'Tell customers about your business, what makes you unique, and what they can expect when working with you.'}</p>
                    </div>
                  )}
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
              editing={editing}
              formData={formData}
              handleInputChange={handleInputChange}
              saveField={saveField}
              toggleEdit={toggleEdit}
              isReadOnly={isReadOnly}
              loading={loading}
              onSaveContact={saveContactInfo}
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
        />
      )}
      
    </div>
  );
};

export default BusinessDashboard;