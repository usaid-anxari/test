import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { billingService } from '../service/billingService';

const useSubscription = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptionData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const data = await billingService.getBillingStatus(token);
      setSubscriptionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [isAuthenticated]);

  const canAccessFeature = (feature) => {
    if (!subscriptionData) return false;
    
    const { tier, status } = subscriptionData;
    
    // Check if subscription is active
    if (status !== 'ACTIVE' && status !== 'TRIALING') {
      return false;
    }

    // Feature access based on tier
    switch (feature) {
      case 'embed_code':
        return tier !== 'FREE';
      case 'google_reviews':
        return tier === 'PROFESSIONAL' || tier === 'ENTERPRISE';
      case 'custom_branding':
        return tier === 'PROFESSIONAL' || tier === 'ENTERPRISE';
      case 'api_access':
        return tier === 'PROFESSIONAL' || tier === 'ENTERPRISE';
      case 'white_label':
        return tier === 'ENTERPRISE';
      case 'priority_support':
        return tier !== 'FREE';
      case 'unlimited_widgets':
        return tier !== 'FREE';
      default:
        return true;
    }
  };

  const isStorageExceeded = () => {
    if (!subscriptionData) return false;
    const percentage = parseFloat(subscriptionData.storagePercentage) || 0;
    return percentage >= 100;
  };

  return {
    subscriptionData,
    loading,
    error,
    canAccessFeature,
    isStorageExceeded,
    refetch: fetchSubscriptionData,
    tier: subscriptionData?.tier?.toLowerCase() || 'free'
  };
};

export default useSubscription;