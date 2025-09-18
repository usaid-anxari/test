import { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
} from "@heroicons/react/24/outline";

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
  const { user } = useContext(AuthContext);
  const [billingAccount, setBillingAccount] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);

        // Fetch billing account
        try {
          const billingResponse = await axiosInstance.get(
            API_PATHS.BILLING.GET_BILLING_ACCOUNT
          );
          setBillingAccount(billingResponse.data);
        } catch (billingError) {
          console.log("No billing account found:", billingError);
          setBillingAccount(null);
        }

        // Fetch pricing plans
        try {
          const plansResponse = await axiosInstance.get(
            API_PATHS.BILLING.GET_PRICING_PLANS
          );
          setPricingPlans(plansResponse.data);
        } catch (plansError) {
          console.log("Pricing plans not available:", plansError);
          // Set default plans
          setPricingPlans([
            { id: "free", name: "Free", price: 0, storageLimit: 1 },
            { id: "pro", name: "Pro", price: 49, storageLimit: 10 },
          ]);
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBillingData();
    }
  }, [user]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCardValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Create checkout session with Stripe
      const checkoutResponse = await axiosInstance.post(
        API_PATHS.BILLING.CREATE_CHECKOUT_SESSION,
        {
          priceId: "pro-plan",
          successUrl: window.location.origin + "/dashboard",
          cancelUrl: window.location.origin + "/billing",
        }
      );

      // Redirect to Stripe checkout
      if (checkoutResponse.data.url) {
        window.location.href = checkoutResponse.data.url;
        return;
      }

      // Save a mock invoice to localStorage for demo
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      const newInvoice = {
        id: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        plan: billingAccount?.planName || "Pro",
        amount: billingAccount?.planPrice || 49,
        currency: "USD",
        email: form.email,
        name: form.name,
      };
      localStorage.setItem(
        "invoices",
        JSON.stringify([newInvoice, ...invoices])
      );

      toast.success(
        "Payment successful! Your subscription has been activated."
      );
      navigate("/dashboard");
      // Reset form
      setForm((prev) => ({
        ...prev,
        cardNumber: "",
        expMonth: "",
        expYear: "",
        cvc: "",
      }));
    } catch (error) {
      toast.error("Payment failed. Please try again.");
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
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-4">
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

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Subscription Overview */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {billingAccount?.planName || "Pro"}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  Current Plan
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2 capitalize">
                  {billingAccount?.status || "Active"}
                </div>
                <div className="text-sm text-green-500 font-medium">Status</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  ${billingAccount?.planPrice || "49"}
                </div>
                <div className="text-sm text-orange-500 font-medium">
                  Per Month
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    Next billing date
                  </span>
                </div>
                <span className="text-gray-800 font-semibold">
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <CreditCardIcon className="w-8 h-8 mr-3 text-blue-600" />
              Payment Method
            </h2>
            <p className="text-gray-600">
              Update your billing information and payment details
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                  name="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={form.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="expMonth"
                    placeholder="MM"
                    value={form.expMonth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="expYear"
                    placeholder="YY"
                    value={form.expYear}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVC *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="cvc"
                    placeholder="123"
                    value={form.cvc}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Billing Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                  name="address"
                  placeholder="Enter your billing address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="city"
                    placeholder="Enter your city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                    name="country"
                    placeholder="Enter your country"
                    value={form.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={!isCardValid || isProcessing}
                  className={`inline-flex items-center px-8 py-3 font-bold rounded-xl transition-all duration-200 ${
                    isCardValid && !isProcessing
                      ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5 mr-2" />
                      Pay & Activate Subscription
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Validation Status */}
            <div className="mt-6">
              {!isCardValid ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">
                      Please complete all required fields
                    </span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {!form.name && <li>• Full Name is required</li>}
                    {!form.email && <li>• Email is required</li>}
                    {form.cardNumber.replace(/\s+/g, "").length < 12 && (
                      <li>• Card number must be at least 12 digits</li>
                    )}
                    {(!form.expMonth ||
                      Number(form.expMonth) < 1 ||
                      Number(form.expMonth) > 12) && (
                      <li>• Valid expiry month (01-12)</li>
                    )}
                    {(!form.expYear ||
                      Number(form.expYear) < 24 ||
                      Number(form.expYear) > 50) && (
                      <li>• Valid expiry year (24-50)</li>
                    )}
                    {form.cvc.trim().length < 3 && (
                      <li>• CVC must be 3-4 digits</li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">
                      All fields are valid! Ready to process payment.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {billingAccount?.paymentMethod && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    Current card: •••• •••• ••••{" "}
                    {billingAccount.paymentMethod.last4}
                  </span>
                </div>
              </div>
            )}
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
