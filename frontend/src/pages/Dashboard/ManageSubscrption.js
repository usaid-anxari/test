import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../context/AuthContext"
import Billing from "../Billing";

const ManageSubscription = () => {
  const navigate = useNavigate();

  const subscriptionData = {
    plan: 'Pro Plan',
    storageUsed: 3.5, // in GB
    storageLimit: 10, // in GB
    nextBillDate: 'Oct 25, 2025',
  };

  const storagePercentage = (subscriptionData.storageUsed / subscriptionData.storageLimit) * 100;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Subscription</h2>
      <div className="bg-white p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Current Plan: <span className="font-bold text-orange-500">{subscriptionData.plan}</span></h3>
        <p className="text-gray-600 mb-2">Next Billing Date: {subscriptionData.nextBillDate}</p>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Storage Usage</span>
            <span>{subscriptionData.storageUsed} / {subscriptionData.storageLimit} GB</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 transition-all duration-500"
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-orange-500 text-white font-bold tracking-wide transition-colors hover:bg-orange-600"
          >
            Upgrade or Change Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;