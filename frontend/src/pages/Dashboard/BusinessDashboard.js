import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BRAND_COLORS } from "../../utils/brandColors";

const BusinessDashboard = () => {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewFilters, setReviewFilters] = useState({
    video: true,
    audio: true,
    text: true,
    google: true
  });
  const [editing, setEditing] = useState({});
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Fetch business data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE);
      setBusiness(response.data.business || null);
      const allReviewsData = response.data.reviews || [];
      setAllReviews(allReviewsData);
      setReviews(allReviewsData);
      
      // Initialize form data
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
    const newFilters = {
      ...reviewFilters,
      [type]: !reviewFilters[type]
    };
    setReviewFilters(newFilters);
    
    const filtered = allReviews.filter(review => {
      return newFilters[review.type] === true;
    });
    setReviews(filtered);
  };

  // Get count for each review type
  const getReviewTypeCount = (type) => {
    return allReviews.filter(review => review.type === type).length;
  };

  // Handle edit toggle
  const toggleEdit = (field) => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  console.log({business});
  
  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save field
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

  const calculateAverageRating = () => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };

  // Handle delete review
  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  // Confirm delete review
  const confirmDeleteReview = async () => {
    try {
      await axiosInstance.delete(API_PATHS.COMPLIANCE.DELETE_REVIEW_PERMANENTLY(reviewToDelete.id));
      setAllReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      toast.success('Review permanently deleted for compliance');
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen ${BRAND_COLORS.background.light}`} style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 relative group">
              {loading ? (
                <Skeleton circle width={80} height={80} />
              ) : business?.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-sky-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
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
                    const file = e.target.files[0];
                    if (file) {
                      setLogoFile(file);
                      handleLogoUpload(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={logoUploading}
                />
                {logoUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              {loading ? (
                <div>
                  <Skeleton width={200} height={32} className="mb-2" />
                  <Skeleton width={150} height={20} className="mb-4" />
                  <Skeleton width={300} height={16} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {editing.name ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="text-2xl font-bold border-b-2 border-blue-500 bg-transparent focus:outline-none"
                        />
                        <button onClick={() => saveField('name')} className="text-green-600 hover:text-green-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button onClick={() => toggleEdit('name')} className="text-red-600 hover:text-red-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h1 className={`text-2xl font-bold ${BRAND_COLORS.text.primary}`} style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>{business.name}</h1>
                        <button onClick={() => toggleEdit('name')} className="text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editing.industry ? (
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="text-gray-600 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                        placeholder="Enter industry"
                      />
                      <button onClick={() => saveField('industry')} className="text-green-600 hover:text-green-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button onClick={() => toggleEdit('industry')} className="text-red-600 hover:text-red-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mb-4">
                      <p className="text-gray-600">{business?.industry || 'No industry set'}</p>
                      <button onClick={() => toggleEdit('industry')} className="text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {allReviews.length > 0 && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                        <span>{calculateAverageRating()} ({allReviews.length} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                        <span>Latest review: {new Date(Math.max(...allReviews.map(r => new Date(r.submittedAt || r.publishedAt)))).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            {loading ? (
              <div className="bg-white rounded-lg border p-4">
                <Skeleton width={120} height={20} className="mb-4" />
                <Skeleton circle width={64} height={64} className="mb-4" />
                <Skeleton count={2} height={16} className="mb-2" />
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-4">About {business?.name}</h3>
                <div className="bg-orange-600 w-16 h-16 rounded mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {business?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                
                {editing.description ? (
                  <div className="space-y-2">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      rows="3"
                      placeholder="Business description"
                    />
                    <div className="flex space-x-2">
                      <button onClick={() => saveField('description')} className="text-green-600 hover:text-green-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button onClick={() => toggleEdit('description')} className="text-red-600 hover:text-red-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-600 mb-4">{business?.description || 'No description available'}</p>
                    <button onClick={() => toggleEdit('description')} className="text-gray-400 hover:text-blue-600 ml-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {editing.industryAbout ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="text-sm text-gray-600 border-b border-blue-500 bg-transparent focus:outline-none flex-1 w-full"
                      placeholder="Enter industry"
                    />
                    <button onClick={() => saveField('industry')} className="text-green-600 hover:text-green-800">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button onClick={() => toggleEdit('industryAbout')} className="text-red-600 hover:text-red-800">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{business?.industry || 'No industry set'}</p>
                    <button onClick={() => toggleEdit('industryAbout')} className="text-gray-400 hover:text-blue-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Contact Info - Editable */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Contact</h3>
                <button onClick={() => toggleEdit('contact')} className="text-gray-400 hover:text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton circle width={16} height={16} className="mr-2" />
                      <Skeleton width={150} height={16} />
                    </div>
                  ))}
                </div>
              ) : editing.contact ? (
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      placeholder="contact@business.com"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Website</label>
                    <input
                      type="url"
                      placeholder="https://www.business.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4 pt-3 border-t">
                    <button onClick={async () => {
                      const form = new FormData();
                      ['contactEmail', 'phone', 'website'].forEach(field => {
                        form.append(field, formData[field]);
                      });
                      try {
                        await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });
                        setBusiness(prev => ({ ...prev, 
                          contactEmail: formData.contactEmail,
                          phone: formData.phone,
                          website: formData.website
                        }));
                        setEditing(prev => ({ ...prev, contact: false }));
                        toast.success('Contact info updated successfully!');
                      } catch (error) {
                        toast.error('Failed to update contact info');
                      }
                    }} className="flex items-center px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save
                    </button>
                    <button onClick={() => toggleEdit('contact')} className="flex items-center px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel
                    </button>
                  </div>
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
                  
                  {(!business?.contactEmail && !business?.phone && !business?.website) && (
                    <div className="text-gray-400 italic text-center py-4">No contact info set</div>
                  )}
                </div>
              )}
                  
                  {/* Social Links - Editable */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700">Social Media</h4>
                      <button onClick={() => toggleEdit('socialLinks')} className="text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    {editing.socialLinks ? (
                      <div className="space-y-2">
                        {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => {
                          return (
                            <input
                              key={platform}
                              type="url"
                              placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                              value={(() => {
                                try {
                                  const links = formData.socialLinks ? JSON.parse(formData.socialLinks) : {};
                                  return links[platform] || '';
                                } catch {
                                  return '';
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const currentLinks = formData.socialLinks ? JSON.parse(formData.socialLinks) : {};
                                  currentLinks[platform] = e.target.value;
                                  handleInputChange('socialLinks', JSON.stringify(currentLinks));
                                } catch {
                                  const newLinks = {};
                                  newLinks[platform] = e.target.value;
                                  handleInputChange('socialLinks', JSON.stringify(newLinks));
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                            />
                          );
                        })}
                        <div className="flex space-x-2">
                          <button onClick={() => saveField('socialLinks')} className="text-green-600 hover:text-green-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button onClick={() => toggleEdit('socialLinks')} className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        {(() => {
                          const socialLinks = business?.socialLinks ? JSON.parse(business.socialLinks) : {};
                          const platforms = [
                            { key: 'facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: 'text-blue-600' },
                            { key: 'twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', color: 'text-blue-400' },
                            { key: 'linkedin', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: 'text-blue-700' },
                            { key: 'instagram', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.897-1.387-2.048-1.387-3.345s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z', color: 'text-pink-600' }
                          ];
                          return platforms.map(platform => {
                            const url = socialLinks[platform.key];
                            return url && (
                              <a key={platform.key} href={url} target="_blank" rel="noopener noreferrer" 
                                 className={`${platform.color} hover:opacity-80 transition-colors`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d={platform.icon}/>
                                </svg>
                              </a>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
           
            </div>
            
            {/* Location - Editable */}
            {loading ? (
              <div className="bg-white rounded-lg border p-4">
                <Skeleton width={80} height={20} className="mb-4" />
                <Skeleton count={2} height={16} />
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Location</h3>
                  <button onClick={() => toggleEdit('location')} className="text-gray-400 hover:text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
                {editing.location ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="p-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="p-2 border rounded text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="p-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="p-2 border rounded text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={async () => {
                        const form = new FormData();
                        ['address', 'city', 'state', 'country', 'postalCode'].forEach(field => {
                          form.append(field, formData[field]);
                        });
                        try {
                          await axiosInstance.put(API_PATHS.BUSINESSES.UPDATE_PRIVATE_PROFILE, form, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          setBusiness(prev => ({ ...prev, 
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            country: formData.country,
                            postalCode: formData.postalCode
                          }));
                          setEditing(prev => ({ ...prev, location: false }));
                          toast.success('Location updated successfully!');
                        } catch (error) {
                          toast.error('Failed to update location');
                        }
                      }} className="text-green-600 hover:text-green-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button onClick={() => toggleEdit('location')} className="text-red-600 hover:text-red-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    {business?.address && <div>{business.address}</div>}
                    <div>
                      {[business?.city, business?.state, business?.country].filter(Boolean).join(', ')}
                    </div>
                    {business?.postalCode && <div>{business.postalCode}</div>}
                    {(!business?.address && !business?.city) && (
                      <div className="text-gray-400 italic">No location set</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Business Hours - Editable */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Business Hours</h3>
                <button onClick={() => toggleEdit('businessHours')} className="text-gray-400 hover:text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              {editing.businessHours ? (
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const hours = (() => {
                      try {
                        return formData.businessHours ? JSON.parse(formData.businessHours) : {};
                      } catch {
                        return {};
                      }
                    })();
                    return (
                      <div key={day} className="flex items-center space-x-2">
                        <span className="w-20 text-sm capitalize">{day}:</span>
                        <input
                          type="text"
                          placeholder="9:00-17:00 or Closed"
                          value={hours[day] || ''}
                          onChange={(e) => {
                            try {
                              const currentHours = formData.businessHours ? JSON.parse(formData.businessHours) : {};
                              currentHours[day] = e.target.value;
                              handleInputChange('businessHours', JSON.stringify(currentHours));
                            } catch {
                              const newHours = {};
                              newHours[day] = e.target.value;
                              handleInputChange('businessHours', JSON.stringify(newHours));
                            }
                          }}
                          className="flex-1 p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        />
                      </div>
                    );
                  })}
                  <div className="flex space-x-2 mt-3">
                    <button onClick={() => saveField('businessHours')} className="text-green-600 hover:text-green-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button onClick={() => toggleEdit('businessHours')} className="text-red-600 hover:text-red-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-1">
                  {(() => {
                    const hours = business?.businessHours ? JSON.parse(business.businessHours) : {};
                    const hasHours = Object.values(hours).some(hour => hour);
                    return hasHours ? (
                      Object.entries(hours).map(([day, time]) => (
                        time && (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{time}</span>
                          </div>
                        )
                      ))
                    ) : (
                      <div className="text-gray-400 italic">No hours set</div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Review Management Header */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Review Management</h3>
                <Link
                  to="/dashboard/moderation"
                  className={`inline-flex items-center px-4 py-2 ${BRAND_COLORS.background.secondary} text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-colors text-sm font-medium`}
                  style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Full Moderation
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'video', label: 'Video', color: 'orange' },
                  { type: 'audio', label: 'Audio', color: 'purple' },
                  { type: 'text', label: 'Text', color: 'green' },
                  { type: 'google', label: 'Google', color: 'blue' }
                ].map(({ type, label, color }) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      reviewFilters[type]
                        ? `bg-${color}-100 text-${color}-800 border-${color}-200`
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    } border`}
                  >
                    {label} ({getReviewTypeCount(type)})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-4">
                    <Skeleton height={200} />
                  </div>
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          review.type === 'video' ? 'bg-orange-100 text-orange-600' :
                          review.type === 'audio' ? 'bg-purple-100 text-purple-600' :
                          review.type === 'google' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {review.type === 'video' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          )}
                          {review.type === 'audio' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                          )}
                          {(review.type === 'text' || review.type === 'google') && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{review.reviewerName}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    )}
                    
                    {review.bodyText && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{review.bodyText}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(review.submittedAt || review.publishedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full ${
                          review.status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {review.status}
                        </span>
                        {(review.status === 'approved' || review.status === 'rejected') && (
                          <button
                            onClick={() => handleDeleteReview(review)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete Permanently (GDPR)"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Reviews will appear here once customers start submitting them.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Permanent Deletion</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Are you sure you want to permanently delete this review?</h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{reviewToDelete?.reviewerName}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < (reviewToDelete?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {reviewToDelete?.title && (
                    <h5 className="font-medium text-gray-800 mb-1">{reviewToDelete.title}</h5>
                  )}
                  {reviewToDelete?.bodyText && (
                    <p className="text-sm text-gray-600 line-clamp-2">{reviewToDelete.bodyText}</p>
                  )}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">GDPR Compliance Notice</h5>
                      <p className="text-sm text-yellow-700">
                        This will permanently delete the review and all associated media files. 
                        A compliance log will be created for audit purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteReview}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;