import {
  ArrowRightEndOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  CreditCardIcon,
  HomeIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  UserIcon,
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";
import NavLink from "./NavLink";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { useAuth0 } from "@auth0/auth0-react";

const Sidebar = ({ setIsSidebarOpen }) => {
  const { logout,user } = useContext(AuthContext);
  const {logout: auth0Logout,isAuthenticated} = useAuth0()

  const handleLogout = () => {
    logout();
    auth0Logout({ returnTo: window.location.origin });
  };
  return (
    <div className="w-64 sidebar-professional text-gray-800 p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300" style={{
            background: 'linear-gradient(135deg, #ef7c00 0%, #f97316 100%)'
          }}>
            <span className="text-white font-black text-lg">T</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">TrueTestify</div>
            <div className="text-xs text-gray-500 font-medium">Business Dashboard</div>
          </div>
        </Link>
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsSidebarOpen(false)}
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow">
        {/* Main Navigation */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Main Menu</h3>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard/business/me"
                icon={<UserCircleIcon className="h-5 w-5" />}
                label="Business Profile"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/moderation"
                icon={<PhotoIcon className="h-5 w-5" />}
                label="Review Moderation"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/widgets"
                icon={<PuzzlePieceIcon className="h-5 w-5" />}
                label="Widget Manager"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/analytics"
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="Analytics & Reports"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
          </ul>
        </div>
        
        {/* Business Management */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Business</h3>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard/billing"
                icon={<CreditCardIcon className="h-5 w-5" />}
                label="Billing & Plans"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/settings"
                icon={<CogIcon className="h-5 w-5" />}
                label="Settings"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/google-reviews"
                icon={<StarIcon className="h-5 w-5" />}
                label="Google Reviews"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            <li>
              <NavLink
                to="/dashboard/compliance"
                icon={<ShieldCheckIcon className="h-5 w-5" />}
                label="Privacy & Compliance"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
          </ul>
        </div>
        
        {/* Account Management */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Account</h3>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard/account"
                icon={<UserIcon className="h-5 w-5" />}
                label="My Account"
                onClick={() => setIsSidebarOpen(false)}
              />
            </li>
            {isAuthenticated ? (
              <li>
                <button
                  onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                >
                  <ArrowRightEndOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Sign Out</span>
                </button>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/"
                  icon={<UserIcon className="h-5 w-5" />}
                  label="Sign In"
                />
              </li>
            )}
          </ul>
        </div>
      </nav>
      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
        >
          <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>Back to Website</span>
        </Link>
        
        {/* User Info */}
        {user && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
