import { Outlet } from "react-router-dom";
import { useState, useContext } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LogoutModal from "../components/LogoutModal";
import { AuthContext } from "../context/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const { logout: auth0Logout } = useAuth0();

  const handleLogout = () => {
    logout();
    auth0Logout({ returnTo: window.location.origin });
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 md:flex md:z-0`}
      >
        <Sidebar 
          setIsSidebarOpen={setIsSidebarOpen} 
          isLogoutModalOpen={isLogoutModalOpen}
          setIsLogoutModalOpen={setIsLogoutModalOpen}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          handleLogout();
          setIsSidebarOpen(false);
          setIsLogoutModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
