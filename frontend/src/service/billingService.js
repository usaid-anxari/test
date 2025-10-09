import axiosInstance from './axiosInstanse';
import { API_PATHS } from './apiPaths';

export const billingService = {
  // Get billing status
  getBillingStatus: async (token) => {
    const response = await axiosInstance.get(API_PATHS.BILLING.GET_STORAGE_STATUS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get detailed billing info
  getBillingInfo: async (token) => {
    const response = await axiosInstance.get(API_PATHS.BILLING.GET_BILLING_ACCOUNT, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get pricing plans
  getPricingPlans: async (token) => {
    const response = await axiosInstance.get(API_PATHS.BILLING.GET_PRICING_PLANS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create checkout session
  createCheckoutSession: async (token, pricingTier, successUrl, cancelUrl) => {
    const payload = { pricingTier, successUrl, cancelUrl };
    console.log('Billing service sending payload:', payload);
    const response = await axiosInstance.post(
      API_PATHS.BILLING.CREATE_CHECKOUT_SESSION,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Create customer portal session
  createPortalSession: async (token) => {
    const response = await axiosInstance.post(
      API_PATHS.BILLING.CREATE_PORTAL_SESSION,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};