import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/16/solid";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isWidgetsDropdownOpen, setIsWidgetsDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const navLinks = user
    ? user && [
        { name: "Dashboard", href: "/dashboard/moderation", isPrimary: true },
      ]
    : [
        {
          name: "Log In",
          href: "#",
          isPrimary: false,
          action: () => loginWithRedirect({ screen_hint: "login" }),
        },
        {
          name: "Get Started",
          href: "#",
          isPrimary: true,
          action: () => loginWithRedirect({ screen_hint: "signup" }),
        },
      ];

  const mainNavLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const servicesLinks = [
    {
      name: "Video Reviews",
      href: "/services/video-reviews",
      description: "Collect authentic video testimonials",
    },
    {
      name: "Audio Reviews",
      href: "/services/audio-reviews",
      description: "Voice testimonials for better engagement",
    },
    {
      name: "Text Reviews",
      href: "/services/text-reviews",
      description: "Written testimonials with moderation",
    },
    {
      name: "QR Code Collection",
      href: "/services/qr-collection",
      description: "Offline review collection",
    },
  ];

  const widgetsLinks = [
    {
      name: "Carousel Widget",
      href: "/widgets/carousel",
      description: "Sliding testimonials with autoplay",
    },
    {
      name: "Grid Widget",
      href: "/widgets/grid",
      description: "Clean grid layout for multiple reviews",
    },
    {
      name: "Spotlight Widget",
      href: "/widgets/spotlight",
      description: "Feature your best testimonials",
    },
    {
      name: "Wall Widget",
      href: "/widgets/wall",
      description: "Social media-style display",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="w-full bg-gray-900 text-white py-4 md:py-5 border-t border-gray-800 z-30">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-gray-200 tracking-tight">
              TrueTestify
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
              Beta
            </span>
          </Link>
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Desktop links */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="hidden lg:block text-gray-100 font-medium hover:text-orange-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="hidden lg:block relative">
              <button
                onMouseEnter={() => setIsServicesDropdownOpen(true)}
                onMouseLeave={() => setIsServicesDropdownOpen(false)}
                className="flex items-center text-gray-100 font-medium hover:text-orange-500 transition-colors"
              >
                Services
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {isServicesDropdownOpen && (
                <div
                  onMouseEnter={() => setIsServicesDropdownOpen(true)}
                  onMouseLeave={() => setIsServicesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                >
                  {servicesLinks.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      className="block px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        {service.description}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:block relative">
              <button
                onMouseEnter={() => setIsWidgetsDropdownOpen(true)}
                onMouseLeave={() => setIsWidgetsDropdownOpen(false)}
                className="flex items-center text-gray-100 font-medium hover:text-orange-500 transition-colors"
              >
                Widgets
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {isWidgetsDropdownOpen && (
                <div
                  onMouseEnter={() => setIsWidgetsDropdownOpen(true)}
                  onMouseLeave={() => setIsWidgetsDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                >
                  {widgetsLinks.map((widget) => (
                    <Link
                      key={widget.name}
                      to={widget.href}
                      className="block px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{widget.name}</div>
                      <div className="text-sm text-gray-600">
                        {widget.description}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/about"
              className="hidden lg:block text-gray-100 font-medium hover:text-orange-500 transition-colors"
            >
              About
            </Link>
            <Link
              to="/docs"
              className="hidden lg:block text-gray-100 font-medium hover:text-orange-500 transition-colors"
            >
              Docs
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                onClick={link.action}
                className={`hidden lg:block px-6 py-2 font-bold transition-colors ${
                  link.isPrimary
                    ? "text-white bg-orange-500 hover:bg-orange-600"
                    : "text-gray-100 border border-gray-300 hover:bg-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden lg:block text-red-500 hover:text-red-700 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              <Bars3Icon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 w-full h-full bg-opacity-70 z-50 flex justify-end"
          >
            <div className="w-[85%] sm:w-[50%] h-full bg-gray-900 text-white p-6 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center pb-6 border-b border-gray-700">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-extrabold"
                >
                  TrueTestify
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-8 w-8" />
                </button>
              </div>
              <nav className="flex-1 mt-8 space-y-6 overflow-y-auto custom-scrollbar">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.action}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-3xl font-bold text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-gray-700 pt-6">
                  <div className="text-2xl font-bold text-gray-400 mb-4">
                    Services
                  </div>
                  {servicesLinks.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xl text-gray-300 hover:text-orange-500 transition-colors mb-3"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-6">
                  <div className="text-2xl font-bold text-gray-400 mb-4">
                    Widgets
                  </div>
                  {widgetsLinks.map((widget) => (
                    <Link
                      key={widget.name}
                      to={widget.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xl text-gray-300 hover:text-orange-500 transition-colors mb-3"
                    >
                      {widget.name}
                    </Link>
                  ))}
                </div>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-3xl font-bold text-gray-300 hover:text-orange-500 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/docs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-3xl font-bold text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Docs
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    onClick={link.action}
                    className={`block text-3xl font-bold transition-colors ${
                      link.isPrimary
                        ? "text-orange-500 hover:text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-3xl font-bold text-red-500 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
