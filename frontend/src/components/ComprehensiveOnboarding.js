import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  PaintBrushIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ComprehensiveOnboarding = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { setTenant, setNeedsOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null, suggestions: [] });

  const [formData, setFormData] = useState({
    // Basic Info (Step 0)
    name: '',
    slug: '',
    description: '',
    industry: '',
    
    // Contact Info (Step 1)
    website: '',
    contactEmail: user?.email || '',
    phone: '',
    
    // Location Info (Step 2)
    address: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
    
    // Business Details (Step 3)
    companySize: '',
    foundedYear: new Date().getFullYear(),
    
    // Branding (Step 4)
    brandColor: '#ef7c00',
    
    // Business Hours (Step 5)
    businessHours: {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-17:00',
      saturday: 'Closed',
      sunday: 'Closed'
    },
    
    // Social Links (Step 6)
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });

  const steps = [
    {
      title: "Basic Information",
      description: "Tell us about your business",
      icon: BuildingOfficeIcon,
      fields: ['name', 'slug', 'description', 'industry']
    },
    {
      title: "Contact Information", 
      description: "How customers can reach you",
      icon: GlobeAltIcon,
      fields: ['website', 'contactEmail', 'phone']
    },
    {
      title: "Location Details",
      description: "Where is your business located?",
      icon: MapPinIcon,
      fields: ['address', 'city', 'state', 'country', 'postalCode']
    },
    {
      title: "Business Details",
      description: "Additional business information",
      icon: BuildingOfficeIcon,
      fields: ['companySize', 'foundedYear']
    },
    {
      title: "Branding & Logo",
      description: "Make it uniquely yours",
      icon: PaintBrushIcon,
      fields: ['brandColor', 'logo']
    },
    {
      title: "Business Hours",
      description: "When are you open?",
      icon: CheckCircleIcon,
      fields: ['businessHours']
    },
    {
      title: "Social Media",
      description: "Connect your social presence",
      icon: GlobeAltIcon,
      fields: ['socialLinks']
    }
  ];

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage',
    'Real Estate', 'Education', 'Automotive', 'Beauty & Wellness', 'Legal',
    'Consulting', 'Manufacturing', 'Entertainment', 'Travel & Tourism', 'Other'
  ];

  const companySizeOptions = [
    '1 employee (Just me)', '2-10 employees', '11-50 employees', 
    '51-200 employees', '201-500 employees', '500+ employees'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Auto-generate and check slug when name changes
      if (field === 'name' && value) {
        const autoSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug: autoSlug }));
        checkSlugAvailability(autoSlug);
      } else if (field === 'slug' && value) {
        checkSlugAvailability(value);
      }
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    setSlugStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const response = await axiosInstance.get(API_PATHS.VALIDATION.CHECK_SLUG_AVAILABILITY(slug));
      setSlugStatus({
        checking: false,
        available: response.data.available,
        suggestions: []
      });
      
      // If not available, get suggestions
      if (!response.data.available) {
        const suggestResponse = await axiosInstance.get(API_PATHS.VALIDATION.SUGGEST_SLUG(formData.name || slug));
        setSlugStatus(prev => ({
          ...prev,
          suggestions: suggestResponse.data.suggestions || []
        }));
      }
    } catch (error) {
      console.error('Slug check failed:', error);
      setSlugStatus({ checking: false, available: null, suggestions: [] });
    }
  };

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const requiredFields = ['name', 'contactEmail']; // Only these are truly required
    
    for (const field of step.fields) {
      if (requiredFields.includes(field) && !formData[field]) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;

      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null) {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Add slug if not provided
      if (!formData.slug) {
        data.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));
      }

      if (logoFile) {
        data.append('logoFile', logoFile);
      }

      const response = await axiosInstance.post(API_PATHS.BUSINESSES.CREATE_BUSINESS, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTenant(response.data.business);
      setNeedsOnboarding(false);
      
      toast.success('Business created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Business creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Acme Digital Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    slugStatus.available === true ? 'border-green-300 bg-green-50' :
                    slugStatus.available === false ? 'border-red-300 bg-red-50' :
                    'border-gray-300'
                  }`}
                  placeholder="acme-digital-solutions"
                />
                {slugStatus.checking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Slug Status */}
              {formData.slug && formData.slug.length >= 3 && !slugStatus.checking && (
                <div className="mt-2">
                  {slugStatus.available === true && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Slug is available!
                    </p>
                  )}
                  
                  {slugStatus.available === false && (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Slug is already taken
                      </p>
                      
                      {slugStatus.suggestions.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {slugStatus.suggestions.slice(0, 5).map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleInputChange('slug', suggestion)}
                                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-1">
                Your public page: truetestify.com/{formData.slug || 'your-business-slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell customers what makes your business special..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select your industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://yourbusiness.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="contact@yourbusiness.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        );

      case 2: // Location Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Business Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select company size</option>
                {companySizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.foundedYear}
                onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="2020"
              />
            </div>
          </div>
        );

      case 4: // Branding & Logo
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => handleInputChange('brandColor', e.target.value)}
                  className="w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => handleInputChange('brandColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="#ef7c00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {logoFile && (
                <p className="text-sm text-green-600 mt-2">✓ {logoFile.name} selected</p>
              )}
            </div>
          </div>
        );

      case 5: // Business Hours
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Set your business operating hours (use "Closed" for days you're not open)
            </p>
            {Object.keys(formData.businessHours).map(day => (
              <div key={day} className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700 capitalize">
                  {day}
                </label>
                <input
                  type="text"
                  value={formData.businessHours[day]}
                  onChange={(e) => handleInputChange(`businessHours.${day}`, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="9:00-17:00 or Closed"
                />
              </div>
            ))}
          </div>
        );

      case 6: // Social Media
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Connect your social media profiles (optional)
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://twitter.com/yourbusiness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://linkedin.com/company/yourbusiness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip Setup
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            {React.createElement(steps[currentStep].icon, {
              className: "w-8 h-8 text-orange-600"
            })}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={loading || (currentStep === 0 && (!formData.name || !formData.contactEmail))}
            className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Create Business' : 'Next'}
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveOnboarding;