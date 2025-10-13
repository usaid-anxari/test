import {
  CogIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";

const Account = () => {
  const [business, setBusiness] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { isAuthenticated, logout, user: auth0User } = useAuth0();
  const navigate = useNavigate();
  console.log(business);

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE
        );
        setBusiness(response.data.business);
        setName(response.data.business?.name || "");
        setSlug(response.data.business?.slug || "");
      } catch (error) {
        toast.error("Failed to load business data");
        console.error("Error fetching business:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBusiness();
    }
  }, [isAuthenticated]);

  // Mock data for demonstration
  const accountStats = {
    memberSince: business?.createdAt
      ? new Date(business.createdAt).toLocaleDateString()
      : "N/A",
    lastLogin: new Date().toLocaleDateString(),
  };

  const editToggle = () => {
    if (!editMode) {
      setName(business?.name || "");
      setSlug(business?.slug || "");
    }
    setEditMode(!editMode);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE, {
        name,
        slug,
      });
      setBusiness((prev) => ({ ...prev, name, slug }));
      setEditMode(false);
      toast.success("Account updated successfully!");
    } catch (error) {
      toast.error("Failed to update account. Please try again.");
      console.error("Error updating business:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04A4FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account data...</p>
        </div>
      </div>
    );
  }

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                Account Management
              </h1>
              <p className="text-white/80 text-lg font-medium" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                Manage your profile, security settings, and account preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-white p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              <UserIcon className="w-8 h-8 mr-3 text-[#04A4FF]" />
              Profile Information
            </h2>
            <p className="text-gray-600">
              Manage your personal and business account details
            </p>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="view-mode"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                      Personal Details
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Full Name
                          </p>
                          <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                            {business?.name || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Email Address
                          </p>
                          <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                            {auth0User?.email || "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                      Business Details
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Business Slug
                          </p>
                          <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                            /{business?.slug || "not-set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <KeyIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Account ID
                          </p>
                          <p className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded border">
                            {business?.id || auth0User?.sub || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Account Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-white p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              <CogIcon className="w-8 h-8 mr-3 text-[#04A4FF]" />
              Account Statistics
            </h2>
            <p className="text-gray-600">
              Your account activity and membership details
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {accountStats.memberSince}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  Member Since
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {accountStats.lastLogin}
                </div>
                <div className="text-sm text-green-500 font-medium">
                  Last Login
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-white p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              <ShieldCheckIcon className="w-8 h-8 mr-3 text-[#04A4FF]" />
              Security & Actions
            </h2>
            <p className="text-gray-600">
              Manage your account security and session
            </p>
          </div>

          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <ArrowRightEndOnRectangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                      Sign Out
                    </h3>
                    <p className="text-gray-600">
                      Securely sign out of your account. You'll need to log in
                      again to access your dashboard.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                    toast.success("Successfully signed out!");
                  }}
                  className="inline-flex items-center px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}
                >
                  <ArrowRightEndOnRectangleIcon className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;