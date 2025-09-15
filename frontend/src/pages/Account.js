import {
  CogIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";

const Account = ({ userInfo, business }) => {
  const [name, setName] = useState(business?.name || "");
  const [slug, setSlug] = useState(business?.slug || "");
  const [editMode, setEditMode] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const editToggle = () => {
    if (!editMode) {
      setName(business?.name || "");
      setSlug(business?.slug || "");
    }
    setEditMode(!editMode);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.patch(API_PATHS.TENANTS.UPDATE_TENANTS(business?.id), {
        name,
        slug,
      });
      setEditMode(false);
      toast.success("Account updated successfully.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <h2 className="text-3xl font-bold text-gray-800 text-center">My Account</h2>

      {/* Account Info Card */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <AnimatePresence mode="wait">
          {!editMode ? (
            <motion.div
              key="view-mode"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={itemVariants}
              className="space-y-5"
            >
              {/* Name Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Full Name</p>
                    <p className="font-semibold text-gray-800">{business?.name}</p>
                  </div>
                </div>
                <button
                  onClick={editToggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 text-sm font-medium rounded-md hover:bg-orange-100 transition-colors"
                >
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  Edit
                </button>
              </div>

              {/* Business Name Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Business Name</p>
                    <p className="font-semibold text-gray-800">{business?.slug}</p>
                  </div>
                </div>
              </div>

              {/* Account ID Row */}
              <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <CogIcon className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Account ID</p>
                    <p className="font-semibold text-gray-800 truncate max-w-xs">{userInfo?.email}</p>
                  </div>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={editToggle}
                  className="px-4 py-2.5 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Section */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm text-center">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="w-full py-3 px-6 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;
