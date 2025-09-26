import {
  ArrowRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/16/solid";
import { useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const Pricing = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentReason = searchParams.get('reason');
  const { selectPlan, subscription } = useContext(AuthContext);
  const handleChoose = (plan) => {
    selectPlan(plan.name);
    // navigate("/login");
  };
  
  const handleSelect = (plan)=>{
    selectPlan(plan.name);
  }

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      description: "The essentials for getting started with testimonials.",
      features: [
        "2 video testimonials",
        "1 GB storage",
        "Basic moderation",
        "Embeddable widget",
      ],
      isRecommended: false,
    },
    {
      name: "Pro",
      price: "$49",
      description:
        "Everything you need to grow with a steady stream of reviews.",
      features: [
        "Unlimited video testimonials",
        "10 GB storage",
        "Advanced moderation",
        "Analytics dashboard",
        "Priority support",
      ],
      isRecommended: true,
    },
    {
      name: "Enterprise",
      price: "Contact Us",
      description:
        "Custom solutions for large-scale operations and businesses.",
      features: [
        "Dedicated account manager",
        "Custom storage limits",
        "Advanced security",
        "API access",
      ],
      isRecommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Simple & Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Choose the plan that's right for your business.
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
                to="/signup"
                className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowRightIcon className="h-5 w-5" />
                Get Start
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Payment Status Alert */}
        {paymentReason === 'no_payment' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800">
                Choose Your Plan
              </h3>
            </div>
            <p className="text-blue-700 mb-4">
              You need an active subscription to access TrueTestify's premium features. 
              Choose a plan below to get started with unlimited video testimonials and advanced features.
            </p>
          </div>
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChoose(plan);
              }}
              onClick={()=> handleSelect(plan)}
              aria-selected={subscription?.plan === plan.name}
              className={`relative bg-gray-50 p-8 border ${
                subscription?.plan === plan.name
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : plan.isRecommended
                  ? "border-blue-500"
                  : "border-gray-200"
              }  bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:border-blue-400`}
            >
              {subscription?.plan === plan.name && (
                <span className="absolute top-3 right-3 text-xs font-bold text-white bg-blue-500 px-2 py-1">
                  SELECTED
                </span>
              )}
              {plan.isRecommended && (
                <span className="inline-block px-3 py-1 rounded-e-3xl text-xs font-bold text-white bg-blue-500 tracking-wider mb-4">
                  RECOMMENDED
                </span>
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                <p className="text-5xl font-extrabold text-gray-800 my-4">
                  {plan.price}
                  <span className="text-xl text-gray-500 font-normal">
                    {plan.price !== "Contact Us" && "/mo"}
                  </span>
                </p>
                <p className="text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 text-gray-700">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChoose(plan);
                }}
                disabled={subscription?.plan === plan.name}
                className={`mt-8 w-full px-8 py-3 font-bold tracking-wide transition-colors ${
                  subscription?.plan === plan.name
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : plan.isRecommended
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {plan.price === "Contact Us"
                  ? "Contact Sales"
                  : subscription?.plan === plan.name
                  ? "Selected"
                  : "Get Started"}
              </button> */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChoose(plan);
                }}
                className={`mt-8 w-full px-8 py-3 font-bold tracking-wide transition-colors ${
                  subscription?.plan === plan.name
                    ? "bg-gray-300 text-gray-600 cursor-pointer"
                    : plan.isRecommended
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {plan.price === "Contact Us"
                  ? "Contact Sales"
                  : subscription?.plan === plan.name
                  ? "Go Login Page"
                  : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
           Any issue About Billing & Payment?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Our team can help you Billing & Payments. 
            Get in touch to discuss your problems.
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

export default Pricing;
