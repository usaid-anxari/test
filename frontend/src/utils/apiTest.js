// API Integration Test Utility
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

export const testApiEndpoints = async () => {
  const results = {
    auth: { status: 'pending', message: '' },
    business: { status: 'pending', message: '' },
    reviews: { status: 'pending', message: '' },
    widgets: { status: 'pending', message: '' },
  };

  // Test Auth endpoints
  try {
    // This will fail without credentials, but we can check if endpoint exists
    await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email: 'test@example.com',
      password: 'test123'
    });
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      results.auth.status = 'success';
      results.auth.message = 'Auth endpoint accessible';
    } else if (error.code === 'ECONNREFUSED') {
      results.auth.status = 'error';
      results.auth.message = 'Backend server not running';
    } else {
      results.auth.status = 'error';
      results.auth.message = error.message;
    }
  }

  // Test Business endpoints (requires auth)
  try {
    await axiosInstance.get(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE);
  } catch (error) {
    if (error.response?.status === 401) {
      results.business.status = 'success';
      results.business.message = 'Business endpoint accessible (auth required)';
    } else {
      results.business.status = 'error';
      results.business.message = error.message;
    }
  }

  // Test Public business endpoint
  try {
    await axiosInstance.get(API_PATHS.BUSINESSES.GET_PUBLIC_PROFILE('test-business'));
  } catch (error) {
    if (error.response?.status === 404) {
      results.business.status = 'success';
      results.business.message = 'Public business endpoint accessible';
    } else {
      results.business.status = 'error';
      results.business.message = error.message;
    }
  }

  return results;
};

export const logApiTest = async () => {
  console.log('🧪 Testing API Integration...');
  const results = await testApiEndpoints();
  
  Object.entries(results).forEach(([endpoint, result]) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${endpoint.toUpperCase()}: ${result.message}`);
  });
  
  return results;
};