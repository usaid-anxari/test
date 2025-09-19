import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';
import toast from 'react-hot-toast';
import { 
  BuildingStorefrontIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const OptimizedOnboarding = () => {
  const { user: auth0User } = useAuth0();
  const { setTenant, setNeedsOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: '',
    slug: '',
    website: '',
    contactEmail: auth0User?.email || ''
  });

  // 🎯 STEP 1: Business Name & Slug
  const handleBusinessNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setBusinessData(prev => ({
      ...prev,
      name,
      slug
    }));
  };

  // 🚀 Create Business (Optimized)
  const createBusiness = async () => {
    if (!businessData.name.trim()) {
      toast.error('Please enter your business name');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.BUSINESSES.CREATE_BUSINESS, {
        name: businessData.name.trim(),
        slug: businessData.slug,
        website: businessData.website,
        contactEmail: businessData.contactEmail
      });

      if (response.data.success) {
        const newBusiness = response.data.business;
        setTenant(newBusiness);
        setNeedsOnboarding(false);
        
        toast.success('🎉 Business created successfully!');
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to create business:', error);
      
      if (error.response?.status === 409) {
        toast.error('Business name already taken. Please choose another.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create business');
      }
    } finally {
      setLoading(false);
    }
  };

  // 📋 Steps Configuration
  const steps = [
    {
      id: 1,
      title: 'Business Information',
      description: 'Tell us about your business',
      icon: BuildingStorefrontIcon
    },
    {
      id: 2,
      title: 'Review Setup',
      description: 'Configure your review collection',
      icon: SparklesIcon
    },
    {
      id: 3,
      title: 'Dashboard Ready',
      description: 'Start collecting reviews',
      icon: CheckCircleIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.id;
              const isCompleted = step > stepItem.id;
              
              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                      step > stepItem.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {steps[step - 1]?.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {steps[step - 1]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to TrueTestify! 👋
                </h3>
                <p className="text-gray-600">
                  Let's set up your business profile to start collecting authentic video and audio reviews.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessData.name}
                  onChange={handleBusinessNameChange}
                  placeholder="e.g., Awesome Hair Salon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public URL
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 bg-gray-50 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg">
                    truetestify.com/
                  </span>
                  <input
                    type="text"
                    value={businessData.slug}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="awesome-hair-salon"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your public review page URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={businessData.website}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://your-website.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={businessData.contactEmail}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@yourbusiness.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={loading}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!businessData.name.trim() || loading}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Review Collection Setup 🎥
                </h3>
                <p className="text-gray-600">
                  TrueTestify specializes in video and audio reviews that build authentic trust with your customers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="text-orange-600 text-2xl mb-2">🎥</div>
                  <h4 className="font-semibold text-gray-900">Video Reviews</h4>
                  <p className="text-sm text-gray-600">Customers record authentic video testimonials</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-2xl mb-2">🎙️</div>
                  <h4 className="font-semibold text-gray-900">Audio Reviews</h4>
                  <p className="text-sm text-gray-600">Voice testimonials for personal touch</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="text-green-600 text-2xl mb-2">📝</div>
                  <h4 className="font-semibold text-gray-900">Text Fallback</h4>
                  <p className="text-sm text-gray-600">Traditional text reviews as backup</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Your business profile will be created</li>
                  <li>✅ You'll get a public review collection page</li>
                  <li>✅ Customers can start leaving video/audio reviews</li>
                  <li>✅ You can moderate and approve reviews in your dashboard</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={createBusiness}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Business
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900">
                Welcome to TrueTestify!
              </h3>
              <p className="text-gray-600">
                Your business is now set up and ready to collect authentic reviews.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🚀 You're all set!</h4>
                <p className="text-sm text-green-800">
                  Redirecting to your dashboard where you can start managing reviews...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@truetestify.com" className="text-orange-600 hover:underline">
              support@truetestify.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizedOnboarding;