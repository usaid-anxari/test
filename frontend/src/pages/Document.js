import React from "react";

const Document = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Getting Started
        </h2>
        <p className="text-gray-600 mb-6">
          Welcome to TrueTestify documentation. Here you'll find everything you
          need to get started with collecting and managing customer
          testimonials.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Quick Setup
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li>Sign up for an account and choose your plan</li>
          <li>Configure your widget settings in the dashboard</li>
          <li>Embed the widget on your website</li>
          <li>Start collecting customer reviews</li>
        </ol>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Widget Integration
        </h3>
        <p className="text-gray-600 mb-4">
          Copy the provided JavaScript code from your dashboard and paste it
          into your website's HTML.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          QR Code Collection
        </h3>
        <p className="text-gray-600 mb-4">
          Generate QR codes for offline review collection. Customers can scan
          the code to leave reviews directly.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">Need Help?</h3>
        <p className="text-gray-600">
          If you need additional support, please visit our{" "}
          <a href="/support" className="text-orange-500 hover:text-orange-600">
            Support page
          </a>{" "}
          or contact us directly.
        </p>
      </div>
    </div>
  );
};

export default Document;
