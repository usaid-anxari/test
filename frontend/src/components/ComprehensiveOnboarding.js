import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BuildingOffice2Icon,
  LinkIcon,
  DocumentTextIcon,
  CalendarIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
  FlagIcon,
  HashtagIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { assest } from '../assets/mockData';

const ComprehensiveOnboarding = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { setTenant, setNeedsOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null, suggestions: [] });
  const [socialLinks, setSocialLinks] = useState([{ platform: '', url: '' }]);

  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    name: '',
    slug: '',
    description: '',
    industry: '',
    foundedYear: new Date().getFullYear(),
    website: '',
    contactEmail: user?.email || '',
    
    // Step 2 - Additional Details
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
    brandColor: '#1F0909',
    businessHours: {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-17:00',
      saturday: 'Closed',
      sunday: 'Closed'
    },
    logoUrl: '',
    bannerUrl: ''
  });

  const steps = [
    {
      title: "Create Your Business Account",
      description: "Set up your Truetestify account"
    },
    {
      title: "Create Your Business Account", 
      description: "Set up your Truetestify account"
    }
  ];

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage',
    'Real Estate', 'Education', 'Automotive', 'Beauty & Wellness', 'Legal',
    'Consulting', 'Manufacturing', 'Entertainment', 'Travel & Tourism', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate and check slug when name changes
    if (field === 'name' && value) {
      const autoSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
      checkSlugAvailability(autoSlug);
    } else if (field === 'slug' && value) {
      checkSlugAvailability(value);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index, field, value) => {
    const updated = socialLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setSocialLinks(updated);
  };

  const updateBusinessHours = (day, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }));
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
    if (stepIndex === 0) {
      return formData.name && 
             formData.slug && 
             formData.contactEmail && 
             slugStatus.available === true && 
             !slugStatus.checking;
    }
    return true;
  };
  
const handlePre = () => {
    if (currentStep > steps.length - 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleSubmit();
    }
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
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
        if (key === 'businessHours') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] && key !== 'logoUrl' && key !== 'bannerUrl') {
          data.append(key, formData[key]);
        }
      });

      // Add social links
      const validSocialLinks = socialLinks.filter(link => link.platform && link.url);
      if (validSocialLinks.length > 0) {
        data.append('socialLinks', JSON.stringify(
          validSocialLinks.reduce((acc, link) => {
            acc[link.platform.toLowerCase()] = link.url;
            return acc;
          }, {})
        ));
      }

      if (logoFile) {
        data.append('logoFile', logoFile);
      }

      if (bannerFile) {
        data.append('bannerFile', bannerFile);
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
      case 0: // Step 1 - Basic Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <BuildingOffice2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Business Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business URL Slug
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Your Slug"
                />
              </div>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center text-blue-600">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Truetestify.com/{!formData.slug ? "yourbusiness-slug" : formData.slug.toLowerCase()}</span>
                </div>
                <p className="text-xs text-blue-500 mt-1">Your Public Review Page</p>
              </div>
              
              {/* Slug Validation Feedback */}
              {slugStatus.checking && (
                <div className="mt-2 flex items-center text-yellow-600">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-sm">Checking availability...</span>
                </div>
              )}
              
              {slugStatus.available === true && (
                <div className="mt-2 flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Slug is available!</span>
                </div>
              )}
              
              {slugStatus.available === false && (
                <div className="mt-2">
                  <div className="flex items-center text-red-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Slug is not available</span>
                  </div>
                  {slugStatus.suggestions.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">Try these suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {slugStatus.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleInputChange('slug', suggestion)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Your Description here"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <div className="relative">
                  <BuildingOffice2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Enter Industry</option>
                    {industryOptions.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.foundedYear}
                    onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter year"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Website Link"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your email"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Step 2 - Additional Details
        return (
          <div className="space-y-6">
            {/* Logo and Banner Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="relative">
                  <div className="w-full h-32 rounded-lg border-2 border-gray-300 border-dashed flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors" style={{ backgroundColor: '#FFFFFF' }}>
                    {logoFile ? (
                      <img 
                        src={URL.createObjectURL(logoFile)} 
                        alt="Logo preview" 
                        className="w-full h-full rounded-lg object-contain p-2"
                      />
                    ) : (
                      <div className="text-center">
                        <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Upload Logo</p>
                        <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => setLogoFile(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner
                </label>
                <div className="relative">
                  <div className="w-full h-32 border-2 border-gray-300 border-dashed flex items-center justify-center rounded-lg cursor-pointer hover:border-blue-400 transition-colors" style={{ backgroundColor: '#FFFFFF' }}>
                    {bannerFile ? (
                      <img 
                        src={URL.createObjectURL(bannerFile)} 
                        alt="Banner preview" 
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Upload Banner</p>
                        <p className="text-xs text-gray-400 mt-1">Click to browse</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {bannerFile && (
                    <button
                      type="button"
                      onClick={() => setBannerFile(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your Phone Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Company Address"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <BuildingOffice2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <div className="relative">
                  <FlagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your State"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <div className="relative">
                  <HashtagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0"
                    style={{ backgroundColor: formData.brandColor }}
                    onClick={() => document.getElementById('colorPicker').click()}
                  />
                  <input
                    id="colorPicker"
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => handleInputChange('brandColor', e.target.value)}
                    className="absolute opacity-0 w-12 h-12 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => handleInputChange('brandColor', e.target.value)}
                    className="ml-3 flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="#1F0909"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours
              </label>
              <div className="space-y-3">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </div>
                    <div className="flex-1">
                      <select
                        value={hours}
                        onChange={(e) => updateBusinessHours(day, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="Closed">Closed</option>
                        <option value="9:00-17:00">9:00 AM - 5:00 PM</option>
                        <option value="8:00-18:00">8:00 AM - 6:00 PM</option>
                        <option value="10:00-19:00">10:00 AM - 7:00 PM</option>
                        <option value="9:00-21:00">9:00 AM - 9:00 PM</option>
                        <option value="24/7">24/7</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Links
              </label>
              {socialLinks.map((link, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="relative flex-1">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Select Platform</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="pinterest">Pinterest</option>
                    </select>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="flex-1 sm:flex-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Social URL"
                  />
                  {socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="text-blue-500 text-sm font-medium hover:text-blue-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Social Link
              </button>
            </div>
          </div>
        );



      default:
        return null;
    }
  };



  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* TrueTestify Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-8">
            <img src={assest.Logo} alt="TrueTestify Logo" className="h-10" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-end mb-4">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of 2
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={loading || !validateStep(currentStep)}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                currentStep === 1 ? 'Create Account' : 'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveOnboarding;