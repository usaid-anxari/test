import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { PlayIcon, MicrophoneIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to TrueTestify!",
      description: "Let's get you set up to start collecting amazing customer testimonials.",
      icon: CheckCircleIcon,
      color: "text-green-500"
    },
    {
      title: "Setup Your Business Profile",
      description: "Create your business profile to get your custom review collection page.",
      icon: CheckCircleIcon,
      color: "text-blue-500"
    },
    {
      title: "Learn the Basics",
      description: "Discover how to collect video, audio, and text reviews from your customers.",
      icon: PlayIcon,
      color: "text-orange-500"
    }
  ];

  const features = [
    {
      icon: PlayIcon,
      title: "Video Reviews",
      description: "Collect authentic video testimonials that build trust"
    },
    {
      icon: MicrophoneIcon,
      title: "Audio Reviews", 
      description: "Quick voice testimonials for busy customers"
    },
    {
      icon: DocumentTextIcon,
      title: "Text Reviews",
      description: "Traditional written reviews as a fallback option"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/create-business');
    }
  };

  const handleSkip = () => {
    navigate('/create-business');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip Tutorial
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            {React.createElement(steps[currentStep].icon, {
              className: `w-8 h-8 ${steps[currentStep].color}`
            })}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {steps[currentStep].description}
          </p>

          {/* Features showcase on step 3 */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;