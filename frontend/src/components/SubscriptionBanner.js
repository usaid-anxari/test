import { useNavigate } from 'react-router-dom';

const SubscriptionBanner = ({ subscriptionStatus, tier, storageUsage, trialActive, trialDaysLeft }) => {
  const navigate = useNavigate();
  
  // Don't show banner for active paid subscriptions
  if (subscriptionStatus === 'ACTIVE' && tier !== 'FREE') {
    return null;
  }

  // Don't show upgrade prompt if user has paid plan (even if trialing)
  if (tier !== 'FREE' && subscriptionStatus !== 'PAST_DUE' && subscriptionStatus !== 'CANCELED') {
    return null;
  }

  // Parse storage usage - handle both string format and direct numbers
  let used = 0, limit = 1, storagePercentage = 0;
  if (typeof storageUsage === 'string') {
    [used, limit] = storageUsage.split('/').map(Number);
    storagePercentage = limit > 0 ? (used / limit) * 100 : 0;
  } else if (typeof storageUsage === 'object' && storageUsage) {
    used = storageUsage.used || 0;
    limit = storageUsage.limit || 1;
    storagePercentage = storageUsage.percentage || 0;
  }

  const getBannerConfig = () => {
    if (subscriptionStatus === 'PAST_DUE') {
      return {
        type: 'error',
        title: 'Payment Required',
        message: 'Your subscription payment is overdue. Please update your payment method.',
        action: 'Update Payment',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-600 hover:bg-red-700',
      };
    }

    if (subscriptionStatus === 'CANCELED') {
      return {
        type: 'error',
        title: 'Subscription Canceled',
        message: 'Your subscription has been canceled. Upgrade to continue using premium features.',
        action: 'Reactivate',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-600 hover:bg-red-700',
      };
    }

    if (trialActive && trialDaysLeft <= 3) {
      return {
        type: 'warning',
        title: `Trial Ending Soon`,
        message: `Your free trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''}. Upgrade to continue using all features.`,
        action: 'Upgrade Now',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-800',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
      };
    }

    if (storagePercentage >= 90) {
      return {
        type: 'warning',
        title: 'Storage Almost Full',
        message: `You've used ${storagePercentage.toFixed(0)}% of your storage. Upgrade for more space.`,
        action: 'Upgrade Plan',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      };
    }

    if (tier === 'FREE') {
      return {
        type: 'info',
        title: 'Free Plan',
        message: 'Upgrade to unlock advanced features, more storage, and priority support.',
        action: 'View Plans',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      };
    }

    return null;
  };

  const config = getBannerConfig();
  if (!config) return null;

  const handleUpgrade = () => {
    navigate('/dashboard/billing');
  };

  return (
    <div className={`${config.bgColor} border-l-4 border-l-orange-400 p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {config.type === 'error' && (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {config.type === 'warning' && (
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {config.type === 'info' && (
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor} opacity-90`}>
              {config.message}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleUpgrade}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${config.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            {config.action}
          </button>
        </div>
      </div>
      
      {/* Storage usage bar */}
      {storagePercentage > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Storage Usage</span>
            <span>{used.toFixed(1)}GB / {limit}GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                storagePercentage >= 90 ? 'bg-red-500' : 
                storagePercentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBanner;