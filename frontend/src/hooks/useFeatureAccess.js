import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

export const useFeatureAccess = (feature) => {
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.BILLING.CHECK_FEATURE_ACCESS(feature)
        );
        setHasAccess(response.data.hasAccess);
      } catch (error) {
        console.log(`Feature access check failed for ${feature}:`, error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (feature) {
      checkAccess();
    }
  }, [feature]);

  return { hasAccess, loading };
};

export const useStorageStatus = () => {
  const [storageStatus, setStorageStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStorageStatus = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BILLING.GET_STORAGE_STATUS
      );
      setStorageStatus(response.data);
    } catch (error) {
      console.log('Storage status fetch failed:', error);
      setStorageStatus({
        storageUsageGb: 0.1,
        storageLimitGb: 1,
        usagePercentage: 10,
        isExceeded: false,
        canUpload: true
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageStatus();
  }, [fetchStorageStatus]);

  const refetch = () => {
    setLoading(true);
    fetchStorageStatus();
  };

  return { storageStatus, loading, refetch };
};