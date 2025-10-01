import { useState, useEffect } from 'react';
import axiosInstance from '../service/axiosInstanse';

const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState([]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/billing/status');
      setSubscriptionStatus({
        ...response.data,
        loading: false,
      });
    } catch (error) {
      console.warn('Failed to fetch subscription status:', error);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    
    // Refresh subscription status every 30 seconds
    const interval = setInterval(fetchSubscriptionStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const canAccessFeature = (feature) => {
    const { status, tier, trialActive } = subscriptionStatus;
    
    // If subscription is not active and not in trial, deny access
    if (status !== 'active' && !trialActive) {
      return false;
    }

    // Feature-specific checks based on tier
    switch (feature) {
      case 'analytics':
        return tier !== 'free';
      case 'custom_branding':
        return ['professional', 'enterprise'].includes(tier);
      case 'api_access':
        return ['professional', 'enterprise'].includes(tier);
      case 'white_label':
        return tier === 'enterprise';
      case 'priority_support':
        return tier !== 'free';
      case 'unlimited_widgets':
        return tier !== 'free';
      default:
        return true;
    }
  };

  const isStorageExceeded = () => {
    const [used, limit] = subscriptionStatus.storageUsage.split('/').map(Number);
    return used >= limit;
  };

  const getStoragePercentage = () => {
    const [used, limit] = subscriptionStatus.storageUsage.split('/').map(Number);
    return limit > 0 ? (used / limit) * 100 : 0;
  };

  return {
    ...subscriptionStatus,
    canAccessFeature,
    isStorageExceeded,
    getStoragePercentage,
    refresh: fetchSubscriptionStatus,
  };
};

export default useSubscription;