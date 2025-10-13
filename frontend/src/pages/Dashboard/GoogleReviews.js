import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  CloudArrowDownIcon,
  LinkIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/16/solid";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import toast from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";

const GoogleReviews = () => {
  const { user } = useAuth0();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState(null);
  console.log(connectionStatus);

  // Fetch connection status and reviews on component mount
  useEffect(() => {
    if (user) {
      fetchConnectionStatus();
      fetchGoogleReviews();
    }
  }, [user]);

  // Fetch business profiles when connected or needs location selection
  useEffect(() => {
    if (connectionStatus?.connected) {
      fetchBusinessProfiles();
    }
  }, [connectionStatus?.connected]);

  // Real API call to fetch connection status
  const fetchConnectionStatus = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get(
        API_PATHS.GOOGLE.CONNECTION_STATUS
      );
      console.log(response.data);
      
      setConnectionStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
      setError("Failed to load connection status");
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  // Real API call to fetch Google reviews
  const fetchGoogleReviews = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      setError(null);

      const response = await axiosInstance.get(API_PATHS.GOOGLE.FETCH_REVIEWS);
      setGoogleReviews(response.data.reviews || []);

      if (showRefreshToast) {
        toast.success("Google reviews refreshed!");
      }
    } catch (error) {
      console.error("Failed to fetch Google reviews:", error);
      if (showRefreshToast) {
        toast.error("Failed to refresh reviews");
      }
      setGoogleReviews([]);
    } finally {
      if (showRefreshToast) setRefreshing(false);
    }
  };

  // Real OAuth connection flow
  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      // Get OAuth URL from backend
      const response = await axiosInstance.get(
        API_PATHS.GOOGLE.CONNECT_GOOGLE_ACCOUNT
      );
      const authUrl = response.data.authUrl;

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        "google-oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      // Poll for popup closure and connection completion
      const pollInterval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(pollInterval);
          setConnecting(false);

          // Wait a moment for backend processing
          setTimeout(async () => {
            try {
              // Check connection progress
              const progressResponse = await axiosInstance.get(
                API_PATHS.GOOGLE.CONNECTION_PROGRESS
              );
              if (progressResponse.data.isConnected) {
                toast.success(
                  "Google Business Profile connected successfully!"
                );
                await fetchConnectionStatus();
                await fetchGoogleReviews();
              } else if (progressResponse.data.isProcessing) {
                toast.loading("Connection still processing...", {
                  duration: 3000,
                });
                // Poll again after a delay
                setTimeout(() => fetchConnectionStatus(), 3000);
              } else {
                toast.error("Connection failed. Please try again.");
              }
            } catch (error) {
              console.error("Connection check failed:", error);
              toast.error("Failed to verify connection status");
            }
          }, 1000);
        }
      }, 1000);

      // Cleanup if user doesn't complete OAuth
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(pollInterval);
          setConnecting(false);
        }
      }, 300000); // 5 minutes timeout
    } catch (error) {
      console.error("Failed to initiate Google connection:", error);
      toast.error("Failed to start Google connection");
      setConnecting(false);
    }
  };

  // Fetch Google Business Profiles (Milestone 6 - ProjectMVP)
  const fetchBusinessProfiles = async () => {
    try {
      setLoadingProfiles(true);
      setError(null);

      const response = await axiosInstance.get(
        API_PATHS.GOOGLE.BUSINESS_PROFILES
      );
      const profiles = response.data.profiles || [];
      setBusinessProfiles(profiles);

      // Auto-select first profile if only one exists
      if (profiles.length === 1) {
        setSelectedProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Failed to fetch business profiles:", error);
      const errorMessage = error.response?.data?.message || "Failed to load Google Business Profiles";
      setError(errorMessage);
      setBusinessProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Select Google Business Location
  const handleSelectLocation = async (locationId) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/api/google/select-location', {
        locationId
      });
      
      toast.success('Location selected successfully!');
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Failed to select location:', error);
      const errorMessage = error.response?.data?.message || 'Failed to select location';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  // Real API call to import reviews
  const handleImportReviews = async () => {
    try {
      setImporting(true);
      setError(null);

      const response = await axiosInstance.post(
        API_PATHS.GOOGLE.IMPORT_REVIEWS
      );

      toast.success(
        response.data.message ||
          `Imported ${response.data.reviewsImported} Google reviews!`
      );

      // Refresh the reviews list
      await fetchGoogleReviews();
    } catch (error) {
      console.error("Failed to import Google reviews:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to import Google reviews";
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  // Real API call to disconnect
  const handleDisconnect = async () => {
    try {
      setError(null);

      const response = await axiosInstance.delete(
        API_PATHS.GOOGLE.DISCONNECT_GOOGLE_ACCOUNT
      );
      toast.success(
        response.data.message || "Google Business Profile disconnected"
      );
      setConnectionStatus({ connected: false });
      setGoogleReviews([]);
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to disconnect Google Business Profile";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04A4FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                Google Reviews Integration
              </h1>
              <p className="text-white/90 text-lg font-medium">
                Import and display your Google Business reviews alongside
                TrueTestify reviews
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => fetchGoogleReviews(true)}
                disabled={refreshing}
                className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                title="Refresh Google reviews"
              >
                <ArrowPathIcon
                  className={`w-6 h-6 text-white ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
              {connectionStatus?.connected && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-white font-medium"
                >
                  Submit Google Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl ${
                  connectionStatus?.connected ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {connectionStatus?.connected ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  Google Business Profile
                </h2>
                <p className="text-gray-500">
                  {connectionStatus?.connected 
                    ? connectionStatus?.needsLocationSelection 
                      ? "Connected - Location Selection Required" 
                      : "Connected" 
                    : "Not Connected"}
                </p>
                {connectionStatus?.businessName && (
                  <p className="text-sm text-gray-400">
                    Business: {connectionStatus.businessName}
                  </p>
                )}
              </div>
            </div>

            {connectionStatus?.connected ? (
              <div className="flex space-x-3">
                {connectionStatus?.needsLocationSelection ? (
                  <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                    Please select a location first
                  </div>
                ) : (
                  <button
                    onClick={handleImportReviews}
                    disabled={importing}
                    className="flex items-center px-4 py-2 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors disabled:opacity-50"
                  >
                    {importing ? (
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                    )}
                    {importing ? "Importing..." : "Import Reviews"}
                  </button>
                )}
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
                className="flex items-center px-6 py-3 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors disabled:opacity-50"
              >
                {connecting ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-5 h-5 mr-2" />
                )}
                {connecting ? "Connecting..." : "Connect Google Business"}
              </button>
            )}
          </div>

          {connectionStatus?.connected && connectionStatus.connectedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Connected on{" "}
                {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                {connectionStatus.locationId &&
                  ` • Location ID: ${connectionStatus.locationId}`}
              </p>
            </div>
          )}
        </motion.div>

        {/* Location Selection for pending_selection status */}
        {connectionStatus?.connected && connectionStatus?.needsLocationSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-orange-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  Select Business Location
                </h2>
                <p className="text-orange-700">
                  Please select a business location to complete the setup
                </p>
              </div>
            </div>

            {loadingProfiles ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-orange-700">Loading available locations...</p>
              </div>
            ) : businessProfiles.length > 0 ? (
              <div className="space-y-3">
                {businessProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="border border-orange-200 rounded-xl p-4 bg-white hover:bg-orange-50 cursor-pointer transition-all"
                    onClick={() => handleSelectLocation(profile.locationId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                          {profile.name}
                        </h3>
                        <p className="text-sm text-gray-600">{profile.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.reviewCount} reviews • {profile.averageRating}★
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-orange-700">No business locations found. Please check your Google Business Profile setup.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Google Business Profiles Selection (Milestone 6 - ProjectMVP) */}
        {connectionStatus?.connected && !connectionStatus?.needsLocationSelection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  Google Business Profiles
                </h2>
                <p className="text-gray-500">
                  Select which business profile to import reviews from
                </p>
              </div>
              {loadingProfiles && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#04A4FF]"></div>
              )}
            </div>

            {businessProfiles.length > 0 ? (
              <div className="space-y-3">
                {businessProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedProfile?.id === profile.id
                        ? "border-[#04A4FF] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                          {profile.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {profile.address}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Location ID: {profile.locationId}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {selectedProfile?.id === profile.id && (
                            <CheckCircleIcon className="w-5 h-5 text-[#04A4FF]" />
                          )}
                          <div className="text-sm text-gray-600">
                            <div>
                              Reviews: {profile.reviewCount || "Unknown"}
                            </div>
                            <div>Rating: {profile.averageRating || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : loadingProfiles ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#04A4FF] mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Loading your Google Business Profiles...
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                  No Business Profiles Found
                </h3>
                <p className="text-gray-500">
                  Your Google account doesn't seem to manage any Google Business
                  Profiles.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Google Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            Imported Google Reviews ({googleReviews.length})
          </h2>
          {googleReviews.length > 0 && (
            <button
              onClick={() => fetchGoogleReviews(true)}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-[#04A4FF] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}
        </motion.div>

        {googleReviews.length > 0 ? (
          <div className="space-y-4">
            {googleReviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                      {review.reviewerName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    Google
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CloudArrowDownIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              No Google Reviews Yet
            </h3>
            <p className="text-gray-500 mb-6">
              {connectionStatus?.connected
                ? 'Click "Import Reviews" to fetch your Google Business reviews'
                : "Connect your Google Business Profile to import reviews"}
            </p>
            {!connectionStatus?.connected && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="text-left">
                    <p className="text-orange-700 font-medium text-sm">
                      Setup Required
                    </p>
                    <p className="text-orange-600 text-sm mt-1">
                      Connect your Google Business Profile to automatically
                      import and display your existing reviews.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-[#04A4FF] rounded-2xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            How Google Reviews Integration Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>1</div>
              <div className="text-sm opacity-90">
                Connect your Google Business Profile with one click
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>2</div>
              <div className="text-sm opacity-90">
                Import existing reviews automatically
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>3</div>
              <div className="text-sm opacity-90">
                Display alongside TrueTestify reviews on your public page
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Google Review Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                Submit Review to Google
              </h3>
              <p className="text-gray-600 mb-6">
                This will redirect you to your Google Business Profile where
                customers can leave reviews directly.
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
                    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${
                      connectionStatus?.locationId || "YOUR_PLACE_ID"
                    }`;
                    window.open(googleReviewUrl, "_blank");
                    setShowSubmitModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#04A4FF] text-white rounded-lg hover:bg-[#0394E6] transition-colors"
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
