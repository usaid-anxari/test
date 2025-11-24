import {
  ArrowUpOnSquareStackIcon,
  MoonIcon,
  PuzzlePieceIcon,
  SunIcon,
  QrCodeIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";

import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import { motion } from "framer-motion";
import FeatureGate from "../../components/FeatureGate";
import UpgradeModal from "../../components/UpgradeModal";
import useSubscription from "../../hooks/useSubscription";
import { useTrialStatus } from "../../components/TrialGuard";
import { useAuth0 } from "@auth0/auth0-react";

const WidgetsettingsJson = () => {
  const {user} = useAuth0()
  const { tenant, hasFeature } = useContext(AuthContext);
  const subscription = useSubscription();
  const { isReadOnly } = useTrialStatus();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);
  const [showIfreamModal, setShowIfreamModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [embedCode, setEmbedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch widgets from API
  const fetchWidgets = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      const response = await axiosInstance.get(API_PATHS.WIDGETS.GET_WIDGETS);
      setWidgets(response.data.widgets || []);
      if (showRefreshToast) toast.success("Widgets refreshed!");
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast.error("Failed to load widgets");
    } finally {
      if (showRefreshToast) setRefreshing(false);
    }
  };

useEffect(() => {
    fetchWidgets();
},[])
  // Set the first widget as selected by default
  useEffect(() => {
    if (!selectedWidget && widgets.length > 0) {
      setSelectedWidget(widgets[0]);
    }

  }, [widgets, selectedWidget, setSelectedWidget]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate review types
    if (!formData.reviewTypes || formData.reviewTypes.length === 0) {
      toast.error("Please select at least one review type");
      return;
    }

    setLoading(true);
    try {
      const widgetData = {
        name: formData.name,
        style: formData.style,
        reviewTypes: formData.reviewTypes,
        settingsJson: formData.settingsJson,
      };

      if (formData.id) {
        await axiosInstance.put(
          API_PATHS.WIDGETS.UPDATE_WIDGET(formData.id),
          widgetData
        );
        toast.success("Widget updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.WIDGETS.CREATE_WIDGET, widgetData);
        toast.success("Widget created successfully!");
        // console.log("CREATE_WIDGET RESPONSE ", res);
      }
      fetchWidgets();
      setShowEditModal(false);
      setFormData(null);
    } catch (error) {
      toast.error("Failed to save widget");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = async (widget) => {
    try {
      const newIsActive = !widget.isActive;
      console.log(newIsActive);

      await axiosInstance.put(API_PATHS.WIDGETS.UPDATE_WIDGET(widget.id), {
        isActive: newIsActive,
      });

      toast.success(`Widget ${newIsActive ? "activated" : "deactivated"}!`);
      fetchWidgets();
    } catch (error) {
      toast.error("Failed to toggle widget");
      console.error("Error toggling widget:", error);
    }
  };

  const handleDeleteClick = (widget) => {
    setWidgetToDelete(widget);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!widgetToDelete) return;

    try {
      await axiosInstance.delete(
        API_PATHS.WIDGETS.DELETE_WIDGET(widgetToDelete.id)
      );
      toast.success("Widget deleted successfully!");

      if (selectedWidget?.id === widgetToDelete.id) {
        setSelectedWidget(null);
      }

      setShowDeleteModal(false);
      setWidgetToDelete(null);
      fetchWidgets();
    } catch (error) {
      toast.error("Failed to delete widget");
      console.error("Error deleting widget:", error);
    }
  };

  const fetchEmbedCode = async (widgetId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.WIDGETS.GET_EMBED_CODE(widgetId)
      );
      console.log(response);

      setEmbedCode(response.data.embedCode);
      setShowEmbedModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch embed code."
      );
      console.error("Error fetching embed code:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIframeCode = async (widgetId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.WIDGETS.GET_EMBED_CODE(widgetId)
      );
      setEmbedCode(response.data.iframeCode);
      setShowIfreamModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch embed code."
      );
      console.error("Error fetching embed code:", error);
    } finally {
      setLoading(false);
    }
  };

  const layouts = [
    { name: "Carousel", value: "carousel", feature: "layout_carousel" },
    { name: "Grid", value: "grid", feature: "layout_grid" },
    { name: "Spotlight", value: "spotlight", feature: "layout_spotlight" },
    { name: "Floating", value: "floating", feature: "layout_floating_bubble" },
  ];

  const themes = [
    {
      name: "Light",
      value: "light",
      icon: <SunIcon className="h-5 w-5" />,
      settingsJson: {
        theme: "light",
        primary: "#1e3a8a",
        secondary: "#ef7c00",
        background: "#ffffff",
      },
    },
    {
      name: "Dark",
      value: "dark",
      icon: <MoonIcon className="h-5 w-5" />,
      settingsJson: {
        theme: "dark",
        primary: "#3b82f6",
        secondary: "#f97316",
        background: "#1a202c",
      },
    },
  ];

  const publicReviewBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const businessSlug = tenant?.slug || "your-business";
  const publicRecordUrl = `${publicReviewBaseUrl}/record/${businessSlug}`;
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(publicRecordUrl, {
          margin: 1,
          width: 256,
        });
        if (isMounted) setQrDataUrl(dataUrl);
      } catch (_) {
        // no-op
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [publicRecordUrl]);


  const handleDownloadQr = async () => {
    try {
      const dataUrl =
        qrDataUrl ||
        (await QRCode.toDataURL(publicRecordUrl, { margin: 1, width: 512 }));
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `truetestify-record-${businessSlug}.png`;
      link.click();
      toast.success("QR code downloaded.");
    } catch (e) {
      toast.error("Failed to generate QR code");
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{
                  fontFamily: "Founders Grotesk, system-ui, sans-serif",
                }}
              >
                Widget Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (subscription.tier === "free" && widgets.length >= 1) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setFormData({
                    name: "",
                    style: "carousel",
                    reviewTypes: ["video", "audio", "text"],
                    settingsJson: themes[0].settingsJson,
                  });
                  setShowEditModal(true);
                }}
                disabled={isReadOnly}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  isReadOnly
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#04A4FF] text-white hover:bg-blue-600"
                }`}
              >
                Create New Widget +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Account Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user?.name || "User"}
                  className="w-16 h-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {user?.name || "User"}
                </h3>
                <p className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center bg-blue-50 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <PuzzlePieceIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Total Widgets
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {widgets.length}
                </div>
                <div className="text-xs text-green-600 font-semibold">
                  +11.01% ↗
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Active
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {widgets.filter((w) => w.isActive).length}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Widgets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6"
        >
          <h2
            className="text-xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "Founders Grotesk, system-ui, sans-serif" }}
          >
            Your Active Widgets
          </h2>
          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <PuzzlePieceIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No widgets created yet</p>
              <p className="text-gray-400">
                Create your first widget to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {widgets.map((widget) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900 mb-1">
                        {widget.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {widget.style} Layout
                      </p>
                    </div>
                    {widget.isActive ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center space-x-2 mb-3">
                    <button
                      onClick={() => setSelectedWidget(widget)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Preview"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (isReadOnly) return;
                        setFormData({
                          id: widget.id,
                          name: widget.name,
                          style: widget.style,
                          reviewTypes: widget.reviewTypes || [
                            "video",
                            "audio",
                            "text",
                          ],
                          settingsJson: widget.settingsJson,
                        });
                        setShowEditModal(true);
                      }}
                      disabled={isReadOnly}
                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (isReadOnly) return;
                        handleDeleteClick(widget);
                      }}
                      disabled={isReadOnly}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (isReadOnly) return;
                        toggleWidget(widget);
                      }}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 text-white ${widget.isActive ? "bg-red-500 hover:bg-red-600" :"bg-green-500 hover:bg-green-600"}  rounded-lg text-sm font-semibold transition-colors disabled:opacity-50`}
                    >
                      {widget.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => fetchEmbedCode(widget.id)}
                      className="w-full px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Get Code
                    </button>
                    <button
                      onClick={() => fetchIframeCode(widget.id)}
                      className="w-full px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Get iframe Code
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Selected Widget Preview */}
        {selectedWidget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6"
          >
            <div className="bg-white p-6 border-b">
              <h2
                className="text-xl font-bold text-gray-900"
                style={{
                  fontFamily: "Founders Grotesk, system-ui, sans-serif",
                }}
              >
                Widgets Preview
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                  {selectedWidget.isActive ? (
                    <iframe
                      key={selectedWidget.id}
                      src={`${
                        process.env.REACT_APP_BASE_URL ||
                        "http://localhost:4000"
                      }/embed/${selectedWidget.id}?reviewTypes=${(
                        selectedWidget.reviewTypes || ["video", "audio", "text"]
                      ).join(",")}`}
                      width="100%"
                      height="500"
                      className="w-full"
                      title={`${selectedWidget.name} Widget Preview`}
                    />
                  ) : (
                    <div className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <EyeSlashIcon className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Widget Preview Unavailable
                      </h3>
                      <p className="text-gray-500 mb-4">
                        This widget is currently inactive. Activate it to see
                        the live preview.
                      </p>
                      <button
                        onClick={() => toggleWidget(selectedWidget)}
                        className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-semibold transition-colors"
                      >
                        Activate Widget
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6"
        >
          <div className="bg-white p-6 border-b">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "Founders Grotesk, system-ui, sans-serif" }}
            >
              QR Code Collection
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Record review QR"
                      className="w-64 h-64"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <QrCodeIcon className="w-16 h-16 mx-auto mb-4" />
                        <div>Generating QR Code...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    QR Code Detail
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target URI
                    </label>
                    <input
                      type="text"
                      value={publicRecordUrl}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleDownloadQr}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#04A4FF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowUpOnSquareStackIcon className="w-5 h-5 mr-2" />
                    Download QR Code
                  </button>
                  <a
                    href={`/record/${businessSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Preview Review Page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- Modal for Creating/Editing a Widget --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-800">
                {formData?.id ? "Edit Widget" : "Create New Widget"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setFormData(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Name
                </label>
                <input
                  type="text"
                  value={formData?.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="e.g., Homepage Carousel"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Widget Layout
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {layouts.map((layout) => (
                    <button
                      type="button"
                      key={layout.value}
                      onClick={() => {
                        const newFormData = {
                          ...formData,
                          style: layout.value,
                        };
                        // Auto-adjust review types for spotlight (remove text)
                        if (layout.value === "spotlight") {
                          newFormData.reviewTypes = (
                            formData?.reviewTypes || ["video", "audio", "text"]
                          ).filter((type) => type !== "text");
                        }
                        setFormData(newFormData);
                      }}
                      disabled={!hasFeature(layout.feature)}
                      className={`px-4 py-4 w-full font-semibold text-sm transition-colors rounded-lg border-2 relative
                          ${
                            formData?.style === layout.value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          } ${
                        !hasFeature(layout.feature)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                        `}
                    >
                      {layout.name}
                      {formData?.style === layout.value && (
                        <CheckCircleIcon className="w-4 h-4 absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Widget Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      type="button"
                      key={theme.value}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          settingsJson: {
                            ...formData.settingsJson,
                            ...theme.settingsJson,
                          },
                        })
                      }
                      className={`flex items-center justify-center px-4 py-4 w-full font-semibold text-sm transition-colors rounded-lg border-2 relative
                          ${
                            formData?.settingsJson?.theme === theme.value
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }
                        `}
                    >
                      {theme.icon}
                      <span className="ml-2">{theme.name}</span>
                      {formData?.settingsJson?.theme === theme.value && (
                        <CheckCircleIcon className="w-4 h-4 absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Review Types to Display
                </label>
                {formData?.style === "floating" ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <h4 className="font-semibold text-yellow-800">
                          Text Reviews Only
                        </h4>
                        <p className="text-sm text-yellow-700">
                          Floating widgets automatically display only text
                          reviews for optimal performance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : formData?.style === "spotlight" ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">🎥</span>
                        <span className="text-2xl mr-3">🎵</span>
                        <div>
                          <h4 className="font-semibold text-blue-800">
                            Video & Audio Only
                          </h4>
                          <p className="text-sm text-blue-700">
                            Spotlight widgets showcase video and audio reviews
                            for maximum visual impact.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          type: "video",
                          label: "Video Reviews",
                          icon: "🎥",
                          bgColor: "bg-orange-100",
                          textColor: "text-orange-700",
                          borderColor: "border-orange-300",
                        },
                        {
                          type: "audio",
                          label: "Audio Reviews",
                          icon: "🎵",
                          bgColor: "bg-purple-100",
                          textColor: "text-purple-700",
                          borderColor: "border-purple-300",
                        },
                      ].map((reviewType) => {
                        const isSelected = formData?.reviewTypes?.includes(
                          reviewType.type
                        );
                        return (
                          <button
                            type="button"
                            key={reviewType.type}
                            onClick={() => {
                              const currentTypes = formData?.reviewTypes || [];
                              let newTypes;
                              if (isSelected) {
                                newTypes = currentTypes.filter(
                                  (t) => t !== reviewType.type
                                );
                              } else {
                                newTypes = [...currentTypes, reviewType.type];
                              }
                              setFormData({
                                ...formData,
                                reviewTypes: newTypes,
                              });
                            }}
                            className={`flex flex-col items-center justify-center p-4 w-full font-semibold text-sm transition-all duration-200 rounded-lg border-2 relative ${
                              isSelected
                                ? `${reviewType.bgColor} ${reviewType.textColor} ${reviewType.borderColor} scale-105`
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:scale-102"
                            }`}
                          >
                            <span className="text-2xl mb-2">
                              {reviewType.icon}
                            </span>
                            <span className="text-center">
                              {reviewType.label}
                            </span>
                            {isSelected && (
                              <CheckCircleIcon className="w-5 h-5 absolute top-2 right-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg">
                      💡 Choose video, audio, or both for your spotlight widget.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          type: "video",
                          label: "Video Reviews",
                          icon: "🎥",
                          bgColor: "bg-orange-100",
                          textColor: "text-orange-700",
                          borderColor: "border-orange-300",
                        },
                        {
                          type: "audio",
                          label: "Audio Reviews",
                          icon: "🎵",
                          bgColor: "bg-purple-100",
                          textColor: "text-purple-700",
                          borderColor: "border-purple-300",
                        },
                        {
                          type: "text",
                          label: "Text Reviews",
                          icon: "💬",
                          bgColor: "bg-green-100",
                          textColor: "text-green-700",
                          borderColor: "border-green-300",
                        },
                      ].map((reviewType) => {
                        const isSelected = formData?.reviewTypes?.includes(
                          reviewType.type
                        );
                        const isDisabled =
                          formData?.style === "spotlight" &&
                          reviewType.type === "text";
                        return (
                          <button
                            type="button"
                            key={reviewType.type}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              const currentTypes = formData?.reviewTypes || [];
                              let newTypes;
                              if (isSelected) {
                                newTypes = currentTypes.filter(
                                  (t) => t !== reviewType.type
                                );
                              } else {
                                newTypes = [...currentTypes, reviewType.type];
                              }
                              setFormData({
                                ...formData,
                                reviewTypes: newTypes,
                              });
                            }}
                            className={`flex flex-col items-center justify-center p-4 w-full font-semibold text-sm transition-all duration-200 rounded-lg border-2 relative ${
                              isDisabled
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                : isSelected
                                ? `${reviewType.bgColor} ${reviewType.textColor} ${reviewType.borderColor} scale-105`
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:scale-102"
                            }`}
                          >
                            <span className="text-2xl mb-2">
                              {reviewType.icon}
                            </span>
                            <span className="text-center">
                              {reviewType.label}
                            </span>
                            {isSelected && (
                              <CheckCircleIcon className="w-5 h-5 absolute top-2 right-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg">
                      💡 Select which types of reviews to display in this
                      widget. Users can filter between selected types.
                    </p>
                  </>
                )}
              </div>
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Autoplay Videos & Audio
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically play media when widget loads (muted for
                        videos)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          settingsJson: {
                            ...formData.settingsJson,
                            autoplay: !formData.settingsJson?.autoplay,
                          },
                        })
                      }
                      className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full
                          ${
                            formData?.settingsJson?.autoplay
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 bg-white shadow transform ring-0 transition ease-in-out duration-200 rounded-full
                            ${
                              formData?.settingsJson?.autoplay
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData(null);
                  }}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-sm font-semibold text-white bg-[#04A4FF] rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {formData?.id ? "Save Changes" : "Create Widget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Modal for Embed Codes --- */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-800">Embed Code</h4>
              <button
                onClick={() => {
                  setShowEmbedModal(false);
                  setEmbedCode("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading embed code...</p>
              </div>
            ) : embedCode ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Copy the code below to add this widget to your website.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    HTML Embed Code
                  </p>
                  <div className="relative">
                    <pre className="w-full p-3 bg-white rounded-md border border-gray-300 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap max-h-40">
                      {embedCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode);
                        toast.success("Embed code copied!");
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-500 bg-white rounded"
                    >
                      <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Failed to load embed code. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --- Modal for Ifream Codes --- */}
      {showIfreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-800">Iframe Code</h4>
              <button
                onClick={() => {
                  setShowIfreamModal(false);
                  setEmbedCode("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading Iframe code...</p>
              </div>
            ) : embedCode ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Copy the code below to add this widget to your website.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    HTML Ifream Code
                  </p>
                  <div className="relative">
                    <pre className="w-full p-3 bg-white rounded-md border border-gray-300 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap max-h-40">
                      {embedCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode);
                        toast.success("Embed code copied!");
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-500 bg-white rounded"
                    >
                      <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Failed to load Iframe code. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Widget
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{widgetToDelete?.name}"? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setWidgetToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="unlimited_widgets"
        widgetCount={widgets.length}
      />
    </div>
  );
};

export default WidgetsettingsJson;
