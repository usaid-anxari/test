import { useEffect, useState } from "react";
import { API_PATHS } from "../../service/apiPaths";
import axiosInstance from "../../service/axiosInstanse";
import toast from "react-hot-toast";
import { TrashIcon, ShieldCheckIcon } from "@heroicons/react/16/solid";

const Compliance = () => {
  const [consentLogs, setConsentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsentLogs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.COMPLIANCE.GET_CONSENT_LOGS);
        setConsentLogs(response.data.logs || []);
      } catch (error) {
        console.error("Failed to load consent logs:", error);
        toast.error("Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    };

    fetchConsentLogs();
  }, []);

  const deletedReviews = consentLogs.filter(log => log.action === 'DELETE_REVIEW');

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center space-x-4">
            <ShieldCheckIcon className="w-12 h-12 text-white" />
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>GDPR Compliance</h1>
              <p className="text-white/90 text-lg">Review deletion logs and compliance tracking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Stats */}
          <div className="bg-gray-50 p-8 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>{deletedReviews.length}</div>
                    <div className="text-sm text-gray-600">Deleted Reviews</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-[#04A4FF]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>{consentLogs.length}</div>
                    <div className="text-sm text-gray-600">Total Compliance Logs</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>100%</div>
                    <div className="text-sm text-gray-600">GDPR Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Consent Logs Section */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>All Consent Logs</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20"></div>
                ))}
              </div>
            ) : consentLogs.length > 0 ? (
              <div className="space-y-4">
                {consentLogs.map((log) => (
                  <div key={log.id} className={`border rounded-xl p-6 ${
                    log.action === 'DELETE_REVIEW' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === 'DELETE_REVIEW'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}>
                          {log.action === 'DELETE_REVIEW' ? (
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          ) : (
                            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                            {log.action === 'DELETE_REVIEW' 
                              ? 'Review Permanently Deleted' 
                              : log.action || 'Compliance Action'
                            }
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.consentText || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            {log.reviewId && <span>Review ID: {log.reviewId}</span>}
                            <span>IP: {log.ip || 'Unknown'}</span>
                            <span>User Agent: {log.userAgent || 'Unknown'}</span>
                            <span>Date: {new Date(log.consentCheckedAt || log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        log.action === 'DELETE_REVIEW'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action || 'CONSENT_LOG'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>No Consent Logs</h3>
                <p className="text-gray-500">No compliance activities have been recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;