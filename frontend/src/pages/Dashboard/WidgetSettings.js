import {
  ArrowUpOnSquareStackIcon,
  MoonIcon,
  PuzzlePieceIcon,
  SunIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ArrowRightCircleIcon,
  QrCodeIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import PublicReviews from "../../pages/PublicReviews";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";
import { motion } from "framer-motion";

const WidgetSettings = ({ business }) => {
  const navigate = useNavigate();
  const {
    tenant,
    widgets,
    selectedWidget,
    setSelectedWidget,
    fetchWidgets,
    user,
    hasFeature,
  } = useContext(AuthContext);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [formData, setFormData] = useState(null);

  // Set the first widget as selected by default
  useEffect(() => {
    if (!selectedWidget && widgets.length > 0) {
      setSelectedWidget(widgets[0]);
    }
  }, [widgets, selectedWidget, setSelectedWidget]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axiosInstance.put(API_PATHS.WIDGETS.UPDATE_WIDGET(formData.id), {
          name: formData.name,
          style: formData.layout,
          settingsJson: formData.themeJson,
          isActive: formData.isActive,
        });
        toast.success("Widget updated successfully!");
        setSelectedWidget(formData);
      } else {
        const newWidgetData = {
          name: formData.name,
          style: formData.layout,
          settingsJson: formData.themeJson,
          isActive: formData.isActive,
        };
        await axiosInstance.post(
          API_PATHS.WIDGETS.CREATE_WIDGET,
          newWidgetData
        );
        toast.success("Widget created successfully!");
      }
      fetchWidgets();
      setShowEditModal(false);
      setFormData(null);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Form submission error:", error);
    }
  };

  const handleUpdateWidget = async (key, value) => {
    if (!selectedWidget) return;

    const updatedWidget = { ...selectedWidget, [key]: value };
    setSelectedWidget(updatedWidget);

    try {
      const updateData = {
        name: updatedWidget.name,
        style: updatedWidget.style,
        settingsJson: updatedWidget.settingsJson || updatedWidget.settings,
        isActive: updatedWidget.isActive,
      };

      await axiosInstance.put(
        API_PATHS.WIDGETS.UPDATE_WIDGET(selectedWidget.id),
        updateData
      );
      toast.success("Widget settings updated!");
    } catch (error) {
      setSelectedWidget(selectedWidget);
      toast.error("Failed to update widget.");
      console.error("Error updating widget:", error);
    }
  };

  const toggleWidget = async (widget) => {
    try {
      const newIsActive = !widget.isActive;
      await axiosInstance.put(API_PATHS.WIDGETS.UPDATE_WIDGET(widget.id), {
        name: widget.name,
        style: widget.style,
        settingsJson: widget.settingsJson || widget.settings,
        isActive: newIsActive,
      });
      toast.success(`Widget ${newIsActive ? "activated" : "deactivated"}!`);
      fetchWidgets();
    } catch (error) {
      toast.error("Failed to toggle widget.");
      console.error("Error toggling widget:", error);
    }
  };

  const layouts = [
    { name: "Carousel", value: "CAROUSEL", feature: "layout_carousel" },
    { name: "Grid", value: "GRID", feature: "layout_grid" },
    { name: "Spotlight", value: "SPOTLIGHT", feature: "layout_spotlight" },
    {
      name: "Floating",
      value: "FLOATING_BUBBLE",
      feature: "layout_floating_bubble",
    },
  ];

  // UPDATED: Theme options with primary and background colors
  const themes = [
    {
      name: "Light",
      value: "light",
      icon: <SunIcon className="h-5 w-5" />,
      themeJson: {
        theme: "light",
        primary: "#428ee5",
        background: "#fff",
      },
    },
    {
      name: "Dark",
      value: "dark",
      icon: <MoonIcon className="h-5 w-5" />,
      themeJson: {
        theme: "dark",
        primary: "#428ee5",
        background: "#1a202c",
      },
    },
  ];

  const publicReviewBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const businessSlug = tenant?.slug || "your-business";
  const publicRecordUrl = `${publicReviewBaseUrl}/record/${tenant?.slug}`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Widget Management
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Create, customize, and embed your review widgets
              </p>
            </div>
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-4">
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

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        {/* Account Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
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

        {/* Widgets Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <CodeBracketIcon className="w-8 h-8 mr-3 text-blue-600" />
                  Widget Library
                </h2>
                <p className="text-gray-600">
                  Create and manage your embeddable review widgets
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    layout: "CAROUSEL",
                    themeJson: {
                      theme: "light",
                      primary: "#428ee5",
                      background: "#fff",
                      autoplay: true,
                    },
                    isActive: true,
                  });
                  setShowEditModal(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create New Widget
              </button>
            </div>
          </div>

          <div className="p-6">
            {widgets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {widgets.map((widget, index) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`bg-white border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                      selectedWidget?.id === widget.id
                        ? "border-blue-500 shadow-lg bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {widget.name}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              widget.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {widget.isActive ? (
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 mr-1" />
                            )}
                            {widget.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {widget.layout}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          12
                        </div>
                        <div className="text-sm text-gray-500">Total Views</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          3
                        </div>
                        <div className="text-sm text-gray-500">Embeds</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWidget(widget);
                          setShowEmbedModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"
                      >
                        <CodeBracketIcon className="w-4 h-4 mr-2" />
                        Get Code
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            id: widget.id,
                            name: widget.name,
                            layout: widget.layout,
                            themeJson: widget.themeJson,
                            isActive: widget.isActive,
                          });
                          setShowEditModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-semibold text-sm"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWidget(widget);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidget(widget);
                        }}
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          widget.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {widget.isActive ? (
                          <XCircleIcon className="w-4 h-4 mr-2" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                        )}
                        {widget.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CodeBracketIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  No Widgets Yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Create your first widget to start embedding reviews on your
                  website
                </p>
                <button
                  onClick={() => {
                    setFormData({
                      name: "",
                      layout: "CAROUSEL",
                      themeJson: {
                        theme: "light",
                        primary: "#428ee5",
                        background: "#fff",
                        autoplay: true,
                      },
                      isActive: true,
                    });
                    setShowEditModal(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your First Widget
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Selected Widget Preview */}
        {selectedWidget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <EyeIcon className="w-8 h-8 mr-3 text-blue-600" />
                Widget Preview: "{selectedWidget.name}"
              </h2>
              <p className="text-gray-600">
                Live preview of how your widget will appear on your website
              </p>
            </div>
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Configure "{selectedWidget.name}"
            </h2> */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Layout
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {layouts.map((layout) => (
                    <button
                      key={layout.value}
                      onClick={() => handleUpdateWidget("layout", layout.value)}
                      disabled={!hasFeature(layout.feature)}
                      className={`px-4 py-3 w-full font-semibold text-sm transition-colors rounded-lg border-2
                        ${
                          selectedWidget.layout === layout.value
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        } ${
                        !hasFeature(layout.feature)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                      `}
                    >
                      {layout.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() =>
                        handleUpdateWidget("themeJson", {
                          ...selectedWidget.themeJson,
                          ...theme.themeJson,
                        })
                      }
                      className={`flex items-center justify-center px-4 py-3 w-full font-semibold text-sm transition-colors rounded-lg border-2
                        ${
                          selectedWidget.themeJson?.theme === theme.value
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }
                      `}
                    >
                      {theme.icon}
                      <span className="ml-2">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mt-6">
              <span className="text-sm font-medium text-gray-700">
                Autoplay Videos
              </span>
              <button
                onClick={() =>
                  handleUpdateWidget("themeJson", {
                    ...selectedWidget.themeJson,
                    autoplay: !selectedWidget.themeJson?.autoplay,
                  })
                }
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full
                  ${
                    selectedWidget.themeJson?.autoplay
                      ? "bg-orange-500"
                      : "bg-gray-200"
                  }
                `}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 bg-white shadow transform ring-0 transition ease-in-out duration-200 rounded-full
                    ${
                      selectedWidget.themeJson?.autoplay
                        ? "translate-x-5"
                        : "translate-x-0"
                    }
                  `}
                ></span>
              </button>
            </div> */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Layout:
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedWidget.layout}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      Theme:
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedWidget.themeJson?.theme || "Light"}
                    </span>
                  </div>
                  {!hasFeature("widget_embed") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      <p className="text-sm text-red-600 font-semibold">
                        Widget embedding requires a premium plan
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <PublicReviews />
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
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 border-b border-gray-100">
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
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl border-2 border-dashed border-gray-300">
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
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
            <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {formData?.id ? "Edit Widget" : "Create New Widget"}
            </h4>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Name
                </label>
                <input
                  type="text"
                  value={formData?.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="e.g., Homepage Carousel"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Layout
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {layouts.map((layout) => (
                    <button
                      type="button"
                      key={layout.value}
                      onClick={() =>
                        setFormData({ ...formData, layout: layout.value })
                      }
                      disabled={!hasFeature(layout.feature)}
                      className={`px-4 py-3 w-full font-semibold text-sm transition-colors rounded-lg border-2
                          ${
                            formData?.layout === layout.value
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          } ${
                        !hasFeature(layout.feature)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                        `}
                    >
                      {layout.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      type="button"
                      key={theme.value}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          themeJson: {
                            ...formData.themeJson,
                            ...theme.themeJson,
                          },
                        })
                      }
                      className={`flex items-center justify-center px-4 py-3 w-full font-semibold text-sm transition-colors rounded-lg border-2
                          ${
                            formData?.themeJson?.theme === theme.value
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }
                        `}
                    >
                      {theme.icon}
                      <span className="ml-2">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                <label
                  htmlFor="autoplay-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Autoplay Videos
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      themeJson: {
                        ...formData.themeJson,
                        autoplay: !formData.themeJson?.autoplay,
                      },
                    })
                  }
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full
                      ${
                        formData?.themeJson?.autoplay
                          ? "bg-orange-500"
                          : "bg-gray-200"
                      }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 bg-white shadow transform ring-0 transition ease-in-out duration-200 rounded-full
                        ${
                          formData?.themeJson?.autoplay
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                  ></span>
                </button>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData(null);
                  }}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                >
                  {formData?.id ? "Save Changes" : "Create Widget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal for Embed Codes --- */}
      {selectedWidget && showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-800">
                Embed "{selectedWidget.name}"
              </h4>
              <button
                onClick={() => setShowEmbedModal(false)}
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

            <p className="text-gray-600 mb-6">
              Copy the code below to add this widget to your website.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  WordPress Shortcode
                </p>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`[truetestify_widget id="${selectedWidget.id}"]`}
                    className="w-full pl-3 pr-12 py-2 bg-white rounded-md border border-gray-300 text-sm text-gray-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `[truetestify_widget id="${selectedWidget.id}"]`
                      );
                      toast.success("Shortcode copied!");
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-orange-500"
                  >
                    <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    JavaScript Embed
                  </p>
                  <div className="relative">
                    <pre className="w-full pl-3 pr-12 py-2 bg-white rounded-md border border-gray-300 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">{`<script src="https://cdn.truetestify.com/widget.js" data-widget-id="${selectedWidget.id}"></script>`}</pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `<script src="https://cdn.truetestify.com/widget.js" data-widget-id="${selectedWidget.id}"></script>`
                        );
                        toast.success("Code copied!");
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-500"
                    >
                      <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Iframe Embed
                  </p>
                  <div className="relative">
                    <pre className="w-full pl-3 pr-12 py-2 bg-white rounded-md border border-gray-300 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">{`<iframe src="${publicReviewBaseUrl}/public-reviews/${business?.slug}?widgetId=${selectedWidget.id}" style="width:100%;height:420px;border:0;" loading="lazy"></iframe>`}</pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `<iframe src="${publicReviewBaseUrl}/public-reviews/${business?.slug}?widgetId=${selectedWidget.id}" style="width:100%;height:420px;border:0;" loading="lazy"></iframe>`
                        );
                        toast.success("Code copied!");
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-500"
                    >
                      <ArrowUpOnSquareStackIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetSettings;
