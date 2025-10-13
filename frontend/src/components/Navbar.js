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
  const { loginWithRedirect, logout: auth0Logout } = useAuth0();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth0();

  const navLinks = isAuthenticated
    ? [
        { name: "Dashboard", href: "/dashboard", isPrimary: true },
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
      name: "Floating Widget",
      href: "/widgets/floating",
      description: "Social media-style display",
    },
  ];

  const handleLogout = () => {
    logout();
    auth0Logout({ returnTo: window.location.origin });
  };

  return (
    <>
      <nav className="w-full text-white py-2 md:py-3 fixed top-0 left-0 right-0 z-[100] overflow-visible bg-blue-900 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 relative z-10 overflow-visible">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="./TrueTestify.png" 
              alt="TrueTestify" 
              className="h-10 w-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Desktop links */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="hidden lg:block text-white/90 font-medium hover:text-orange-200 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                {link.name}
              </Link>
            ))}
            <div className="hidden lg:block relative">
              <button
                onMouseEnter={() => setIsServicesDropdownOpen(true)}
                onMouseLeave={() => setIsServicesDropdownOpen(false)}
                className="flex items-center text-white/90 font-medium hover:text-orange-200 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Services
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {isServicesDropdownOpen && (
                <div
                  onMouseEnter={() => setIsServicesDropdownOpen(true)}
                  onMouseLeave={() => setIsServicesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
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
                className="flex items-center text-white/90 font-medium hover:text-orange-200 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Widgets
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {isWidgetsDropdownOpen && (
                <div
                  onMouseEnter={() => setIsWidgetsDropdownOpen(true)}
                  onMouseLeave={() => setIsWidgetsDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
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
              className="hidden lg:block text-white/90 font-medium hover:text-orange-200 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              About
            </Link>
            <Link
              to="/docs"
              className="hidden lg:block text-white/90 font-medium hover:text-orange-200 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              Docs
            </Link>
            {navLinks.map((link) => (
              link.action ? (
                <button
                  key={link.name}
                  onClick={link.action}
                  className={`hidden lg:block px-4 py-2 font-semibold transition-all duration-300 rounded-lg text-sm ${
                    link.isPrimary
                      ? "text-white bg-orange-600 hover:bg-orange-700"
                      : "text-white/90 border border-white/30 hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`hidden lg:block px-4 py-2 font-semibold transition-all duration-300 rounded-lg text-sm ${
                    link.isPrimary
                      ? "text-white bg-orange-600 hover:bg-orange-700"
                      : "text-white/90 border border-white/30 hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden lg:block text-red-300 hover:text-red-100 transition-all duration-300 p-1.5 rounded-lg hover:bg-red-500/20"
                title="Sign Out"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white hover:text-orange-200 transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
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
            <div className="w-[85%] sm:w-[50%] h-full bg-blue-900 text-white p-6 flex flex-col overflow-hidden relative">
              <div className="flex flex-col h-full">
              <div className="flex justify-between items-center pb-6 border-b border-gray-700">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <img 
                    src="/TrueTestify.png" 
                    alt="TrueTestify" 
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white transition-all duration-300 p-2 rounded-xl hover:bg-white/10"
                >
                  <XMarkIcon className="h-8 w-8" />
                </button>
              </div>
              <nav className="flex-1 mt-8 space-y-6 overflow-y-auto custom-scrollbar">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-2xl font-bold text-white/90 hover:text-orange-200 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/10"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-white/20 pt-6">
                  <div className="text-xl font-bold text-orange-200 mb-4 px-4">
                    Services
                  </div>
                  {servicesLinks.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg text-white/80 hover:text-orange-200 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/10 mb-2"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-white/20 pt-6">
                  <div className="text-xl font-bold text-orange-200 mb-4 px-4">
                    Widgets
                  </div>
                  {widgetsLinks.map((widget) => (
                    <Link
                      key={widget.name}
                      to={widget.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg text-white/80 hover:text-orange-200 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/10 mb-2"
                    >
                      {widget.name}
                    </Link>
                  ))}
                </div>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl font-bold text-white/90 hover:text-orange-200 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/10"
                >
                  About
                </Link>
                <Link
                  to="/docs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl font-bold text-white/90 hover:text-orange-200 transition-all duration-300 py-2 px-4 rounded-xl hover:bg-white/10"
                >
                  Docs
                </Link>
                {navLinks.map((link) => (
                  link.action ? (
                    <button
                      key={link.name}
                      onClick={link.action}
                      className={`block text-xl font-bold transition-all duration-300 py-3 px-4 rounded-xl ${
                        link.isPrimary
                          ? "text-white bg-orange-600 hover:bg-orange-700 shadow-lg"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block text-xl font-bold transition-all duration-300 py-3 px-4 rounded-xl ${
                        link.isPrimary
                          ? "text-white bg-orange-600 hover:bg-orange-700 shadow-lg"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-xl font-bold text-red-300 hover:text-red-100 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                )}
              </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
