import {
  ArrowUpOnSquareStackIcon,
  MoonIcon,
  PuzzlePieceIcon,
  SunIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import PublicReviews from "../../pages/PublicReviews";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../service/axiosInstanse";
import { API_PATHS } from "../../service/apiPaths";

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
        await axiosInstance.put(
          API_PATHS.WIDGETS.UPDATE_WIDGET(formData.id),
          formData
        );
        toast.success("Widget updated successfully!");
        setSelectedWidget(formData);
      } else {
        const newWidgetData = {
          name: formData.name,
          layout: formData.layout,
          themeJson: formData.themeJson,
          isActive: formData.isActive,
        };
        await axiosInstance.post(
          API_PATHS.WIDGETS.CREATE_WIDGET(tenant.id),
          newWidgetData
        );
        toast.success("Widget created successfully!");
      }
      fetchWidgets(tenant?.id);
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
      await axiosInstance.put(
        API_PATHS.WIDGETS.UPDATE_WIDGET(selectedWidget.id),
        updatedWidget
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
      await axiosInstance.patch(API_PATHS.WIDGETS.TOGGLE_WIDGET(widget.id), {
        isActive: newIsActive,
      });
      toast.success(`Widget ${newIsActive ? "activated" : "deactivated"}!`);
      fetchWidgets(tenant?.id);
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Widgets & Embeds
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <PuzzlePieceIcon className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                TrueTestify Account
              </p>
              <p className="text-sm text-gray-500">
                Connected as{" "}
                <span className="font-medium text-gray-700">{user?.email}</span>
              </p>
            </div>
          </div>
          <button className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
            Disconnect
          </button>
        </div>

        {/* --- Widgets Management Section --- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Widgets</h2>
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
              className="px-6 py-2 font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
            >
              Create New
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Manage your testimonial widgets here. Click **"Edit"** to configure
            settings or **"Embed"** to get the code.
          </p>

          <div className="space-y-4">
            {widgets.length > 0 ? (
              widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`
                    flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg transition-all
                    ${
                      selectedWidget?.id === widget.id
                        ? "bg-gray-100 border-2 border-orange-500"
                        : "bg-white border-2 border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">
                      {widget.name}
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                        ${
                          widget.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      `}
                      >
                        {widget.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Layout: {widget.layout}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWidget(widget);
                        setShowEmbedModal(true);
                      }}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
                      title="Get Embed Code"
                    >
                      <CodeBracketIcon className="h-5 w-5" />
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
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
                      title="Edit Widget"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWidget(widget);
                      }}
                      className={`
                        px-4 py-2 rounded-full font-semibold text-sm transition-colors
                        ${
                          widget.isActive
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }
                      `}
                      title={
                        widget.isActive
                          ? "Deactivate Widget"
                          : "Activate Widget"
                      }
                    >
                      {widget.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No widgets found. Click "Create New" to get started!
              </p>
            )}
          </div>
        </div>

        {/* --- Selected Widget Configuration & Live Preview --- */}
        {selectedWidget && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ArrowRightCircleIcon className="h-6 w-6 mr-2 text-orange-500" />
                Live Preview
              </h3>
              <div className="border border-gray-300 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-4">
                  This is a live preview of how your widget will look with the
                  current settings.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <PublicReviews />
                </div>
                {!hasFeature("widget_embed") && (
                  <p className="mt-4 text-sm text-red-500 font-medium">
                    <span className="font-bold">Note:</span> Widget embedding is
                    not available on your current plan.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Offline Collection & QR Code --- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Offline Collection QR Code
          </h2>
          <p className="text-gray-600 mb-6">
            Print this QR on packaging, receipts, or displays. Scanning
            redirects customers to your public review page where they can submit
            a review.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Record review QR"
                  className="w-48 h-48 rounded-md"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center border border-dashed border-gray-300 text-gray-400 text-sm rounded-md">
                  Generating…
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-2">Target URL:</p>
              <span className="font-mono text-gray-800 break-all bg-gray-100 px-3 py-1 rounded-md">
                {publicRecordUrl}
              </span>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadQr}
                  className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
                >
                  Download QR Code
                </button>
                <a
                  href={`/record/${businessSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors text-center"
                >
                  Open Review Page
                </a>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default WidgetSettings;
