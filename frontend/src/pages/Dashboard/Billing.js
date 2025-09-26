import { useContext, useMemo, useState, useEffect } from "react";

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

const InvoiceList = () => {
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

  const downloadInvoice = (invoice) => {
    const content = `
INVOICE
Invoice ID: ${invoice.id}
Date: ${new Date(invoice.date).toLocaleDateString()}
Plan: ${invoice.plan}
Amount: $${invoice.amount} ${invoice.currency}
Customer: ${invoice.name}
Email: ${invoice.email}

Thank you for your business!
TrueTestify
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded successfully!");
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
                <h4 className="font-bold text-gray-800">{invoice.id}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(invoice.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1 lg:mx-8">
              <div className="text-center lg:text-left">
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-semibold text-gray-800">
                  {invoice.plan}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-sm text-gray-500">Amount</div>
                <div className="font-semibold text-gray-800">
                  ${invoice.amount} {invoice.currency}
                </div>
              </div>
              <div className="text-center lg:text-left col-span-2 lg:col-span-1">
                <div className="text-sm text-gray-500">Status</div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Paid
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
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth0();
  const paymentStatus = searchParams.get('status') || searchParams.get('payment');
  const paymentReason = searchParams.get('reason');
  const sessionId = searchParams.get('session_id');
  const [billingAccount, setBillingAccount] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [storageStatus, setStorageStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    address: "",
    city: "",
    country: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Handle payment success/failure
  useEffect(() => {
    if (paymentStatus === 'success' && sessionId) {
      toast.success('Payment successful! Your subscription has been activated.');
      // Refresh billing data to show updated plan
      setTimeout(() => {
        fetchBillingData(true);
        // Clear URL parameters after data refresh
        setTimeout(() => {
          navigate('/dashboard/billing', { replace: true });
        }, 500);
      }, 500);
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. You can try again anytime.');
      // Clear URL parameters
      navigate('/dashboard/billing', { replace: true });
    }
  }, [paymentStatus, sessionId, navigate]);

  // Fetch billing data
  const fetchBillingData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      setLoading(!showRefreshToast);

        // Fetch billing account
        try {
          const billingResponse = await axiosInstance.get(
            showRefreshToast ? API_PATHS.BILLING.REFRESH_BILLING_ACCOUNT : API_PATHS.BILLING.GET_BILLING_ACCOUNT
          );
          const data = billingResponse.data;
          setBillingAccount({
            planName: data.pricingTier || "FREE",
            planPrice: data.monthlyPriceCents ? data.monthlyPriceCents / 100 : 0,
            status: data.billingStatus || "active",
            storageLimitGb: data.storageLimitGb || 1,
            storageUsageGb: data.storageUsageGb || 0,
            isTrialActive: data.isTrialActive,
            daysUntilTrialEnd: data.daysUntilTrialEnd,
            trialEndsAt: data.trialEndsAt
          });
        } catch (billingError) {
          console.log("No billing account found:", billingError);
          // Set default billing account for free tier
          setBillingAccount({
            planName: "FREE",
            planPrice: 0,
            status: "trialing",
            storageLimitGb: 1,
            storageUsageGb: 0,
            isTrialActive: true,
            daysUntilTrialEnd: 14
          });
        }

        // Fetch pricing plans
        try {
          const plansResponse = await axiosInstance.get(
            API_PATHS.BILLING.GET_PRICING_PLANS
          );
          console.log("plansResponse:", JSON.stringify(plansResponse.data));
          
          setPricingPlans(plansResponse.data.map(plan => ({
            id: plan.tier.toLowerCase(),
            name: plan.name,
            tier: plan.tier,
            price: plan.monthlyPriceCents / 100,
            storageLimit: plan.storageLimitGb,
            features: plan.features,
            stripePriceId: plan.stripePriceId,
            isPopular: plan.isPopular,
            description: plan.description
          })));
        } catch (plansError) {
          console.log("Pricing plans not available:", plansError);
          // Set default plans
          setPricingPlans([
            { id: "free", name: "Free", tier: "FREE", price: 0, storageLimit: 1, features: ["1GB storage"] },
            { id: "starter", name: "Starter", tier: "STARTER", price: 19, storageLimit: 10, features: ["10GB storage"], isPopular: true },
            { id: "professional", name: "Professional", tier: "PROFESSIONAL", price: 49, storageLimit: 50, features: ["50GB storage"] },
            { id: "enterprise", name: "Enterprise", tier: "ENTERPRISE", price: 99, storageLimit: 200, features: ["200GB storage"] },
          ]);
        }

        // Fetch storage status
        try {
          const storageResponse = await axiosInstance.get(
            API_PATHS.BILLING.GET_STORAGE_STATUS
          );
          console.log("storageResponse:", JSON.stringify(storageResponse.data));
          
          setStorageStatus(storageResponse.data);
        } catch (storageError) {
          console.log("Storage status not available:", storageError);
          setStorageStatus({
            storageUsageGb: 0.1,
            storageLimitGb: billingAccount?.storageLimitGb || 1,
            usagePercentage: 10,
            isExceeded: false,
            canUpload: true
          });
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
        if (showRefreshToast) {
          setRefreshing(false);
          toast.success("Billing data refreshed!");
        }
      }
    };

  // Fetch billing data
  useEffect(() => {
    if (isAuthenticated) {
      fetchBillingData();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
  
  const isCardValid = true;
  const handlePlanSelect = async (plan) => {
    if (plan.tier === 'FREE') {
      toast.error('Free plan is already active');
      return;
    }

    setIsProcessing(true);
    toast.loading('Creating checkout session...');

    try {
      const checkoutResponse = await axiosInstance.post(
        API_PATHS.BILLING.CREATE_CHECKOUT_SESSION,
        {
          pricingTier: plan.tier,
          successUrl: window.location.origin + "/dashboard/billing?payment=success",
          cancelUrl: window.location.origin + "/dashboard/billing?payment=cancelled",
        }
      );

      toast.dismiss();
      
      if (checkoutResponse.data.checkoutUrl) {
        window.location.href = checkoutResponse.data.checkoutUrl;
        return;
      }

      toast.error('Failed to create checkout session');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to start checkout process');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error("Please select a plan first");
      return;
    }
    
    if (!isCardValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session with Stripe
      const checkoutResponse = await axiosInstance.post(
        API_PATHS.BILLING.CREATE_CHECKOUT_SESSION,
        {
          pricingTier: selectedPlan.tier,
          successUrl: window.location.origin + "/billing?payment=success",
          cancelUrl: window.location.origin + "/billing?payment=cancelled",
        }
      );

      // Redirect to Stripe checkout
      if (checkoutResponse.data.checkoutUrl) {
        window.location.href = checkoutResponse.data.checkoutUrl;
        return;
      }

      toast.error("Failed to create checkout session");
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
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
                onClick={() => fetchBillingData(true)}
                disabled={refreshing}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                title="Refresh billing data"
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
                    {storageStatus.storageUsageGb.toFixed(2)} GB of {storageStatus.storageLimitGb} GB used
                  </span>
                  <span className={`text-sm font-bold ${
                    storageStatus.isExceeded ? 'text-red-600' : 
                    storageStatus.usagePercentage > 80 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {storageStatus.usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      storageStatus.isExceeded ? 'bg-red-500' :
                      storageStatus.usagePercentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageStatus.usagePercentage, 100)}%` }}
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
                  {storageStatus?.storageUsageGb?.toFixed(2) || '0.00'} GB / {billingAccount?.storageLimitGb || 1} GB
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
                      const portalResponse = await axiosInstance.post(
                        API_PATHS.BILLING.CREATE_PORTAL_SESSION
                      );
                      if (portalResponse.data.portalUrl) {
                        window.open(portalResponse.data.portalUrl, '_blank');
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
            <InvoiceList />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Billing;
