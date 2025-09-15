import {
  DocumentTextIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-12 border-t border-gray-800 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-8 text-left">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight mb-4">
              TrueTestify
            </h3>
            <p className="text-sm text-gray-400">
              The ultimate platform for collecting, moderating, and showcasing
              authentic customer testimonials.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-200 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/features"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/integrations"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-200 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/blog"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-200 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <ul className="flex justify-end-safe gap-2 items-center max-w-7xl mx-auto px-4">
          <li>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Socal Media
            </Link>
          </li>
          <li>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <GlobeAltIcon className="h-5 w-5" />
            </Link>
          </li>
        </ul>

        <hr className="my-8 border-gray-700" />
        <div className="text-center text-sm text-gray-500">
          © 2025 TrueTestify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
