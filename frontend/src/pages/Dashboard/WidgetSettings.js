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

const WidgetsettingsJson = () => {
  const {
    tenant,
    user,
    hasFeature,
  } = useContext(AuthContext);
  const subscription = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);
  const [showIfreamModal,setShowIfreamModal] = useState(false);
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
  }, []);

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
        await axiosInstance.post(
          API_PATHS.WIDGETS.CREATE_WIDGET,
          widgetData
        );
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
      
      await axiosInstance.put(
        API_PATHS.WIDGETS.UPDATE_WIDGET(widget.id),
        { isActive: newIsActive }
      );
      
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
      await axiosInstance.delete(API_PATHS.WIDGETS.DELETE_WIDGET(widgetToDelete.id));
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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#04A4FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white" style={{ fontFamily: 'Founders Grotesk, system-ui, sans-serif' }}>
                Widget Management
              </h1>
              <p className="text-white/80 text-lg font-medium">
                Create, customize, and embed your review widgets
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => fetchWidgets(true)}
                disabled={refreshing}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                title="Refresh widgets"
              >
                <ArrowPathIcon className={`w-6 h-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                  <div className="text-2xl font-bold">{widgets.length}</div>
                  <div className="text-sm text-blue-100">Total Widgets</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-green-300">
                    {widgets.filter((w) => w.isActive).length}
                  </div>
                  <div className="text-sm text-blue-100">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Account Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#04A4FF] rounded-xl flex items-center justify-center">
                <PuzzlePieceIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  TrueTestify Account
                </h3>
                <p className="text-gray-600">
                  Connected as{" "}
                  <span className="font-semibold text-blue-600">
                    {user?.email}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Connected
                </span>
              </div>
              <button className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg">
                Disconnect
              </button>
            </div>
          </div>
        </motion.div>

        {/* Create New Widget Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => {
              // Check widget limit for free tier
              if (subscription.tier === 'free' && widgets.length >= 1) {
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
            className="bg-[#04A4FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create New Widget</span>
          </button>
        </motion.div>

        {/* Widgets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Widgets
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {widgets.map((widget) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                    selectedWidget?.id === widget.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedWidget(widget)}
                >
                  {/* Header with title and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
                        {widget.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 capitalize">
                          {widget.style} Layout
                        </span>
                        <span className="text-gray-300">•</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            widget.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${
                            widget.isActive ? "bg-green-500" : "bg-gray-400"
                          }`} />
                          {widget.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {(() => {
                          let displayTypes = widget.reviewTypes || ["video", "audio", "text"];
                          
                          // Override for special widget types
                          if (widget.style === 'floating') {
                            displayTypes = ['text'];
                          } else if (widget.style === 'spotlight') {
                            displayTypes = (widget.reviewTypes || ['video', 'audio']).filter(type => ['video', 'audio'].includes(type));
                          }
                          
                          const typeConfig = {
                            video: { icon: "🎥", color: "text-orange-600" },
                            audio: { icon: "🎵", color: "text-purple-600" },
                            text: { icon: "💬", color: "text-green-600" }
                          };
                          
                          return displayTypes.map((type) => (
                            <span key={type} className={`text-xs ${typeConfig[type]?.color}`} title={`${type} reviews`}>
                              {typeConfig[type]?.icon}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                    
                    {/* Action buttons in top right */}
                    <div className="flex items-center space-x-1 ml-2">
                      {widget.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWidget(widget);
                          }}
                          className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Live preview"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            id: widget.id,
                            name: widget.name,
                            style: widget.style,
                            reviewTypes: widget.reviewTypes || ["video", "audio", "text"],
                            settingsJson: widget.settingsJson
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit widget"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(widget);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete widget"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Widget preview/info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Theme</div>
                    <div className="text-sm font-semibold text-gray-700 capitalize">
                      {widget.settingsJson?.theme || "Light"}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidget(widget);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          widget.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {widget.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchEmbedCode(widget.id);
                        }}
                        className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Get Code
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchIframeCode(widget.id);
                      }}
                      className="w-full px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Get Iframe Code
                    </button>
                  </div>

                  {/* Selected indicator */}
                  {selectedWidget?.id === widget.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
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
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
          >
            <div className="bg-white p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <EyeIcon className="w-8 h-8 mr-3 text-blue-600" />
                Widget Preview: "{selectedWidget.name}"
              </h2>
              <p className="text-gray-600">
                Live preview of how your widget will appear on your website
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Layout:
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedWidget.style}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      Theme:
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedWidget.settingsJson?.theme || "Light"}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      Types:
                    </span>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        let displayTypes = selectedWidget.reviewTypes || ["video", "audio", "text"];
                        
                        // Override for special widget types
                        if (selectedWidget.style === 'floating') {
                          displayTypes = ['text'];
                        } else if (selectedWidget.style === 'spotlight') {
                          displayTypes = (selectedWidget.reviewTypes || ['video', 'audio']).filter(type => ['video', 'audio'].includes(type));
                        }
                        
                        const typeConfig = {
                          video: { icon: "🎥", label: "Video", bg: "bg-orange-100", text: "text-orange-700" },
                          audio: { icon: "🎵", label: "Audio", bg: "bg-purple-100", text: "text-purple-700" },
                          text: { icon: "💬", label: "Text", bg: "bg-green-100", text: "text-green-700" }
                        };
                        
                        return displayTypes.map((type) => (
                          <span key={type} className={`${typeConfig[type]?.bg} ${typeConfig[type]?.text} px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
                            <span className="mr-1">{typeConfig[type]?.icon}</span>
                            {typeConfig[type]?.label}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                  {!hasFeature("widget_embed") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      <p className="text-sm text-red-600 font-semibold">
                        Widget embedding requires a premium plan
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
                  {selectedWidget.isActive ? (
                    <iframe
                      key={selectedWidget.id}
                      src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/embed/${selectedWidget.id}?reviewTypes=${(selectedWidget.reviewTypes || ['video', 'audio', 'text']).join(',')}`}
                      width="100%"
                      height="500"
                      frameBorder="0"
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
                        This widget is currently inactive. Activate it to see the live preview.
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
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-white p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <QrCodeIcon className="w-8 h-8 mr-3 text-blue-600" />
              QR Code Collection
            </h2>
            <p className="text-gray-600">
              Generate QR codes for offline review collection on packaging,
              receipts, or displays
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-300">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Record review QR"
                      className="w-64 h-64 mx-auto rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="w-64 h-64 mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 text-lg rounded-xl bg-white">
                      <div className="text-center">
                        <QrCodeIcon className="w-16 h-16 mx-auto mb-4" />
                        <div>Generating QR Code...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    QR Code Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      Target URL:
                    </div>
                    <div className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded-lg border break-all">
                      {publicRecordUrl}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadQr}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#04A4FF] text-white font-bold rounded-xl hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ArrowUpOnSquareStackIcon className="w-5 h-5 mr-2" />
                    Download QR Code
                  </button>
                  <a
                    href={`/record/${businessSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Preview Review Page
                  </a>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Usage Tips:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Print on product packaging</li>
                    <li>• Add to receipts and invoices</li>
                    <li>• Display in your physical store</li>
                    <li>• Include in email signatures</li>
                  </ul>
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        const newFormData = { ...formData, style: layout.value };
                        // Auto-adjust review types for spotlight (remove text)
                        if (layout.value === 'spotlight') {
                          newFormData.reviewTypes = (formData?.reviewTypes || ['video', 'audio', 'text']).filter(type => type !== 'text');
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
                {formData?.style === 'floating' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Text Reviews Only</h4>
                        <p className="text-sm text-yellow-700">Floating widgets automatically display only text reviews for optimal performance.</p>
                      </div>
                    </div>
                  </div>
                ) : formData?.style === 'spotlight' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">🎥</span>
                        <span className="text-2xl mr-3">🎵</span>
                        <div>
                          <h4 className="font-semibold text-blue-800">Video & Audio Only</h4>
                          <p className="text-sm text-blue-700">Spotlight widgets showcase video and audio reviews for maximum visual impact.</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { type: "video", label: "Video Reviews", icon: "🎥", bgColor: "bg-orange-100", textColor: "text-orange-700", borderColor: "border-orange-300" },
                        { type: "audio", label: "Audio Reviews", icon: "🎵", bgColor: "bg-purple-100", textColor: "text-purple-700", borderColor: "border-purple-300" }
                      ].map((reviewType) => {
                        const isSelected = formData?.reviewTypes?.includes(reviewType.type);
                        return (
                          <button
                            type="button"
                            key={reviewType.type}
                            onClick={() => {
                              const currentTypes = formData?.reviewTypes || [];
                              let newTypes;
                              if (isSelected) {
                                newTypes = currentTypes.filter(t => t !== reviewType.type);
                              } else {
                                newTypes = [...currentTypes, reviewType.type];
                              }
                              setFormData({ ...formData, reviewTypes: newTypes });
                            }}
                            className={`flex flex-col items-center justify-center p-4 w-full font-semibold text-sm transition-all duration-200 rounded-lg border-2 relative ${
                              isSelected
                                ? `${reviewType.bgColor} ${reviewType.textColor} ${reviewType.borderColor} scale-105`
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:scale-102"
                            }`}
                          >
                            <span className="text-2xl mb-2">{reviewType.icon}</span>
                            <span className="text-center">{reviewType.label}</span>
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
                        { type: "video", label: "Video Reviews", icon: "🎥", bgColor: "bg-orange-100", textColor: "text-orange-700", borderColor: "border-orange-300" },
                        { type: "audio", label: "Audio Reviews", icon: "🎵", bgColor: "bg-purple-100", textColor: "text-purple-700", borderColor: "border-purple-300" },
                        { type: "text", label: "Text Reviews", icon: "💬", bgColor: "bg-green-100", textColor: "text-green-700", borderColor: "border-green-300" }
                      ].map((reviewType) => {
                        const isSelected = formData?.reviewTypes?.includes(reviewType.type);
                        const isDisabled = formData?.style === 'spotlight' && reviewType.type === 'text';
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
                                newTypes = currentTypes.filter(t => t !== reviewType.type);
                              } else {
                                newTypes = [...currentTypes, reviewType.type];
                              }
                              setFormData({ ...formData, reviewTypes: newTypes });
                            }}
                            className={`flex flex-col items-center justify-center p-4 w-full font-semibold text-sm transition-all duration-200 rounded-lg border-2 relative ${
                              isDisabled
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                : isSelected
                                ? `${reviewType.bgColor} ${reviewType.textColor} ${reviewType.borderColor} scale-105`
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:scale-102"
                            }`}
                          >
                            <span className="text-2xl mb-2">{reviewType.icon}</span>
                            <span className="text-center">{reviewType.label}</span>
                            {isSelected && (
                              <CheckCircleIcon className="w-5 h-5 absolute top-2 right-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg">
                      💡 Select which types of reviews to display in this widget. Users can filter between selected types.
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
                        Automatically play media when widget loads (muted for videos)
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
                Are you sure you want to delete "{widgetToDelete?.name}"? This action cannot be undone.
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
