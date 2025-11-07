import { useContext, createContext } from 'react';
import useSubscription from '../hooks/useSubscription';

// Trial Context for read-only state
const TrialContext = createContext({
  isTrialExpired: false,
  isReadOnly: false,
});

export const useTrialStatus = () => useContext(TrialContext);

const TrialGuard = ({ children }) => {
  const { subscriptionData } = useSubscription();
  
  const isTrialExpired = subscriptionData?.status === 'trial_expired' || 
                        subscriptionData?.trialDaysLeft <= 0;
  
  const isReadOnly = isTrialExpired && subscriptionData?.tier === 'free';

  return (
    <TrialContext.Provider value={{ isTrialExpired, isReadOnly }}>
      {children}
    </TrialContext.Provider>
  );
};

export default TrialGuard;