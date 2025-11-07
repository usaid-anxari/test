import { ExclamationTriangleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useTrialStatus } from './TrialGuard';

const ReadOnlyBanner = () => {
  const { isReadOnly } = useTrialStatus();

  if (!isReadOnly) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Trial Expired - Read Only Mode
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your trial has expired. You can view your data but cannot make changes until you upgrade.
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/billing'}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center"
        >
          <CreditCardIcon className="h-4 w-4 mr-2" />
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default ReadOnlyBanner;