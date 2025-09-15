import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/16/solid";

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: DocumentTextIcon },
    { id: "services", title: "Services", icon: ShieldCheckIcon },
    { id: "accounts", title: "Accounts", icon: UserIcon },
    { id: "usage", title: "Usage Terms", icon: CheckCircleIcon },
    { id: "prohibited", title: "Prohibited Uses", icon: XCircleIcon },
    { id: "intellectual", title: "Intellectual Property", icon: InformationCircleIcon },
    { id: "privacy", title: "Privacy", icon: ShieldCheckIcon },
    { id: "termination", title: "Termination", icon: ExclamationTriangleIcon },
    { id: "liability", title: "Liability", icon: ExclamationTriangleIcon },
    { id: "changes", title: "Changes", icon: CalendarIcon },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Please read these terms carefully before using TrueTestify services.
            </p>
            <div className="flex items-center justify-center gap-4 text-blue-100">
              <CalendarIcon className="h-5 w-5" />
              <span>Last updated: March 15, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        activeSection === section.id
                          ? "bg-blue-100 text-blue-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              {/* Overview Section */}
              <section id="overview" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Overview</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    These Terms of Service ("Terms") govern your use of TrueTestify's website and services 
                    (collectively, the "Service") operated by TrueTestify Inc. ("we," "us," or "our").
                  </p>
                  <p className="mb-4">
                    By accessing or using the Service, you agree to be bound by these Terms. If you disagree 
                    with any part of these terms, then you may not access the Service.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                    <p className="text-blue-800 font-semibold">
                      <InformationCircleIcon className="h-5 w-5 inline mr-2" />
                      Important: These terms constitute a legally binding agreement between you and TrueTestify.
                    </p>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section id="services" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Services</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    TrueTestify provides a platform for collecting, managing, and displaying customer testimonials 
                    and reviews. Our services include:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Testimonial collection tools (video, audio, text)</li>
                    <li>Review moderation and management</li>
                    <li>Widget and embed functionality</li>
                    <li>Analytics and reporting</li>
                    <li>QR code generation for offline collection</li>
                    <li>Integration with third-party platforms</li>
                  </ul>
                  <p className="mb-4">
                    We reserve the right to modify, suspend, or discontinue any part of our services at any time 
                    with reasonable notice.
                  </p>
                </div>
              </section>

              {/* Accounts Section */}
              <section id="accounts" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Accounts</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    To use certain features of our Service, you must create an account. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and complete information</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                    <p className="text-yellow-800">
                      <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                      You may not share your account credentials with others or allow others to access your account.
                    </p>
                  </div>
                </div>
              </section>

              {/* Usage Terms Section */}
              <section id="usage" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Acceptable Use</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    You agree to use our Service only for lawful purposes and in accordance with these Terms. 
                    You may use our Service to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Collect and display legitimate customer testimonials</li>
                    <li>Manage your business reviews and feedback</li>
                    <li>Integrate testimonials into your website or marketing materials</li>
                    <li>Analyze customer feedback and sentiment</li>
                  </ul>
                  <p className="mb-4">
                    All testimonials must be authentic and obtained with proper consent from customers.
                  </p>
                </div>
              </section>

              {/* Prohibited Uses Section */}
              <section id="prohibited" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Prohibited Uses</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    You may not use our Service to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Post false, misleading, or fraudulent testimonials</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Harass, abuse, or harm others</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use automated tools to scrape or collect data</li>
                    <li>Interfere with the proper functioning of our Service</li>
                  </ul>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                    <p className="text-red-800 font-semibold">
                      <XCircleIcon className="h-5 w-5 inline mr-2" />
                      Violation of these terms may result in immediate account termination.
                    </p>
                  </div>
                </div>
              </section>

              {/* Intellectual Property Section */}
              <section id="intellectual" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    The Service and its original content, features, and functionality are owned by TrueTestify 
                    and are protected by international copyright, trademark, patent, trade secret, and other 
                    intellectual property laws.
                  </p>
                  <p className="mb-4">
                    You retain ownership of content you submit to our Service, but you grant us a worldwide, 
                    non-exclusive, royalty-free license to use, reproduce, and display such content in connection 
                    with providing our Service.
                  </p>
                </div>
              </section>

              {/* Privacy Section */}
              <section id="privacy" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Privacy</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    Your privacy is important to us. Please review our 
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold mx-1">
                      Privacy Policy
                    </Link>
                    , which also governs your use of the Service, to understand our practices.
                  </p>
                  <p className="mb-4">
                    By using our Service, you consent to the collection and use of information in accordance 
                    with our Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Termination Section */}
              <section id="termination" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Termination</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We may terminate or suspend your account and bar access to the Service immediately, 
                    without prior notice or liability, under our sole discretion, for any reason whatsoever, 
                    including without limitation if you breach the Terms.
                  </p>
                  <p className="mb-4">
                    Upon termination, your right to use the Service will cease immediately. If you wish to 
                    terminate your account, you may simply discontinue using the Service.
                  </p>
                </div>
              </section>

              {/* Liability Section */}
              <section id="liability" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Limitation of Liability</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    In no event shall TrueTestify, nor its directors, employees, partners, agents, suppliers, 
                    or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                    damages, including without limitation, loss of profits, data, use, goodwill, or other 
                    intangible losses, resulting from your use of the Service.
                  </p>
                  <p className="mb-4">
                    Our total liability to you for any claims arising from these Terms or your use of the 
                    Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                  </p>
                </div>
              </section>

              {/* Changes Section */}
              <section id="changes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Changes to Terms</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                    If a revision is material, we will try to provide at least 30 days notice prior to any new 
                    terms taking effect.
                  </p>
                  <p className="mb-4">
                    What constitutes a material change will be determined at our sole discretion. By continuing 
                    to access or use our Service after any revisions become effective, you agree to be bound by 
                    the revised terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="mb-2"><strong>Email:</strong> legal@truetestify.com</p>
                    <p className="mb-2"><strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </div>
  </div>
);
};

export default TermsOfService;