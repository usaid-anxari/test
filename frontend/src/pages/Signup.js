import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { validateEmail } from "../service/helper";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [publicReviewUrl, setPublicReviewUrl] = useState("");

  // --- States for required fields ---
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#ffffff"); // Default color
  const [logo, setLogoFile] = useState(null); // State for the logo file

  // Use the mock signup function from the context
  const { signup } = useContext(AuthContext);
  const colorInputRef = useRef(null);
  const navigate = useNavigate();

  // Function to sanitize the business name for a URL
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  // Update the public review URL whenever the business name changes
  useEffect(() => {
    // The slug is derived from the business name, not a separate input.
    const newSlug = slugify(businessName);
    setSlug(newSlug);
    setPublicReviewUrl(newSlug);
  }, [businessName]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Check Email Condition
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    // Check Password Condition
    if (!password) {
      setError("Please enter password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!businessName) {
      setError("Please enter business name.");
      return;
    }

    // Check contact email validation.
    if (contactEmail && !validateEmail(contactEmail)) {
      setError("Please enter a valid contact email.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create a FormData object to handle both text fields and the file upload.
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("businessName", businessName);
      formData.append("slug", slug);
      formData.append("website", website);
      formData.append("contactEmail", contactEmail);
      formData.append("brandColor", brandColor);

      if (logo) {
        formData.append("logo", logo);
      }

      const result = await signup(formData);
      if (result.success) {
        toast.success("Registration successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is already handled in AuthContext
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Sign Up
      </h2>
      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 py-2 block w-full rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 py-2 block w-full rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 py-2 block w-full rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
              disabled={loading}
            />
          </div>
          {/* Conditional form fields for Admin role */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pt-4 border-t border-gray-200"
          >
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700"
              >
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                placeholder="Enter your business name"
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 block w-full py-2 rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="publicReviewUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Public Review URL
              </label>
              <div className="mt-1 flex items-center">
                <span className="bg-gray-200 text-gray-600 text-sm py-2 px-3 rounded-l-md border border-gray-400 border-r-0">
                  /
                </span>
                <input
                  type="text"
                  id="publicReviewUrl"
                  value={publicReviewUrl}
                  readOnly
                  placeholder="URL"
                  className="flex-grow px-3 py-2 border border-gray-400 rounded-r-md bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
                />
              </div>
              {publicReviewUrl.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Your public review page will be at `/{publicReviewUrl}`.
                </p>
              )}
            </div>

            {/* New fields added below */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                value={website}
                placeholder="https://example.com"
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 py-2 block w-full rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                placeholder="contact@example.com"
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 py-2 block w-full rounded-md border-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Color
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                  ref={colorInputRef}
                  disabled={loading}
                />
                <div
                  className="flex items-center space-x-2 p-2 rounded-md border border-gray-400 shadow-sm cursor-pointer"
                  onClick={() => colorInputRef.current.click()}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: brandColor }}
                  ></div>
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="Enter hex code (e.g., #ffffff)"
                    className="flex-1 py-1 px-2 text-sm rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo
              </label>
              <input
                type="file"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
                disabled={loading}
              />
            </div>
          </motion.div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-orange-500 text-white font-bold tracking-wide hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        {error && <p className="text-red-500 pb-2.5 text-xs">{error}</p>}
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
