import React from "react";

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white p-8 border border-gray-200 flex flex-col items-center text-center">
    <div className="text-blue-600 p-4 mb-4 border-2 border-orange-600">
      {React.cloneElement(icon, { className: "h-7 w-7 text-orange-600" })}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default FeatureCard;