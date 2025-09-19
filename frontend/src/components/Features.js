import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

const Features = () => {


  const integrations = [
    {
      id: 1,
      name: "Video Testimonial Capture",
      category: "cms",
      description:
        "Easily collect high-quality video testimonials directly from your customers via a simple, shareable link.",
      status: "available",
      features: [
        "Plugin installation",
        "Widget shortcodes",
        "Theme compatibility",
        "SEO optimization",
      ],
    },
    {
      id: 2,
      name: "Audio & Text Reviews",
      category: "ecommerce",
      description:
        "Offer multiple options for your customers to leave feedback, catering to their preferences and comfort levels.",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "App store integration",
        "Product page widgets",
        "Checkout testimonials",
        "Analytics tracking",
      ],
    },
    {
      id: 3,
      name: "Customizable Widgets",
      category: "ecommerce",
      description:
        "Display your best testimonials beautifully on your website with fully customizable widgets that match your brand.",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "Plugin integration",
        "Product reviews",
        "Email automation",
        "Review moderation",
      ],
    },
    {
      id: 4,
      name: "Seamless Integrations",
      category: "marketing",
      description:
        "Our platform integrates effortlessly with popular tools like WordPress and Shopify to streamline your workflow.",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "CRM integration",
        "Lead scoring",
        "Email campaigns",
        "Contact sync",
      ],
    },
    {
      id: 5,
      name: "Advanced Moderation",
      category: "marketing",
      description:
        "Approve, reject, and manage all your incoming reviews from one centralized and intuitive dashboard.",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "Email templates",
        "Automation workflows",
        "A/B testing",
        "Performance tracking",
      ],
    },
    {
      id: 6,
      name: "In-depth Analytics",
      category: "analytics",
      description:
        "Gain valuable insights into your customer feedback with our comprehensive analytics and reporting tools.",
      status: "available",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "Event tracking",
        "Conversion goals",
        "Custom reports",
        "Real-time data",
      ],
    },
    {
      id: 7,
      name: "Squarespace",
      category: "cms",
      description:
        "Add testimonials to your Squarespace website with our custom code blocks.",
      status: "coming-soon",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "Code blocks",
        "Custom styling",
        "Mobile responsive",
        "SEO friendly",
      ],
    },
    {
      id: 8,
      name: "Wix",
      category: "cms",
      description:
        "Integrate testimonials into your Wix website with our custom app.",
      status: "coming-soon",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      features: [
        "App marketplace",
        "Drag & drop",
        "Custom themes",
        "Multi-language",
      ],
    },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Features
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Video Testimonial Capture,Audio & Text Reviews,Audio & Text
              Reviews,Seamless Integrations,Advanced Moderation andIn-depth
              Analytics.
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
                to="/auth0-signup"
                className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowRightIcon className="h-5 w-5" />
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {integration.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {integration.status === "available" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          integration.status === "available"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {integration.status === "available"
                          ? "Available"
                          : "Coming Soon"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {integration.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Key Features:
                  </h4>
                  <ul className="space-y-1">
                    {integration.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Features & Feedback?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team can help you build custom integrations for your specific
            needs. Get in touch to discuss your requirements.
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

export default Features;
