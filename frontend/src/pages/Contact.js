import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

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
    description: "Send us a detailed message from our support team",
    icon: EnvelopeIcon,
    availability: "24/7",
    responseTime: "2-4 hours",
    color: "bg-blue-500",
    link: "#email",
  },
  {
    title: "Address",
    description: "123 Business Street, Suite 100, City, State 12345",
    icon: MapPinIcon,
    availability: "Mon-Fri, 8AM-10AM EST",
    responseTime: "Appointment",
    color: "bg-yellow-500",
    link: "#address",
  },
  {
    title: "Phone Support",
    description: "Speak directly with our  support team",
    icon: PhoneIcon,
    availability: "Mon-Fri, 9AM-6PM EST",
    responseTime: "Immediate",
    color: "bg-red-500",
    link: "#phone",
  },
];

const Contact = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Contact Form & Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Send Us a Message
          </h2>
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
              />
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
        {/* Map or Illustration */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col items-center justify-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Our Office
          </h3>
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
            <iframe
              title="TrueTestify Office Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C77.5946%2C12.9716&amp;layer=mapnik"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="text-gray-600 text-center">
            <div className="mb-2">
              <strong>Address:</strong> 123 Business Street, Suite 100, City,
              State 12345
            </div>
            <div className="mb-2">
              <strong>Email:</strong> support@truetestify.com
            </div>
            <div>
              <strong>Phone:</strong> +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Contact Options */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {supportChannels.map((channel, index) => (
        <div
          key={index}
          className="bg-white rounded-xl mb-5 shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
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
        </div>
      ))}
    </div>

    {/* CTA Section */}
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded p-8 md:p-12 text-center text-white max-w-4xl mx-auto mb-12">
      <h2 className="text-4xl font-extrabold mb-4">Ready to Connect?</h2>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
        Our team is here to answer your questions and help you get the most out
        of TrueTestify. Reach out today!
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Link
          to="/support"
          className="px-8 py-4 text-blue-600 bg-white font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          Visit Support Center
        </Link>
        <Link
          to="/signup"
          className="px-8 py-4 text-white border-2 border-white font-bold text-lg rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
        >
          Start Free Trial
        </Link>
      </div>
    </div>
  </div>
);

export default Contact;
