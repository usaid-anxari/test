import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Account from "../../pages/Account";

const AdminSettings = () => {
  const { getInitialData, hasFeature } = useContext(AuthContext);
  const [allowTextReviews, setAllowTextReviews] = useState(
    getInitialData("allowTextReviews", false)
  );
  const [allowTextGoogleReviews, setAllowTextGoogleReviews] = useState(
    getInitialData("allowTextGoogleReviews", false)
  );

  const handleToggle = () => {
    const newSetting = !allowTextReviews;
    localStorage.setItem("allowTextReviews", JSON.stringify(newSetting));
    setAllowTextReviews(newSetting);
    toast.success(
      `Text reviews are now ${newSetting ? "enabled" : "disabled"}.`
    );
  };

  const handleToggleGoogleReviews = () => {
    const newSetting = !allowTextGoogleReviews;
    localStorage.setItem("allowTextGoogleReviews", JSON.stringify(newSetting));
    setAllowTextGoogleReviews(newSetting);
    toast.success(
      `Text Google reviews are now ${newSetting ? "enabled" : "disabled"}.`
    );
  };

  const [logoUrl, setLogoUrl] = useState(
    JSON.parse(localStorage.getItem("brandLogoUrl") || "null")
  );
  const [primaryColor, setPrimaryColor] = useState(
    JSON.parse(localStorage.getItem("brandPrimaryColor") || '"#1f2937"')
  );
  const [showConsent, setShowConsent] = useState(
    JSON.parse(localStorage.getItem("showConsent") || "true")
  );

  const saveBranding = () => {
    localStorage.setItem("brandLogoUrl", JSON.stringify(logoUrl || ""));
    localStorage.setItem(
      "brandPrimaryColor",
      JSON.stringify(primaryColor || "#1f2937")
    );
    toast.success("Branding updated");
  };

  const saveConsent = () => {
    localStorage.setItem("showConsent", JSON.stringify(showConsent));
    toast.success("Consent preference saved");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Admin Settings
      </h2>

      {/* Enable Text Reviews */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Enable Text Reviews
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Allow users to submit a text-based review instead of just video
              and audio.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleToggle}
              disabled={!hasFeature("advanced_moderation")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                allowTextReviews ? "bg-orange-500" : "bg-gray-200"
              } ${
                !hasFeature("advanced_moderation")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  allowTextReviews ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        {!hasFeature("advanced_moderation") && (
          <p className="text-xs text-gray-500 mt-2">
            Upgrade to Pro to unlock this feature.
          </p>
        )}
      </div>

      {/* Enable Text Google Reviews */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Enable Text Google Reviews
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Allow users to submit a text-based Google review instead of just
              video and audio.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleToggleGoogleReviews}
              disabled={!hasFeature("advanced_moderation")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                allowTextGoogleReviews ? "bg-orange-500" : "bg-gray-200"
              } ${
                !hasFeature("advanced_moderation")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  allowTextGoogleReviews ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        {!hasFeature("advanced_moderation") && (
          <p className="text-xs text-gray-500 mt-2">
            Upgrade to Pro to unlock this feature.
          </p>
        )}
      </div>

      {/* Branding */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              placeholder="https://yourlogo.com/logo.png"
              value={logoUrl || ""}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{primaryColor}</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={saveBranding}
              className="w-full py-2 px-4 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Save Branding
            </button>
          </div>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Require Consent Checkbox
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              Show consent confirmation before allowing a review submission.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowConsent(!showConsent)}
              onBlur={saveConsent}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                showConsent ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  showConsent ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
