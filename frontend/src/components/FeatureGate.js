import { useNavigate } from 'react-router-dom';
import useSubscription from '../hooks/useSubscription';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  upgradeMessage = "This feature requires a premium plan.",
  widgetCount = 0 // For widget limit checking
}) => {
  const navigate = useNavigate();
  const subscription = useSubscription();

  // Check widget limits for free tier
  const checkWidgetLimit = () => {
    if (feature === 'unlimited_widgets' && subscription.tier === 'free') {
      return widgetCount >= 1; // Free tier allows only 1 widget
    }
    return false;
  };

  const hasAccess = subscription.canAccessFeature(feature) && !checkWidgetLimit();

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const getFeatureInfo = () => {
    switch (feature) {
      case 'analytics':
        return {
          title: 'Advanced Analytics',
          description: 'Get detailed insights about your reviews and customer engagement.',
          requiredPlan: 'Starter',
          icon: 'chart',
        };
      case 'custom_branding':
        return {
          title: 'Custom Branding',
          description: 'Customize your review widgets with your brand colors and logo.',
          requiredPlan: 'Professional',
          icon: 'palette',
        };
      case 'api_access':
        return {
          title: 'API Access',
          description: 'Integrate reviews into your applications with our REST API.',
          requiredPlan: 'Professional',
          icon: 'code',
        };
      case 'white_label':
        return {
          title: 'White Label Solution',
          description: 'Remove TrueTestify branding and use your own.',
          requiredPlan: 'Enterprise',
          icon: 'label',
        };
      case 'unlimited_widgets':
        const isWidgetLimit = checkWidgetLimit();
        return {
          title: isWidgetLimit ? 'Widget Limit Reached' : 'Unlimited Widgets',
          description: isWidgetLimit 
            ? 'Free plan allows only 1 widget. Upgrade to create unlimited widgets.' 
            : 'Create as many review widgets as you need.',
          requiredPlan: 'Starter',
          icon: 'widgets',
        };
      default:
        return {
          title: 'Premium Feature',
          description: upgradeMessage,
          requiredPlan: 'Starter',
          icon: 'star',
        };
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'widgets':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'palette':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
        );
      case 'code':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <div className="relative group">
      {/* Blurred content */}
      <div className="filter blur-[2px] pointer-events-none opacity-40 transition-all duration-300 group-hover:blur-[3px] group-hover:opacity-30">
        {children}
      </div>
      
      {/* Professional upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-8 max-w-md mx-4 transform transition-all duration-300 hover:scale-105">
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              {getIcon(featureInfo.icon)}
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {featureInfo.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {featureInfo.description}
            </p>
            
            {/* Plan requirement badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-full mb-6">
              <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-orange-800">
                {featureInfo.requiredPlan} Plan Required
              </span>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/25"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade to {featureInfo.requiredPlan}
            </button>
            
            {/* Additional info */}
            <p className="text-xs text-gray-500 mt-4">
              ✨ Instant activation • 💳 Cancel anytime • 🔒 Secure payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;