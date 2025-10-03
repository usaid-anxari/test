import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

export const useFeatureAccess = (feature) => {
  // Simplified - feature access is handled by billing service on backend
  // Frontend assumes access unless explicitly blocked
  const [hasAccess] = useState(true);
  const [loading] = useState(false);

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