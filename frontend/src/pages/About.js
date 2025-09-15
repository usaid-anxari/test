import { Link } from "react-router-dom";
import {
  UsersIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/16/solid";

const About = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former VP of Product at TrustPilot. 15+ years in customer experience and SaaS.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Ex-Google engineer. Expert in scalable systems and real-time video processing.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "Product leader with experience at HubSpot and Intercom. Customer-obsessed.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "David Kim",
      role: "Head of Design",
      bio: "Design veteran from Airbnb and Stripe. Focused on user experience and conversion.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const values = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: "Customer First",
      description:
        "Every decision we make is driven by what's best for our customers and their success.",
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: "Trust & Security",
      description:
        "We prioritize the security and privacy of your data with enterprise-grade protection.",
    },
    {
      icon: <LightBulbIcon className="h-8 w-8" />,
      title: "Innovation",
      description:
        "Constantly pushing boundaries to deliver cutting-edge testimonial solutions.",
    },
    {
      icon: <UsersIcon className="h-8 w-8" />,
      title: "Community",
      description:
        "Building a supportive community of businesses helping each other succeed.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description:
        "TrueTestify was born from a simple idea: make authentic testimonials accessible to every business.",
    },
    {
      year: "2021",
      title: "First 1,000 Customers",
      description:
        "Reached our first major milestone with businesses trusting us with their testimonials.",
    },
    {
      year: "2022",
      title: "Video & Audio Launch",
      description:
        "Expanded beyond text to support video and audio testimonials.",
    },
    {
      year: "2023",
      title: "10K+ Active Users",
      description: "Grew to serve over 10,000 businesses worldwide.",
    },
    {
      year: "2024",
      title: "Enterprise Launch",
      description:
        "Launched enterprise features and advanced analytics for larger organizations.",
    },
  ];

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-16 md:p-20 border-b border-gray-200">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg
            className="absolute -top-24 -left-24 w-96 h-96 opacity-20 text-blue-300"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M41.9,-64.5C54.8,-55.8,66.1,-46.5,73.1,-34.7C80.1,-22.8,82.9,-8.5,80.9,4.8C79,18.2,72.4,30.7,64.1,42.3C55.9,53.9,45.9,64.6,33.7,70.6C21.5,76.7,7.2,78,-5.8,76.3C-18.8,74.7,-30.5,70.1,-42,63.6C-53.4,57.1,-64.6,48.7,-71.9,37.5C-79.1,26.3,-82.4,12.1,-83.1,-2.2C-83.8,-16.5,-81.8,-33,-73.9,-45C-66.1,-56.9,-52.4,-64.4,-38.3,-72.1C-24.2,-79.8,-12.1,-87.6,0.1,-87.8C12.3,-88,24.7,-80.6,41.9,-64.5Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            About <span className="text-blue-600">TrueTestify</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to help businesses build trust through authentic
            customer testimonials. Our platform makes it easy to collect,
            moderate, and display powerful reviews that drive sales.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-12 py-5 text-white bg-blue-600 font-bold text-lg tracking-wide transition-all hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-12 py-5 text-blue-600 font-bold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="px-6 py-16 md:p-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Our Mission
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Empowering Businesses Through Authentic Customer Stories
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                In today's digital world, trust is everything. Customers want to
                hear from real people who have used your products or services.
                That's why we built TrueTestify - to make it effortless for
                businesses to collect and showcase authentic customer
                testimonials.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that every business, regardless of size, deserves
                access to powerful testimonial tools that can help them build
                trust, increase conversions, and grow their customer base.
              </p>
              <div className="flex items-center gap-4">
                <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">
                  Join 10,000+ businesses already using TrueTestify
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    2M+
                  </div>
                  <div className="text-gray-600">Reviews Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    98%
                  </div>
                  <div className="text-gray-600">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    24/7
                  </div>
                  <div className="text-gray-600">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    150+
                  </div>
                  <div className="text-gray-600">Countries Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="px-6 py-16 md:p-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center"
              >
                <div className="bg-blue-100 text-blue-600 p-4 mb-6 rounded-full mx-auto w-16 h-16 flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="px-6 py-16 md:p-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We're a passionate team of product experts, engineers, and designers
            dedicated to helping businesses succeed through authentic
            testimonials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="px-6 py-16 md:p-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16 tracking-tight">
            Our Journey
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                    }`}
                  >
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-16 md:p-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of businesses already using TrueTestify to build
            trust and drive sales through authentic customer testimonials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="px-12 py-5 text-blue-600 bg-white font-bold text-lg tracking-wide transition-all hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-12 py-5 text-white font-bold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
