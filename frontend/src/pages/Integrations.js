import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GlobeAltIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  DocumentTextIcon,
  CpuChipIcon,
} from "@heroicons/react/16/solid";

const Integrations = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Integrations" },
    { id: "cms", name: "CMS Platforms" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "marketing", name: "Marketing Tools" },
    { id: "analytics", name: "Analytics" },
  ];

  const integrations = [
    {
      id: 1,
      name: "WordPress",
      category: "cms",
      description: "Seamlessly integrate testimonials into your WordPress site with our official plugin.",
      status: "available",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop",
      features: ["Plugin installation", "Widget shortcodes", "Theme compatibility", "SEO optimization"]
    },
    {
      id: 2,
      name: "Shopify",
      category: "ecommerce",
      description: "Display customer testimonials on your Shopify store to boost conversions.",
      status: "available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["App store integration", "Product page widgets", "Checkout testimonials", "Analytics tracking"]
    },
    {
      id: 3,
      name: "WooCommerce",
      category: "ecommerce",
      description: "Enhance your WooCommerce store with customer testimonials and reviews.",
      status: "available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["Plugin integration", "Product reviews", "Email automation", "Review moderation"]
    },
    {
      id: 4,
      name: "HubSpot",
      category: "marketing",
      description: "Connect testimonials with your HubSpot CRM for better lead management.",
      status: "available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["CRM integration", "Lead scoring", "Email campaigns", "Contact sync"]
    },
    {
      id: 5,
      name: "Mailchimp",
      category: "marketing",
      description: "Include testimonials in your Mailchimp email campaigns for better engagement.",
      status: "available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["Email templates", "Automation workflows", "A/B testing", "Performance tracking"]
    },
    {
      id: 6,
      name: "Google Analytics",
      category: "analytics",
      description: "Track testimonial performance and conversion impact with Google Analytics.",
      status: "available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["Event tracking", "Conversion goals", "Custom reports", "Real-time data"]
    },
    {
      id: 7,
      name: "Squarespace",
      category: "cms",
      description: "Add testimonials to your Squarespace website with our custom code blocks.",
      status: "coming-soon",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["Code blocks", "Custom styling", "Mobile responsive", "SEO friendly"]
    },
    {
      id: 8,
      name: "Wix",
      category: "cms",
      description: "Integrate testimonials into your Wix website with our custom app.",
      status: "coming-soon",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: ["App marketplace", "Drag & drop", "Custom themes", "Multi-language"]
    }
  ];

  const filteredIntegrations = integrations.filter(integration => 
    activeCategory === "all" || integration.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Integrations
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect TrueTestify with your favorite platforms and tools. Seamless integration for maximum impact.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/docs"
                className="px-8 py-4 text-blue-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                View Documentation
              </Link>
              <Link
                to="/support"
                className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={integration.image}
                    alt={integration.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center gap-2">
                      {integration.status === "available" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                      <span className={`text-sm font-medium ${
                        integration.status === "available" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {integration.status === "available" ? "Available" : "Coming Soon"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{integration.description}</p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  {integration.status === "available" ? "Get Started" : "Notify Me"}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* API Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="text-center mb-12">
            <CpuChipIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">API & Custom Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build custom integrations with our powerful REST API. Access testimonials, manage widgets, and sync data with your own applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CodeBracketIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">REST API</h3>
              <p className="text-gray-600 mb-4">Comprehensive API with full CRUD operations</p>
              <Link to="/docs" className="text-blue-600 font-semibold hover:text-blue-700">
                View API Docs →
              </Link>
            </div>
            <div className="text-center">
              <GlobeAltIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Webhooks</h3>
              <p className="text-gray-600 mb-4">Real-time notifications for testimonial events</p>
              <Link to="/docs" className="text-blue-600 font-semibold hover:text-blue-700">
                Configure Webhooks →
              </Link>
            </div>
            <div className="text-center">
              <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">SDKs</h3>
              <p className="text-gray-600 mb-4">Official SDKs for popular programming languages</p>
              <Link to="/docs" className="text-blue-600 font-semibold hover:text-blue-700">
                Download SDKs →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Integration?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team can help you build custom integrations for your specific needs. Get in touch to discuss your requirements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/support"
              className="px-8 py-4 text-blue-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Contact Support
            </Link>
            <Link
              to="/docs"
              className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              View Documentation
            </Link>
          </div>
        </div>
    </div>
  </div>
);
};

export default Integrations;