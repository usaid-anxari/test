import {  useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth0 } from "@auth0/auth0-react";
import  useSubscription  from "../../hooks/useSubscription"
import { billingService } from "../../service/billingService"

const InvoiceList = ({ invoices, onDownload }) => {
  const downloadInvoice = async (invoice) => {
    try {
      await onDownload(invoice.id);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (invoices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Invoices Yet
        </h3>
        <p className="text-gray-500">
          Your billing history will appear here once you make payments
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice, index) => (
        <motion.div
          key={invoice.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{invoice.invoiceNumber}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(invoice.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1 lg:mx-8">
              <div className="text-center lg:text-left">
                <div className="text-sm text-gray-500">Description</div>
                <div className="font-semibold text-gray-800">
                  {invoice.description}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-sm text-gray-500">Amount</div>
                <div className="font-semibold text-gray-800">
                  ${invoice.amount.toFixed(2)}
                </div>
              </div>
              <div className="text-center lg:text-left col-span-2 lg:col-span-1">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  {invoice.status === 'succeeded' ? 'Paid' : 
                   invoice.status === 'pending' ? 'Pending' : 'Failed'}
                </div>
              </div>
            </div>

            <button
              onClick={() => downloadInvoice(invoice)}
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Billing = () => {
  const navigate = useNavigate();
  const { subscriptionData: subscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const paymentStatus = searchParams.get('status') || searchParams.get('payment');
  const paymentReason = searchParams.get('reason');
  const sessionId = searchParams.get('session_id');
  const [pricingPlans, setPricingPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
console.log({pricingPlans});
console.log({subscription});



  // Extract data from subscription hook - memoized to prevent re-renders
  const billingAccount = useMemo(() => ({
    planName: subscription?.tier || "FREE",
    planPrice: subscription?.tier === 'STARTER' ? 19 : 
               subscription?.tier === 'PROFESSIONAL' ? 49 : 
               subscription?.tier === 'ENTERPRISE' ? 99 : 0,
    status: subscription?.status || "ACTIVE",
    storageLimitGb: parseFloat(subscription?.storageUsage?.split('/')[1] || '1'),
    storageUsageGb: parseFloat(subscription?.storageUsage?.split('/')[0] || '0'),
    isTrialActive: subscription?.trialActive || false,
    daysUntilTrialEnd: subscription?.trialDaysLeft || 0,
    trialEndsAt: new Date(Date.now() + (subscription?.trialDaysLeft || 0) * 24 * 60 * 60 * 1000)
  }), [subscription]);
  console.log({billingAccount});
  
  const storageStatus = useMemo(() => ({
    storageUsageGb: parseFloat(subscription?.storageUsage?.split('/')[0] || '0'),
    storageLimitGb: parseFloat(subscription?.storageUsage?.split('/')[1] || '1'),
    storageUsagePercentage: subscription?.storagePercentage || 0,
    isExceeded: subscription?.storagePercentage > 100
  }), [subscription]);
  
  const [invoices, setInvoices] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Fetch real invoices from API
  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.BILLING.GET_INVOICES || '/api/billing/invoices');
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setInvoices([]);
    }
  }, []);
  const loading = subscriptionLoading;

  // Handle payment success/failure
  useEffect(() => {
    if (paymentStatus === 'success' && sessionId) {
      toast.success('Payment successful! Your subscription has been activated.');
      setTimeout(() => {
        navigate('/dashboard/billing', { replace: true });
      }, 1000);
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. You can try again anytime.');
      navigate('/dashboard/billing', { replace: true });
    }
  }, [paymentStatus, sessionId, navigate]);

  // Refresh pricing plans only
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await getAccessTokenSilently();
      const plansData = await billingService.getPricingPlans(token);
      const formattedPlans = plansData.map(plan => ({
        id: plan.tier.toLowerCase(),
        name: plan.name,
        tier: plan.tier,
        price: plan.monthlyPriceCents / 100,
        storageLimit: plan.storageLimitGb,
        features: plan.features,
        stripePriceId: plan.stripePriceId,
        isPopular: plan.isPopular,
        description: plan.description
      }));
      setPricingPlans(formattedPlans);
      await fetchInvoices();
      await refetchSubscription();
      toast.success('Data refreshed!');
    } catch (error) {
      // Set default plans if API fails
      const defaultPlans = [
        { id: "free", name: "Free", tier: "FREE", price: 0, storageLimit: 1, features: ["1GB storage"] },
        { id: "starter", name: "Starter", tier: "STARTER", price: 19, storageLimit: 10, features: ["10GB storage"], isPopular: true },
        { id: "professional", name: "Professional", tier: "PROFESSIONAL", price: 49, storageLimit: 50, features: ["50GB storage"] },
        { id: "enterprise", name: "Enterprise", tier: "ENTERPRISE", price: 99, storageLimit: 200, features: ["200GB storage"] },
      ];
      setPricingPlans(defaultPlans);
    } finally {
      setRefreshing(false);
    }
  }, [getAccessTokenSilently, fetchInvoices, refetchSubscription]);

  // Download invoice PDF from API
  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await axiosInstance.get(
        `/api/billing/invoices/${invoiceId}/download`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Initialize pricing plans and invoices on mount
  useEffect(() => {
    if (isAuthenticated && !loading && !dataLoaded) {
      refreshData();
      setDataLoaded(true);
    }
  }, [isAuthenticated, loading, dataLoaded]); // Removed refreshData dependency

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }
  
  // Handle plan selection and checkout
  const handlePlanSelect = async (plan) => {
    console.log('🎯 Plan selected:', plan);
    
    if (plan.tier === 'FREE') {
      toast.error('Free plan is already active');
      return;
    }

    setIsProcessing(true);
    toast.loading('Creating checkout session...');
    console.log('💳 Starting checkout process for:', plan.tier);

    try {
      console.log('📡 Sending checkout request to:', API_PATHS.BILLING.CREATE_CHECKOUT_SESSION);
      const token = await getAccessTokenSilently();
      const checkoutResponse = await billingService.createCheckoutSession(
        token,
        plan.tier.toUpperCase(),
        window.location.origin + "/dashboard/billing?payment=success",
        window.location.origin + "/dashboard/billing?payment=cancelled"
      );

      console.log('✅ Checkout response:', checkoutResponse);
      toast.dismiss();
      
      if (checkoutResponse.checkoutUrl) {
        console.log('🔄 Redirecting to:', checkoutResponse.checkoutUrl);
        
        // Check if it's a development success URL (immediate redirect)
        if (checkoutResponse.checkoutUrl.includes('payment=success')) {
          console.log('🚀 Development mode - immediate success');
          toast.success('Payment successful! Plan updated.');
          // Force refresh billing data and invoices
          setTimeout(() => {
            setDataLoaded(false); // This will trigger useEffect to reload data
          }, 500);
          return;
        }
        
        window.location.href = checkoutResponse.checkoutUrl;
        return;
      }

      toast.error('Failed to create checkout session');
    } catch (error) {
      console.error('❌ Checkout error:', error);
      console.error('Error response:', error.response?.data);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to start checkout process');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Billing & Payments
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                title="Refresh data"
              >
                <ArrowPathIcon className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                  <div className="text-2xl font-bold">
                    ${billingAccount?.planPrice || "49"}
                  </div>
                  <div className="text-sm text-blue-100">Monthly</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-green-300">
                    {billingAccount?.status === "active" ? "Active" : "Inactive"}
                  </div>
                  <div className="text-sm text-blue-100">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Payment Status Alert */}
        {(paymentStatus === 'expired' || paymentReason === 'no_payment') && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">
                {paymentStatus === 'expired' ? 'Payment Required' : 'No Active Subscription'}
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              {paymentStatus === 'expired' 
                ? 'Your subscription payment has failed or expired. Please update your payment method to continue using TrueTestify.'
                : 'You need an active subscription to access premium features. Choose a plan below to get started.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                View Pricing Plans
              </button>
            </div>
          </motion.div>
        )}

        {/* Storage Usage */}
        {storageStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Storage Usage
              </h2>
              <p className="text-gray-600">
                Monitor your video and audio storage consumption
              </p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {storageStatus.storageUsageGb} GB of {storageStatus.storageLimitGb} GB used
                  </span>
                  <span className={`text-sm font-bold ${
                    storageStatus.isExceeded ? 'text-red-600' : 
                    storageStatus.storageUsagePercentage > 80 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {storageStatus.storageUsagePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      storageStatus.isExceeded ? 'bg-red-500' :
                      storageStatus.storageUsagePercentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageStatus.storageUsagePercentage, 100)}%` }}
                  />
                </div>
              </div>
              {storageStatus.isExceeded && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">
                      Storage limit exceeded! Upgrade your plan to continue uploading.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Current Plan Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-3 text-blue-600" />
              Current Subscription
            </h2>
            <p className="text-gray-600">
              Your active plan and billing details
            </p>
          </div>

          <div className="p-6">
            {/* Trial Warning for Free Plan */}
            {billingAccount?.planName === 'FREE' && billingAccount?.isTrialActive && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="font-semibold text-orange-800">
                    Free Trial - {billingAccount.daysUntilTrialEnd} days remaining
                  </span>
                </div>
                <p className="text-orange-700 text-sm mb-3">
                  Your free trial expires on {new Date(billingAccount.trialEndsAt).toLocaleDateString()}. 
                  Upgrade to continue using all features.
                </p>
                <div className="text-sm text-orange-600">
                  <strong>Free Plan Limitations:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Only 1 widget allowed</li>
                    <li>Video and audio reviews only (no text reviews)</li>
                    <li>No Google Reviews integration</li>
                    <li>1GB storage limit</li>
                    <li>Basic support only</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {billingAccount?.planName || "FREE"}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  Current Plan
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-2xl p-6 text-center ${
                billingAccount?.status === 'active' ? 'from-green-50 to-green-100' : 
                billingAccount?.isTrialActive ? 'from-yellow-50 to-yellow-100' : 'from-red-50 to-red-100'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  billingAccount?.status === 'active' ? 'bg-green-500' : 
                  billingAccount?.isTrialActive ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl font-bold mb-2 capitalize ${
                  billingAccount?.status === 'active' ? 'text-green-600' : 
                  billingAccount?.isTrialActive ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {billingAccount?.isTrialActive ? 'Trial' : billingAccount?.status || "Active"}
                </div>
                <div className={`text-sm font-medium ${
                  billingAccount?.status === 'active' ? 'text-green-500' : 
                  billingAccount?.isTrialActive ? 'text-yellow-500' : 'text-red-500'
                }`}>Status</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  ${billingAccount?.planPrice || "0"}
                </div>
                <div className="text-sm text-orange-500 font-medium">
                  Per Month
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {billingAccount?.isTrialActive ? billingAccount.daysUntilTrialEnd : '30'}
                </div>
                <div className="text-sm text-purple-500 font-medium">
                  {billingAccount?.isTrialActive ? 'Days Left' : 'Days Cycle'}
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">
                    {billingAccount?.isTrialActive ? 'Trial Expires' : 'Next Billing Date'}
                  </span>
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-800 font-semibold">
                  {billingAccount?.isTrialActive && billingAccount?.trialEndsAt
                    ? new Date(billingAccount.trialEndsAt).toLocaleDateString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  }
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Storage Used</span>
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <span className="text-gray-800 font-semibold">
                  {storageStatus?.storageUsageGb || '0.00'} GB / {billingAccount?.storageLimitGb || 1} GB
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {billingAccount?.planName === 'FREE' ? (
                <button
                  onClick={() => document.getElementById('pricing-plans').scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Upgrade Now
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const token = await getAccessTokenSilently();
                      const portalResponse = await billingService.createPortalSession(token);
                      if (portalResponse.portalUrl) {
                        window.open(portalResponse.portalUrl, '_blank');
                      }
                    } catch (error) {
                      console.error('Portal error:', error);
                      toast.error(error.response?.data?.message || 'Failed to open customer portal');
                    }
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Manage Subscription
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          id="pricing-plans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Select the perfect plan for your business needs
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                    plan.isPopular ? 'border-orange-500 bg-orange-50 transform scale-105' : 
                    billingAccount?.planName === plan.tier ? 'border-blue-500 bg-blue-50' :
                    'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  {billingAccount?.planName === plan.tier && (
                    <div className="absolute -top-3 right-3">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${plan.price}
                      <span className="text-sm text-gray-500 font-normal">
                        {plan.tier === 'FREE' ? '/7 days trial' : '/month'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="text-left mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.features?.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        )) || (
                          <li className="flex items-center">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {plan.storageLimit}GB Storage
                          </li>
                        )}
                        {plan.tier === 'FREE' && (
                          <>
                            <li className="flex items-center text-red-600">
                              <XCircleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                              Only 1 widget
                            </li>
                            <li className="flex items-center text-red-600">
                              <XCircleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                              No text reviews
                            </li>
                            <li className="flex items-center text-red-600">
                              <XCircleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                              No Google Reviews
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {billingAccount?.planName === plan.tier ? (
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : plan.tier === 'FREE' ? (
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Trial Only
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanSelect(plan)}
                        disabled={isProcessing}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                          isProcessing 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          `Subscribe to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stripe Checkout Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <CreditCardIcon className="w-8 h-8 mr-3 text-blue-600" />
              Secure Payment with Stripe
            </h2>
            <p className="text-gray-600">
              Click on any plan above to be redirected to our secure Stripe checkout
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Secure & Safe</h3>
                  <p className="text-sm text-gray-600">256-bit SSL encryption</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">All Cards Accepted</h3>
                  <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowPathIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Cancel Anytime</h3>
                  <p className="text-sm text-gray-600">No long-term contracts</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Invoice History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
              Invoice History
            </h2>
            <p className="text-gray-600">
              Download and manage your billing history
            </p>
          </div>

          <div className="p-6">
            <InvoiceList invoices={invoices} onDownload={downloadInvoice} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Billing;
