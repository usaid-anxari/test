import { useState } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/16/solid";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: "all", name: "All Topics", icon: QuestionMarkCircleIcon },
    { id: "getting-started", name: "Getting Started", icon: BookOpenIcon },
    { id: "account", name: "Account & Billing", icon: DocumentTextIcon },
    { id: "widgets", name: "Widgets & Integration", icon: VideoCameraIcon },
    { id: "testimonials", name: "Testimonials", icon: ChatBubbleLeftRightIcon },
    {
      id: "technical",
      name: "Technical Issues",
      icon: ExclamationTriangleIcon,
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I get started with TrueTestify?",
      answer:
        "Getting started is easy! Simply sign up for an account, choose your plan, and follow our step-by-step setup guide. We'll help you configure your first widget and start collecting testimonials within minutes.",
      category: "getting-started",
      tags: ["setup", "onboarding", "beginner"],
    },
    {
      id: 2,
      question: "What types of testimonials can I collect?",
      answer:
        "TrueTestify supports video, audio, and text testimonials. You can collect reviews through our widget, QR codes, direct links, or by uploading existing testimonials. All formats are automatically optimized for display.",
      category: "testimonials",
      tags: ["video", "audio", "text", "formats"],
    },
    {
      id: 3,
      question: "How do I embed the testimonial widget on my website?",
      answer:
        "Copy the provided JavaScript code from your dashboard and paste it into your website's HTML. The widget will automatically appear and start collecting testimonials. We also provide iframe embed options for easier integration.",
      category: "widgets",
      tags: ["embed", "integration", "website"],
    },
    {
      id: 4,
      question: "Can I customize the appearance of my testimonial widget?",
      answer:
        "Yes! You can customize colors, fonts, layout, and styling to match your brand. Our widget settings allow you to control everything from the widget position to the testimonial display format.",
      category: "widgets",
      tags: ["customization", "branding", "design"],
    },
    {
      id: 5,
      question: "How do I manage and moderate testimonials?",
      answer:
        "Use our moderation dashboard to review, approve, or reject incoming testimonials. You can set up automatic approval rules, filter content, and manage testimonial display order. All testimonials are reviewed before going live.",
      category: "testimonials",
      tags: ["moderation", "approval", "management"],
    },
    {
      id: 6,
      question: "What analytics and insights are available?",
      answer:
        "Track widget views, testimonial submissions, conversion rates, and customer sentiment. Our analytics dashboard provides detailed reports on testimonial performance and their impact on your business.",
      category: "account",
      tags: ["analytics", "insights", "reports"],
    },
    {
      id: 7,
      question: "How do I upgrade or change my subscription plan?",
      answer:
        "You can upgrade or downgrade your plan anytime from your billing dashboard. Changes take effect immediately, and we'll prorate any billing adjustments. Contact our support team if you need assistance with plan changes.",
      category: "account",
      tags: ["billing", "subscription", "upgrade"],
    },
    {
      id: 8,
      question: "Is my data secure and private?",
      answer:
        "Absolutely! We use enterprise-grade encryption and security measures to protect your data. We never share your information with third parties and comply with all major privacy regulations including GDPR and CCPA.",
      category: "technical",
      tags: ["security", "privacy", "data"],
    },
    {
      id: 9,
      question: "Can I export my testimonials to other platforms?",
      answer:
        "Yes! You can export testimonials in various formats including JSON, CSV, and HTML. We also offer direct integrations with popular platforms like WordPress, Shopify, and social media platforms.",
      category: "widgets",
      tags: ["export", "integration", "platforms"],
    },
    {
      id: 10,
      question: "What happens if I exceed my plan's limits?",
      answer:
        "We'll notify you when you're approaching your limits. You can either upgrade your plan or we can work with you to optimize your usage. We never delete your data without warning.",
      category: "account",
      tags: ["limits", "upgrade", "notifications"],
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: ChatBubbleLeftRightIcon,
      availability: "24/7",
      responseTime: "2-5 minutes",
      color: "bg-green-500",
      link: "#chat",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: EnvelopeIcon,
      availability: "24/7",
      responseTime: "2-4 hours",
      color: "bg-blue-500",
      link: "#email",
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: PhoneIcon,
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "Immediate",
      color: "bg-purple-500",
      link: "#phone",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-fuchsia-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Support Center
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get help with TrueTestify. Find answers, contact support, and
              learn how to make the most of our platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Support Channels */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How Can We Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`${channel.color} text-white p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}
                >
                  <channel.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {channel.title}
                </h3>
                <p className="text-gray-600 mb-4">{channel.description}</p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{channel.availability}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Response: {channel.responseTime}</span>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                  Get Help
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Help
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <category.icon className="h-5 w-5" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Help Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Help Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Documentation
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive guides and tutorials
              </p>
              <Link
                to="/docs"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                View Docs →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <VideoCameraIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Video Tutorials
              </h3>
              <p className="text-gray-600 mb-4">Step-by-step video guides</p>
              <Link
                to="services/video-reviews"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Watch Videos →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <LightBulbIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Best Practices
              </h3>
              <p className="text-gray-600 mb-4">Tips for maximizing results</p>
              <Link
                to="/integrations"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Learn More →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Community
              </h3>
              <p className="text-gray-600 mb-4">Connect with other users</p>
              <Link
                to="/contact"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Join Community →
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Still Need Help?
          </h2>
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option>Select a topic</option>
                  <option>Account & Billing</option>
                  <option>Technical Support</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Describe your issue or question in detail..."
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
