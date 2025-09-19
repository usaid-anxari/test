import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCardIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

const PaymentPrompt = ({ onDismiss }) => {
  const { hasAccess, loading } = useFeatureAccess('unlimited_reviews');

  if (loading || hasAccess) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-2">
              <StarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Ready to Unlock Premium Features?</h3>
          </div>
          
          <p className="text-orange-100 mb-4">
            You're using TrueTestify's free plan. Upgrade to collect unlimited reviews and access advanced features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-orange-200" />
              <span className="text-sm">Unlimited video reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-orange-200" />
              <span className="text-sm">Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-orange-200" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard/billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
            >
              <CreditCardIcon className="w-5 h-5" />
              Upgrade Now
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-center"
            >
              View Pricing
            </Link>
            <button
              onClick={onDismiss}
              className="px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-white/70 hover:text-white ml-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PaymentPrompt;