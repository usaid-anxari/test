import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import { EnvelopeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const EmailVerification = () => {
  const { user, logout } = useAuth0();
  const [resendCount, setResendCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_RESENDS = 3;
  const BLOCK_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  const STORAGE_KEY = `email_verification_${user?.email}`;

  useEffect(() => {
    // Check if user is blocked
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const { count, blockedUntil } = JSON.parse(storedData);
      const now = Date.now();
      
      if (blockedUntil && now < blockedUntil) {
        setIsBlocked(true);
        setResendCount(count);
        setTimeLeft(Math.ceil((blockedUntil - now) / 1000));
      } else if (blockedUntil && now >= blockedUntil) {
        // Block period expired, reset
        localStorage.removeItem(STORAGE_KEY);
        setResendCount(0);
        setIsBlocked(false);
      } else {
        setResendCount(count || 0);
      }
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    // Countdown timer
    if (isBlocked && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setResendCount(0);
            localStorage.removeItem(STORAGE_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isBlocked, timeLeft, STORAGE_KEY]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleResendVerification = async () => {
    if (isBlocked) {
      toast.error(`Please wait ${formatTime(timeLeft)} before trying again`);
      return;
    }

    if (resendCount >= MAX_RESENDS) {
      const blockedUntil = Date.now() + BLOCK_DURATION;
      const newData = { count: resendCount, blockedUntil };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      setIsBlocked(true);
      setTimeLeft(Math.ceil(BLOCK_DURATION / 1000));
      
      toast.error(`Maximum resend attempts reached. Please wait 5 hours before trying again.`);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount = resendCount + 1;
      setResendCount(newCount);
      
      // Store updated count
      const newData = { count: newCount };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      toast.success(`Verification email sent! (${newCount}/${MAX_RESENDS} attempts used)`);
      
      if (newCount >= MAX_RESENDS) {
        toast.warning('This was your last attempt. Next resend will be blocked for 5 hours.');
      }
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <EnvelopeIcon className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a verification link to{' '}
            <span className="font-medium text-blue-600">{user?.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Please check your email and click the verification link to access TrueTestify.
            </p>
          </div>

          {isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-semibold text-red-800">Rate Limited</span>
              </div>
              <p className="text-sm text-red-700">
                You've reached the maximum resend attempts. Please wait {formatTime(timeLeft)} before trying again.
              </p>
            </div>
          )}

          <button
            onClick={handleResendVerification}
            disabled={isBlocked || isLoading}
            className={`w-full flex items-center justify-center px-4 py-2 border rounded-lg transition-colors ${
              isBlocked || isLoading
                ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Resend Verification Email
                {resendCount > 0 && ` (${resendCount}/${MAX_RESENDS})`}
              </>
            )}
          </button>

          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={handleResendVerification}
              disabled={isBlocked || isLoading}
              className={`${
                isBlocked || isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:underline'
              }`}
            >
              request a new one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;