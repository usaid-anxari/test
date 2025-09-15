import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/16/solid";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Site Navbar - Hidden on mobile dashboard */}

      <div className="flex flex-1">
        {/* Sidebar - Always visible on mobile, collapsible on desktop */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out md:w-64 z-30 flex-shrink-0 md:flex`}
        >
          <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        {/* Mobile Sidebar Toggle Button - Only show when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="md:hidden fixed top-4 left-4 z-40">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-blue-600 text-white p-2 rounded-lg shadow-lg"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-grow p-4 md:p-8 overflow-y-auto w-full pt-16 md:pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
