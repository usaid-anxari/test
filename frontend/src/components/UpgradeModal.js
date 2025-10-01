import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  feature = 'unlimited_widgets',
  widgetCount = 0 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getFeatureInfo = () => {
    switch (feature) {
      case 'unlimited_widgets':
        return {
          title: 'Widget Limit Reached',
          description: `You've created ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}. Free plan allows only 1 widget. Upgrade to create unlimited widgets and unlock more features.`,
          requiredPlan: 'Starter',
          icon: 'widgets',
          benefits: [
            'Unlimited widgets',
            '10GB storage',
            'All widget styles',
            'Priority support',
            'Analytics dashboard'
          ]
        };
      default:
        return {
          title: 'Premium Feature',
          description: 'This feature requires a premium plan.',
          requiredPlan: 'Starter',
          icon: 'star',
          benefits: ['Premium features', 'Priority support']
        };
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'widgets':
        return (
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
    }
  };

  const featureInfo = getFeatureInfo();

  const handleUpgrade = () => {
    navigate('/dashboard/billing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            {getIcon(featureInfo.icon)}
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {featureInfo.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            {featureInfo.description}
          </p>
          
          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">
              Upgrade to {featureInfo.requiredPlan} and get:
            </h4>
            <ul className="space-y-2">
              {featureInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade to {featureInfo.requiredPlan} - $19/month
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
          
          {/* Additional info */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            ✨ Instant activation • 💳 Cancel anytime • 🔒 Secure payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;