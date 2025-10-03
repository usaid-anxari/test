import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../service/axiosInstanse';

const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({ loading: true });
  const fetchedRef = useRef(false);

  const fetchSubscriptionStatus = async () => {
    if (fetchedRef.current) return;
    
    try {
      fetchedRef.current = true;
      const response = await axiosInstance.get('/api/billing/status', {
        timeout: 20000 // 20 second timeout for billing
      });
      setSubscriptionStatus({
        ...response.data,
        loading: false,
      });
    } catch (error) {
      console.warn('Failed to fetch subscription status:', error);
      // Set default values on timeout/error
      setSubscriptionStatus({
        tier: 'free',
        status: 'inactive',
        loading: false,
        storageUsage: '0/1',
      });
      fetchedRef.current = false;
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const canAccessFeature = useCallback((feature) => {
    const { status, tier, trialActive } = subscriptionStatus;
    
    if (status !== 'active' && !trialActive) {
      return false;
    }

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
  }, [subscriptionStatus]);

  const isStorageExceeded = useCallback(() => {
    if (!subscriptionStatus.storageUsage) return false;
    const [used, limit] = subscriptionStatus.storageUsage.split('/').map(Number);
    return used >= limit;
  }, [subscriptionStatus.storageUsage]);

  const getStoragePercentage = useCallback(() => {
    if (!subscriptionStatus.storageUsage) return 0;
    const [used, limit] = subscriptionStatus.storageUsage.split('/').map(Number);
    return limit > 0 ? (used / limit) * 100 : 0;
  }, [subscriptionStatus.storageUsage]);

  return {
    ...subscriptionStatus,
    canAccessFeature,
    isStorageExceeded,
    getStoragePercentage,
    refresh: fetchSubscriptionStatus,
  };
};

export default useSubscription;