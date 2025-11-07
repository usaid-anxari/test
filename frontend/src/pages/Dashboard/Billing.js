import { useState, useEffect, useCallback, useMemo } from "react";
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
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { useAuth0 } from "@auth0/auth0-react";
import useSubscription from "../../hooks/useSubscription";
import { billingService } from "../../service/billingService";
import { assest } from "../../assets/mockData";

const InvoiceList = ({ invoices, onDownload }) => {
  const downloadInvoice = async (invoice) => {
    try {
      await onDownload(invoice.id);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
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
                <h4 className="font-bold text-gray-800">
                  {invoice.invoiceNumber}
                </h4>
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
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    invoice.status === "succeeded"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  {invoice.status === "succeeded"
                    ? "Paid"
                    : invoice.status === "pending"
                    ? "Pending"
                    : "Failed"}
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
  const {
    subscriptionData: subscription,
    loading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useSubscription();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const paymentStatus =
    searchParams.get("status") || searchParams.get("payment");
  const paymentReason = searchParams.get("reason");
  const sessionId = searchParams.get("session_id");
  const [pricingPlans, setPricingPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);


  // Extract data from subscription hook - memoized to prevent re-renders
  const billingAccount = useMemo(
    () => ({
      planName: subscription?.tier || "FREE",
      planPrice:
        subscription?.tier === "STARTER"
          ? 19
          : subscription?.tier === "PROFESSIONAL"
          ? 49
          : subscription?.tier === "ENTERPRISE"
          ? 99
          : 0,
      status: subscription?.status || "ACTIVE",
      storageLimitGb: parseFloat(
        subscription?.storageUsage?.split("/")[1] || "1"
      ),
      storageUsageGb: parseFloat(
        subscription?.storageUsage?.split("/")[0] || "0"
      ),
      isTrialActive: subscription?.trialActive || false,
      daysUntilTrialEnd: subscription?.trialDaysLeft || 0,
      trialEndsAt: new Date(
        Date.now() + (subscription?.trialDaysLeft || 0) * 24 * 60 * 60 * 1000
      ),
    }),
    [subscription]
  );

  // Compute storage status - memoized to prevent re-renders
  const storageStatus = useMemo(
    () => ({
      storageUsageGb: parseFloat(
        subscription?.storageUsage?.split("/")[0] || "0"
      ),
      storageLimitGb: parseFloat(
        subscription?.storageUsage?.split("/")[1] || "1"
      ),
      storageUsagePercentage: subscription?.storagePercentage || 0,
      isExceeded: subscription?.storagePercentage > 100,
    }),
    [subscription]
  );

  // Fetch real invoices from API
  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BILLING.GET_INVOICES || "/api/billing/invoices"
      );
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
    }
  }, []);
  const loading = subscriptionLoading;

  // Handle payment success/failure
  useEffect(() => {
    if (paymentStatus === "success" && sessionId) {
      toast.success(
        "Payment successful! Your subscription has been activated."
      );
      setTimeout(() => {
        navigate("/dashboard/billing", { replace: true });
      }, 1000);
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can try again anytime.");
      navigate("/dashboard/billing", { replace: true });
    }
  }, [paymentStatus, sessionId, navigate]);

  // Refresh pricing plans only
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await getAccessTokenSilently();
      const plansData = await billingService.getPricingPlans(token);
      const formattedPlans = plansData.map((plan) => ({
        id: plan.tier.toLowerCase(),
        name: plan.name,
        tier: plan.tier,
        price: plan.monthlyPriceCents / 100,
        storageLimit: plan.storageLimitGb,
        features: plan.features,
        stripePriceId: plan.stripePriceId,
        isPopular: plan.isPopular,
        description: plan.description,
      }));
      setPricingPlans(formattedPlans);
      await fetchInvoices();
      await refetchSubscription();
      toast.success("Data refreshed!");
    } catch (error) {
      // Set default plans if API fails
      const defaultPlans = [
        {
          id: "free",
          name: "Free",
          tier: "FREE",
          price: 0,
          storageLimit: 1,
          features: ["1GB storage"],
        },
        {
          id: "starter",
          name: "Starter",
          tier: "STARTER",
          price: 19,
          storageLimit: 10,
          features: ["10GB storage"],
          isPopular: true,
        },
        {
          id: "professional",
          name: "Professional",
          tier: "PROFESSIONAL",
          price: 49,
          storageLimit: 50,
          features: ["50GB storage"],
        },
        {
          id: "enterprise",
          name: "Enterprise",
          tier: "ENTERPRISE",
          price: 99,
          storageLimit: 200,
          features: ["200GB storage"],
        },
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
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
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
    if (plan.tier === "FREE") {
      toast.error("Free plan is already active");
      return;
    }

    setIsProcessing(true);
    toast.loading("Creating checkout session...");
    try {
      const token = await getAccessTokenSilently();
      const checkoutResponse = await billingService.createCheckoutSession(
        token,
        plan.tier.toUpperCase(),
        window.location.origin + "/dashboard/billing?payment=success",
        window.location.origin + "/dashboard/billing?payment=cancelled"
      );
      toast.dismiss();

      if (checkoutResponse.checkoutUrl) {
        // Check if it's a development success URL (immediate redirect)
        if (checkoutResponse.checkoutUrl.includes("payment=success")) {
          toast.success("Payment successful! Plan updated.");
          // Force refresh billing data and invoices
          setTimeout(() => {
            setDataLoaded(false); // This will trigger useEffect to reload data
          }, 500);
          return;
        }

        window.location.href = checkoutResponse.checkoutUrl;
        return;
      }

      toast.error("Failed to create checkout session");
    } catch (error) {
      console.error("❌ Checkout error:", error);
      console.error("Error response:", error.response?.data);
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to start checkout process"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Billing & Plans
        </h2>

        {/* Payment Status Alert */}
        {(paymentStatus === "expired" || paymentReason === "no_payment") && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">
                {paymentStatus === "expired"
                  ? "Payment Required"
                  : "No Active Subscription"}
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              {paymentStatus === "expired"
                ? "Your subscription payment has failed or expired. Please update your payment method to continue using TrueTestify."
                : "You need an active subscription to access premium features. Choose a plan below to get started."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/pricing")}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                View Pricing Plans
              </button>
            </div>
          </motion.div>
        )}

        {/* Current Subscription & Storage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Current Subscription
              </h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Credit Card Visual */}
              <div className="relative">
                <img
                  src={assest.Card}
                  alt="Credit Card"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>

              {/* Subscription Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {billingAccount?.isTrialActive
                        ? "Trial"
                        : billingAccount?.status || "Active"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Plan Expiry:{" "}
                    <span className="font-semibold text-gray-800">
                      {billingAccount?.isTrialActive &&
                      billingAccount?.trialEndsAt
                        ? new Date(
                            billingAccount.trialEndsAt
                          ).toLocaleDateString()
                        : "10/02/2026"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Storage Used:{" "}
                    <span className="font-semibold text-gray-800">
                      {storageStatus?.storageUsageGb || "0"} GB used of{" "}
                      {billingAccount?.storageLimitGb || 100} GB
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (billingAccount?.planName === "FREE") {
                      document
                        .getElementById("pricing-plans")
                        .scrollIntoView({ behavior: "smooth" });
                    } else {
                      try {
                        const token = await getAccessTokenSilently();
                        const portalResponse =
                          await billingService.createPortalSession(token);
                        if (portalResponse.portalUrl) {
                          window.open(portalResponse.portalUrl, "_blank");
                        }
                      } catch (error) {
                        console.error("Portal error:", error);
                        toast.error(
                          error.response?.data?.message ||
                            "Failed to open customer portal"
                        );
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#04A4FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Trial Warning */}
            {billingAccount?.isTrialActive && billingAccount?.daysUntilTrialEnd <= 7 && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-800">
                      Trial - {billingAccount.daysUntilTrialEnd} days
                      remaining
                    </span>
                  </div>
                  <p className="text-orange-700 text-sm">
                    Your Subscription expires on{" "}
                    {new Date(billingAccount.trialEndsAt).toLocaleDateString()}.
                    Upgrade to continue using all features.
                  </p>
                </div>
              )}
          </motion.div>

          {/* Storage Usage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Storage Usage
            </h3>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{
                    width: `${Math.min(
                      storageStatus?.storageUsagePercentage || 0,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {storageStatus?.storageUsageGb || "0"} GB used of{" "}
                  {billingAccount?.storageLimitGb || 100} GB
                </span>
                <span className="text-sm font-bold text-green-600">
                  {storageStatus?.storageUsagePercentage || 0}%
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success(
                    `Current Plan: ${billingAccount?.planName || "FREE"}`
                  );
                }}
                className="group relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <span className="relative text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                  {billingAccount?.planName || "FREE"}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (billingAccount?.isTrialActive) {
                    toast.success(
                      `Trial Active! ${billingAccount.daysUntilTrialEnd} days remaining`,
                      { duration: 4000, icon: "🎉" }
                    );
                  } else {
                    toast.info("Trial period has ended");
                  }
                }}
                className="group relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/10 group-hover:to-green-600/10 transition-all duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <span className="relative text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                  Trial
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const monthlyCharge = billingAccount?.planPrice || 0;
                  toast.success(`Current monthly charge: $${monthlyCharge}`);
                }}
                className="group relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:to-orange-600/10 transition-all duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <span className="relative text-sm font-bold text-gray-800 group-hover:text-orange-700 transition-colors">
                  Monthly
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const yearlyPrice =
                    (billingAccount?.planPrice || 0) * 12 * 0.8;
                  toast.success(
                    `Yearly plan: $${yearlyPrice.toFixed(0)} (Save 20%)`
                  );
                }}
                className="group relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:from-pink-100 hover:to-pink-200 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <span className="relative text-sm font-bold text-gray-800 group-hover:text-pink-700 transition-colors">
                  Yearly
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Plans */}
        <motion.div
          id="pricing-plans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Choose Your Plan
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border rounded-2xl p-6 transition-all hover:shadow-md ${
                    billingAccount?.planName === plan.tier
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-800">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">/month</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      per user/month, billed annually
                    </p>
                    <p className="text-gray-600 text-sm mb-6">
                      For Small Teams
                    </p>

                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      )) || (
                        <>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Lorem Ipsum is simply dummy</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Lorem Ipsum is simply dummy</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Lorem Ipsum is simply dummy</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Lorem Ipsum is simply dummy</span>
                          </li>
                        </>
                      )}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={
                        isProcessing ||
                        billingAccount?.planName === plan.tier ||
                        plan.tier === "FREE"
                      }
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                        billingAccount?.planName === plan.tier
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isProcessing
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#04A4FF] text-white hover:bg-blue-600"
                      }`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : billingAccount?.planName === plan.tier ? (
                        "Current Plan"
                      ) : (
                        "Get Started"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Invoice History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Invoice History
            </h2>
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
