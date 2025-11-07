import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { UserIcon, EnvelopeIcon, BuildingOfficeIcon, CalendarDaysIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";
import toast from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";

const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const notificationRef = useRef(null);
  const avatarRef = useRef(null);
  const { user, privateInfo,tenant, refreshBusinessInfo, refreshNotifications } = useContext(AuthContext);
  const { logout } = useAuth0();
  const navigate = useNavigate();
console.log(tenant);

  const notifications = privateInfo?.business?.unreadNotifications || 0;
  const pendingReviews = privateInfo?.business?.reviewNotifications || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Refresh immediately when opening dropdown
  useEffect(() => {
    if (isNotificationOpen) {
    const interval = setInterval(() => {
      refreshNotifications();
      refreshBusinessInfo()
    }, 5000);

    return () => clearInterval(interval);
    }
  }, [isNotificationOpen, refreshNotifications]);
  const handleMarkAsRead = async () => {
    try {
      await axiosInstance.post(API_PATHS.BUSINESSES.MARK_AS_READ);
      await refreshNotifications(); // Instant refresh
      setIsNotificationOpen(false); // Close dropdown
      toast.success('Notifications marked as read');
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error('Failed to mark notifications as read');
    }
  };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Hello {user?.name?.split(" ")[0] || "John"} 👋
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 relative"
          >
            <BellIcon className="h-6 w-6" />
           {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )} 
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications ({notifications})
                  </h3>
                  {notifications > 0 && (
                    <button 
                      onClick={handleMarkAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {pendingReviews.length > 0 ? (
                  pendingReviews.map((review) => (
                    <div key={review.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New {review.type} review pending
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            "{review.title}" by {review.reviewerName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
{/* Avatar */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setIsAvatarOpen(!isAvatarOpen)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
          >
            <img
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
              src={
                user?.picture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || user?.email || "User"
                )}&background=04A4FF&color=fff&size=128`
              }
              alt={user?.name || "User"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || user?.email || "User"
                )}&background=04A4FF&color=fff&size=128`;
              }}
            />
          </button>

          {isAvatarOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {/* Avatar Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center gap-3">
                  <img
                    className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                    src={
                      user?.picture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || user?.email || "User"
                      )}&background=04A4FF&color=fff&size=128`
                    }
                    alt={user?.name || "User"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{user?.name || "User"}</h3>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{tenant?.name || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Business Slug</p>
                    <p className="text-sm font-semibold text-gray-900">/{tenant?.slug || "not-set"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {tenant?.createdAt ? new Date(tenant?.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 border-t border-gray-200 space-y-1">
                <button
                  onClick={() => {
                    navigate("/dashboard/account");
                    setIsAvatarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">View Full Account</span>
                </button>
                <button
                  onClick={() => {
                    setIsLogoutModalOpen(true);
                    setIsAvatarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-left transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout({ returnTo: window.location.origin });
          setIsLogoutModalOpen(false);
        }}
      />
    </header>
  );
};

export default Header;
