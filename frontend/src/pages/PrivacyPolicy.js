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
  EyeIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CogIcon,
} from "@heroicons/react/16/solid";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: DocumentTextIcon },
    { id: "collection", title: "Data Collection", icon: UserIcon },
    { id: "usage", title: "Data Usage", icon: CogIcon },
    { id: "sharing", title: "Data Sharing", icon: GlobeAltIcon },
    { id: "security", title: "Data Security", icon: LockClosedIcon },
    { id: "cookies", title: "Cookies", icon: ShieldCheckIcon },
    { id: "rights", title: "Your Rights", icon: CheckCircleIcon },
    { id: "children", title: "Children's Privacy", icon: ExclamationTriangleIcon },
    { id: "changes", title: "Policy Changes", icon: CalendarIcon },
    { id: "contact", title: "Contact Us", icon: InformationCircleIcon },
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
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information.
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
                    TrueTestify Inc. ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our testimonial 
                    collection and management platform.
                  </p>
                  <p className="mb-4">
                    By using our services, you agree to the collection and use of information in accordance with this policy. 
                    We will not use or share your information with anyone except as described in this Privacy Policy.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                    <p className="text-blue-800 font-semibold">
                      <InformationCircleIcon className="h-5 w-5 inline mr-2" />
                      We are committed to transparency and protecting your privacy rights.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Collection Section */}
              <section id="collection" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <p className="mb-4">
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Create an account or sign up for our services</li>
                    <li>Submit testimonials, reviews, or feedback</li>
                    <li>Contact us for support or inquiries</li>
                    <li>Subscribe to our newsletter or marketing communications</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Types of Personal Information</h3>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Name, email address, and contact information</li>
                    <li>Business information and company details</li>
                    <li>Payment and billing information</li>
                    <li>Testimonials, reviews, and feedback content</li>
                    <li>Profile pictures and media files</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Automatically Collected Information</h3>
                  <p className="mb-4">
                    We automatically collect certain information when you use our services:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, features used)</li>
                    <li>Log data (access times, error logs, performance data)</li>
                    <li>Location information (if you grant permission)</li>
                  </ul>
                </div>
              </section>

              {/* Data Usage Section */}
              <section id="usage" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We use the information we collect for various purposes:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Send you important updates and notifications</li>
                    <li>Respond to your questions and provide customer support</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Detect and prevent fraud, abuse, and security threats</li>
                    <li>Comply with legal obligations and enforce our terms</li>
                  </ul>

                  <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
                    <p className="text-green-800">
                      <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                      We only use your information for legitimate business purposes and will never sell your personal data.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Sharing Section */}
              <section id="sharing" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Information Sharing and Disclosure</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information 
                    in the following limited circumstances:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Service Providers</h3>
                  <p className="mb-4">
                    We may share information with trusted third-party service providers who assist us in operating our platform, 
                    such as:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Payment processors for billing and transactions</li>
                    <li>Cloud hosting providers for data storage</li>
                    <li>Analytics services to understand usage patterns</li>
                    <li>Customer support tools to assist users</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Requirements</h3>
                  <p className="mb-4">
                    We may disclose your information if required by law or in response to:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Valid legal requests from government authorities</li>
                    <li>Court orders or subpoenas</li>
                    <li>Protection of our rights, property, or safety</li>
                    <li>Prevention of fraud or security threats</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Transfers</h3>
                  <p className="mb-4">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of 
                    the business transaction, subject to the same privacy protections.
                  </p>
                </div>
              </section>

              {/* Data Security Section */}
              <section id="security" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Data Security</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and penetration testing</li>
                    <li>Access controls and authentication measures</li>
                    <li>Regular backups and disaster recovery procedures</li>
                    <li>Employee training on data protection practices</li>
                  </ul>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                    <p className="text-yellow-800">
                      <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                      While we strive to protect your information, no method of transmission over the internet is 100% secure. 
                      We cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies Section */}
              <section id="cookies" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Cookies and Tracking Technologies</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We use cookies and similar tracking technologies to enhance your experience:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Types of Cookies</h3>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with your consent)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Managing Cookies</h3>
                  <p className="mb-4">
                    You can control cookies through your browser settings. However, disabling certain cookies may affect 
                    the functionality of our services.
                  </p>
                </div>
              </section>

              {/* Your Rights Section */}
              <section id="rights" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Your Privacy Rights</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    Depending on your location, you may have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                  </ul>

                  <p className="mb-4">
                    To exercise these rights, please contact us at privacy@truetestify.com. We will respond to your request 
                    within 30 days.
                  </p>
                </div>
              </section>

              {/* Children's Privacy Section */}
              <section id="children" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Children's Privacy</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect personal 
                    information from children under 13.
                  </p>
                  <p className="mb-4">
                    If you are a parent or guardian and believe your child has provided us with personal information, 
                    please contact us immediately. We will take steps to remove such information from our records.
                  </p>
                </div>
              </section>

              {/* Policy Changes Section */}
              <section id="changes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Changes to This Privacy Policy</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Posting the new Privacy Policy on this page</li>
                    <li>Sending you an email notification</li>
                    <li>Displaying a notice on our website</li>
                  </ul>
                  <p className="mb-4">
                    Your continued use of our services after any changes constitutes acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="mb-2"><strong>Email:</strong> privacy@truetestify.com</p>
                    <p className="mb-2"><strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345</p>
                    <p className="mb-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Data Protection Officer:</strong> dpo@truetestify.com</p>
                  </div>
                  <p className="mt-4">
                    You can also review our <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">Terms of Service</Link> for additional information about your rights and obligations.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
    </div>
  </div>
);
};

export default PrivacyPolicy;