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
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { useAuth0 } from "@auth0/auth0-react";
import { assest } from "../assets/mockData";
import LogoutModal from "./LogoutModal";

const Sidebar = ({ setIsSidebarOpen, isLogoutModalOpen, setIsLogoutModalOpen }) => {
  const { logout, user } = useContext(AuthContext);
  const { logout: auth0Logout, isAuthenticated } = useAuth0();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    auth0Logout({ returnTo: window.location.origin });
  };

  const NavItem = ({ to, icon, label, onClick }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title={isCollapsed ? label : ''}
      >
        <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          {icon}
        </span>
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <>
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6'} border-b border-gray-200`}>
        {!isCollapsed && (
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsSidebarOpen(false)}
          >
            <img 
              src={assest.Logo} 
              alt="TrueTestify" 
              className="h-8 w-auto"
            />
          </Link>
        )}
        <div className="flex items-center gap-2">
          <button
            className="hidden md:block p-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          <button
            className="md:hidden p-1 rounded-lg hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 overflow-y-auto custom-scrollbar`}>
        <div className="space-y-1">
          <NavItem
            to="/dashboard"
            icon={<Squares2X2Icon className="h-5 w-5" />}
            label="Dashboard"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              MAIN MENU
            </h3>
          )}
          {isCollapsed && <div className="h-4 border-t border-gray-200 mx-2 mb-3"></div>}
          <div className="space-y-1">
            <NavItem
              to="/dashboard/business/me"
              icon={<UserCircleIcon className="h-5 w-5" />}
              label="Business Profile"
              onClick={() => setIsSidebarOpen(false)}
            />
            <NavItem
              to="/dashboard/moderation"
              icon={<PhotoIcon className="h-5 w-5" />}
              label="Review Moderation"
              onClick={() => setIsSidebarOpen(false)}
            />
            <NavItem
              to="/dashboard/analytics"
              icon={<ChartBarIcon className="h-5 w-5" />}
              label="Analytics & Reports"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              BUSINESS
            </h3>
          )}
          {isCollapsed && <div className="h-4 border-t border-gray-200 mx-2 mb-3"></div>}
          <div className="space-y-1">
            <NavItem
              to="/dashboard/billing"
              icon={<CreditCardIcon className="h-5 w-5" />}
              label="Billing & Plans"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* <NavItem
              to="/dashboard/google-reviews"
              icon={<StarIcon className="h-5 w-5" />}
              label="Google Reviews"
              onClick={() => setIsSidebarOpen(false)}
            /> */}
          </div>
        </div>

        <div className="mt-8">
          {!isCollapsed && (
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              SETTINGS
            </h3>
          )}
          {isCollapsed && <div className="h-4 border-t border-gray-200 mx-2 mb-3"></div>}
          <div className="space-y-1">
            <NavItem
              to="/dashboard/widgets"
              icon={<PuzzlePieceIcon className="h-5 w-5" />}
              label="Widget Manager"
              onClick={() => setIsSidebarOpen(false)}
            />
            <NavItem
              to="/dashboard/settings"
              icon={<CogIcon className="h-5 w-5" />}
              label="Settings"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        {isAuthenticated && (
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200`}
            title={isCollapsed ? 'Log out' : ''}
          >
            <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        )}
      </div>

    </div>
    </>
  );
};

export default Sidebar;
