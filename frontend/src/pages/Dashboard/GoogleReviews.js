import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowDownIcon,
  LinkIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/16/solid';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../service/axiosInstanse';
import { API_PATHS } from '../../service/apiPaths';
import toast from 'react-hot-toast';
import { MOCK_GOOGLE_REVIEWS } from '../../assets/mockData';

const GoogleReviews = () => {
  const { user } = useContext(AuthContext);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch connection status and reviews on component mount
  useEffect(() => {
    // Use mock data for presentation
    setConnectionStatus({ connected: true, connectedAt: new Date().toISOString(), locationId: 'demo-location-123' });
    setGoogleReviews(MOCK_GOOGLE_REVIEWS);
    setLoading(false);
  }, []);

  const fetchConnectionStatus = async () => {
    // Mock implementation for presentation
    setConnectionStatus({ connected: true, connectedAt: new Date().toISOString(), locationId: 'demo-location-123' });
    setLoading(false);
  };

  const fetchGoogleReviews = async (showRefreshToast = false) => {
    // Mock implementation for presentation
    if (showRefreshToast) setRefreshing(true);
    
    // Simulate API delay
    setTimeout(() => {
      setGoogleReviews(MOCK_GOOGLE_REVIEWS);
      if (showRefreshToast) toast.success('Google reviews refreshed!');
      if (showRefreshToast) setRefreshing(false);
    }, 1000);
  };

  const handleConnect = () => {
    // Redirect to Google OAuth
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.REACT_APP_GOOGLE_REDIRECT_URI}&` +
      `scope=https://www.googleapis.com/auth/business.manage&` +
      `response_type=code&` +
      `access_type=offline`;
    
    window.location.href = googleAuthUrl;
  };

  const handleImportReviews = async () => {
    setImporting(true);
    
    // Mock implementation for presentation
    setTimeout(() => {
      setGoogleReviews(MOCK_GOOGLE_REVIEWS);
      toast.success(`Imported ${MOCK_GOOGLE_REVIEWS.length} Google reviews!`);
      setImporting(false);
    }, 2000);
  };

  const handleDisconnect = async () => {
    // Mock implementation for presentation
    toast.success('Google Business Profile disconnected');
    setConnectionStatus({ connected: false });
    setGoogleReviews([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Google Reviews Integration
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Import and display your Google Business reviews alongside TrueTestify reviews
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => fetchGoogleReviews(true)}
                disabled={refreshing}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                title="Refresh Google reviews"
              >
                <ArrowPathIcon className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {connectionStatus?.connected && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-white font-medium"
                >
                  Submit Google Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${connectionStatus?.connected ? 'bg-green-50' : 'bg-red-50'}`}>
                {connectionStatus?.connected ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Google Business Profile
                </h2>
                <p className="text-gray-500">
                  {connectionStatus?.connected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
            
            {connectionStatus?.connected ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleImportReviews}
                  disabled={importing}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {importing ? (
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                  )}
                  {importing ? 'Importing...' : 'Import Reviews'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {connecting ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-5 h-5 mr-2" />
                )}
                {connecting ? 'Connecting...' : 'Connect Google Business'}
              </button>
            )}
          </div>

          {connectionStatus?.connected && connectionStatus.connectedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Connected on {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                {connectionStatus.locationId && ` • Location ID: ${connectionStatus.locationId}`}
              </p>
            </div>
          )}
        </motion.div>

        {/* Google Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Imported Google Reviews ({googleReviews.length})
            </h2>
            {googleReviews.length > 0 && (
              <button
                onClick={() => fetchGoogleReviews(true)}
                disabled={refreshing}
                className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          {googleReviews.length > 0 ? (
            <div className="space-y-4">
              {googleReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{review.reviewerName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      Google
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.bodyText}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CloudArrowDownIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Google Reviews Yet</h3>
              <p className="text-gray-500 mb-6">
                {connectionStatus?.connected
                  ? 'Click "Import Reviews" to fetch your Google Business reviews'
                  : 'Connect your Google Business Profile to import reviews'}
              </p>
              {!connectionStatus?.connected && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="text-left">
                      <p className="text-orange-700 font-medium text-sm">Setup Required</p>
                      <p className="text-orange-600 text-sm mt-1">
                        Connect your Google Business Profile to automatically import and display your existing reviews.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4">How Google Reviews Integration Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-2">1</div>
              <div className="text-sm opacity-90">Connect your Google Business Profile with one click</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-2">2</div>
              <div className="text-sm opacity-90">Import existing reviews automatically</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-2">3</div>
              <div className="text-sm opacity-90">Display alongside TrueTestify reviews on your public page</div>
            </div>
          </div>
        </motion.div>

        {/* Submit Google Review Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit Review to Google
              </h3>
              <p className="text-gray-600 mb-6">
                This will redirect you to your Google Business Profile where customers can leave reviews directly.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${connectionStatus?.placeId || 'YOUR_PLACE_ID'}`;
                    window.open(googleReviewUrl, '_blank');
                    setShowSubmitModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Google Reviews
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleReviews;