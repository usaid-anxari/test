import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';
import { ExclamationTriangleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const PaymentGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingStatus, setBillingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.BILLING.GET_BILLING_ACCOUNT);
        const billing = response.data;
        setBillingStatus(billing);

        // Check if payment failed or expired
        if (billing.status === 'past_due' || billing.status === 'canceled') {
          // Don't redirect if already on billing/pricing pages
          if (!location.pathname.includes('/billing') && !location.pathname.includes('/pricing')) {
            navigate('/dashboard/billing?status=expired');
          }
        }
      } catch (error) {
        console.log('Payment status check failed:', error);
        // If no billing account, redirect to pricing
        if (!location.pathname.includes('/billing') && !location.pathname.includes('/pricing')) {
          navigate('/pricing?reason=no_payment');
        }
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [navigate, location.pathname]);

  // Show loading while checking payment status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show payment expired warning
  if (billingStatus?.status === 'past_due') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Required</h1>
          <p className="text-gray-600 mb-6">
            Your subscription payment is overdue. Please update your payment method to continue using TrueTestify.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <CreditCardIcon className="w-5 h-5" />
              Update Payment Method
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show canceled subscription warning
  if (billingStatus?.status === 'canceled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCardIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subscription Canceled</h1>
          <p className="text-gray-600 mb-6">
            Your subscription has been canceled. Reactivate your plan to continue using premium features.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCardIcon className="w-5 h-5" />
              Choose New Plan
            </button>
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Billing Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PaymentGuard;