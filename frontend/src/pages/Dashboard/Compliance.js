import { useEffect, useState } from "react";
import { API_PATHS } from "../../service/apiPaths";
import axiosInstance from "../../service/axiosInstanse";
import toast from "react-hot-toast";
import { TrashIcon, ShieldCheckIcon } from "@heroicons/react/16/solid";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";

const Compliance = () => {
  const [consentLogs, setConsentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsentList, setShowConsentList] = useState(false);
  const [showDeletedList, setShowDeletedList] = useState(false);

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
  const consentOnlyLogs = consentLogs.filter(log => log.action !== 'DELETE_REVIEW');

  const downloadPDF = (type) => {
    const data = type === 'consent' ? consentOnlyLogs : deletedReviews;
    const title = type === 'consent' ? 'Consent Logs Report' : 'Deleted Reviews Report';
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, yPos);
    yPos += 10;
    
    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
    yPos += 15;
    
    // Records
    data.forEach((log, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${type === 'consent' ? 'Consent Log' : 'Deleted Review'}`, margin, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Review ID: ${log.reviewId || 'N/A'}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`IP Address: ${log.ip || 'Unknown'}`, margin + 5, yPos);
      yPos += 6;
      
      const userAgent = log.userAgent || 'Unknown';
      const splitUserAgent = doc.splitTextToSize(`User Agent: ${userAgent}`, pageWidth - 2 * margin - 5);
      doc.text(splitUserAgent, margin + 5, yPos);
      yPos += splitUserAgent.length * 6;
      
      doc.text(`Date: ${new Date(log.consentCheckedAt || log.createdAt).toLocaleString()}`, margin + 5, yPos);
      yPos += 6;
      
      if (log.consentText) {
        const splitDetails = doc.splitTextToSize(`Details: ${log.consentText}`, pageWidth - 2 * margin - 5);
        doc.text(splitDetails, margin + 5, yPos);
        yPos += splitDetails.length * 6;
      }
      
      yPos += 8;
    });
    
    doc.save(`${type}-logs-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(`${title} downloaded successfully`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Privacy & Compliance Section */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
            Privacy and Compliance
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Consent Requirement Toggle */}
          {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#04A4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Consent Requirement</h3>
                <p className="text-sm text-gray-600">
                  Require customer to proved explicit content before submitting reviews. This helps ensure GDPR and CCPA compliance
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#04A4FF] focus:ring-offset-2 bg-[#04A4FF] hover:shadow-lg"
              >
                <span className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 translate-x-7">
                  <svg className="w-4 h-4 text-[#04A4FF] m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div> */}

          {/* Compliance Action */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-[#04A4FF]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Compliance Action</h3>
                <p className="text-sm text-gray-600">
                  I agree to record my review and allow admin to use it publicly
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-12"></div>
                ))}
              </div>
            ) : consentOnlyLogs.length > 0 && consentOnlyLogs[0] ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review ID</label>
                  <input
                    type="text"
                    value={consentOnlyLogs[0].reviewId || "N/A"}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                  <input
                    type="text"
                    value={consentOnlyLogs[0].userAgent || "Unknown"}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={
                      consentOnlyLogs[0].consentCheckedAt
                        ? new Date(consentOnlyLogs[0].consentCheckedAt).toLocaleString()
                        : "N/A"
                    }
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No compliance logs available</p>
            )}
          </div>
        </div>

        {/* Consent Logs List */}
        <div className="p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              All Consent Logs ({consentOnlyLogs.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('consent')}
                disabled={consentOnlyLogs.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-[#04A4FF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowConsentList(!showConsentList)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showConsentList ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>
          
          {showConsentList && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {consentOnlyLogs.length > 0 ? (
                consentOnlyLogs.map((log) => (
                  <div key={log.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Review ID: {log.reviewId || 'N/A'}</p>
                          <p className="text-xs text-gray-600 mt-1">IP: {log.ip || 'Unknown'} | User Agent: {log.userAgent || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(log.consentCheckedAt || log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No consent logs available</p>
              )}
            </div>
          )}
        </div>

        {/* Deleted Reviews List */}
        <div className="p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
              Deleted Reviews ({deletedReviews.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('deleted')}
                disabled={deletedReviews.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowDeletedList(!showDeletedList)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showDeletedList ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>
          
          {showDeletedList && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {deletedReviews.length > 0 ? (
                deletedReviews.map((log) => (
                  <div key={log.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Review ID: {log.reviewId || 'N/A'}</p>
                          <p className="text-xs text-gray-600 mt-1">IP: {log.ip || 'Unknown'} | User Agent: {log.userAgent || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(log.consentCheckedAt || log.createdAt).toLocaleString()}</p>
                          {log.consentText && <p className="text-xs text-gray-600 mt-1">{log.consentText}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No deleted reviews</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;