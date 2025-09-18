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
import { AuthContext } from "../context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";

const Account = () => {
  const [business, setBusiness] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(API_PATHS.BUSINESSES.GET_PRIVATE_PROFILE);
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

    if (user) {
      fetchBusiness();
    }
  }, [user]);

  // Mock data for demonstration
  const accountStats = {
    memberSince: business?.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A',
    lastLogin: new Date().toLocaleDateString(),
    totalReviews: 47,
    planType: 'Pro'
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
      setBusiness(prev => ({ ...prev, name, slug }));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account data...</p>
        </div>
      </div>
    );
  }

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Account Management
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage your profile, security settings, and account preferences
              </p>
            </div>
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold">{accountStats.totalReviews}</div>
                <div className="text-sm text-blue-100">Reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                <div className="text-2xl font-bold">{accountStats.planType}</div>
                <div className="text-sm text-blue-100">Plan</div>
              </div>
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
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <UserIcon className="w-8 h-8 mr-3 text-blue-600" />
              Profile Information
            </h2>
            <p className="text-gray-600">Manage your personal and business account details</p>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!editMode ? (
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
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Personal Details</h3>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-lg font-bold text-gray-800">{business?.name || 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <EnvelopeIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                            <p className="text-lg font-bold text-gray-800">{user?.email || 'Not available'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Business Details</h3>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Business Slug</p>
                            <p className="text-lg font-bold text-gray-800">/{business?.slug || 'not-set'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <KeyIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Account ID</p>
                            <p className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded border">
                              {business?.id || user?.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      onClick={editToggle}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <PencilSquareIcon className="w-5 h-5 mr-2" />
                      Edit Profile
                    </button>
                  </div>

                </motion.div>
              ) : (
                <motion.form
                  key="edit-mode"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemVariants}
                  onSubmit={handleUpdate}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Edit Profile Information</h3>
                    <p className="text-sm text-blue-600">Update your personal and business details below</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Slug *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">/</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="your-business-name"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">This will be your public URL: truetestify.com/{slug}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={editToggle}
                      className="px-6 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Account Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <CogIcon className="w-8 h-8 mr-3 text-blue-600" />
              Account Statistics
            </h2>
            <p className="text-gray-600">Your account activity and membership details</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">{accountStats.memberSince}</div>
                <div className="text-sm text-blue-500 font-medium">Member Since</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">{accountStats.lastLogin}</div>
                <div className="text-sm text-green-500 font-medium">Last Login</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">{accountStats.totalReviews}</div>
                <div className="text-sm text-orange-500 font-medium">Total Reviews</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-2">{accountStats.planType}</div>
                <div className="text-sm text-purple-500 font-medium">Current Plan</div>
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
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
              Security & Actions
            </h2>
            <p className="text-gray-600">Manage your account security and session</p>
          </div>
          
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <ArrowRightEndOnRectangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sign Out</h3>
                    <p className="text-gray-600">
                      Securely sign out of your account. You'll need to log in again to access your dashboard.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                    toast.success('Successfully signed out!');
                  }}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
