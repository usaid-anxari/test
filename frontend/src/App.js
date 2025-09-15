import { useLocation } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import RecordReview from "./pages/RecordReview";
import PublicReviews from "./pages/PublicReviews";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminSettings from "./pages/Dashboard/AdminSettings";
import Moderation from "./pages/Dashboard/Moderation";
import Analytics from "./pages/Dashboard/Analytics";
import ManageSubscription from "./pages/Dashboard/ManageSubscrption";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import AdminProtectedRoute from "./service/AdminProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Features from "./components/Features";
import WidgetSettings from "./pages/Dashboard/WidgetSettings";
import Footer from "./components/Footer";
import FloatingReviewWidget from "./components/FloatingReviewWidget";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Navbar from "./components/Navbar";
import Integrations from "./pages/Integrations";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import Testimonial from "./pages/Testimonial";
import About from "./pages/About";
import VideoReviews from "./pages/Services/VideoReviews";
import AudioReviews from "./pages/Services/AudioReviews";
import TextReviews from "./pages/Services/TextReviews";
import QRCodeCollection from "./pages/Services/QRCodeCollection";
import CarouselWidget from "./pages/Widgets/CarouselWidget";
import GridWidget from "./pages/Widgets/GridWidget";
import SpotlightWidget from "./pages/Widgets/SpotlightWidget";
import WallWidget from "./pages/Widgets/WallWidget";
import GoogleEmbed from "./pages/GoogleEmbed";
import Document from "./pages/Document";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import BusinessDashboard from "./pages/Dashboard/BusinessDashboard";
import { Toaster } from "react-hot-toast";
import Auth0Signup from "./pages/Auth0Signup";
import Auth0Login from "./pages/Auth0Login";


// const Root = ()=>{
//   // Check Token
//   const isAuthenticated = !!localStorage.getItem("token")

//   // Redirect The Location
//   return isAuthenticated ?( <Navigate to='/dashboard'/> ): (<Navigate to='/login' />)

// }

function App() {
  const { user, tenant } = useContext(AuthContext);
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <>
      <div className="min-h-screen flex flex-col font-sans bg-gray-50">
        <Toaster position="top-center" reverseOrder={false} />
        {!isDashboardRoute && <Navbar />}

        {/* The main content area with a max-width and padding */}
        <main
          className={`flex-1 w-full ${
            !isDashboardRoute ? "max-w-7xl mx-auto p-4 mt-5 pb-32" : ""
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/services/video-reviews" element={<VideoReviews />} />
            <Route path="/services/audio-reviews" element={<AudioReviews />} />
            <Route path="/services/text-reviews" element={<TextReviews />} />
            <Route path="/widgets/carousel" element={<CarouselWidget />} />
            <Route path="/widgets/grid" element={<GridWidget />} />
            <Route path="/widgets/spotlight" element={<SpotlightWidget />} />
            <Route path="/widgets/wall" element={<WallWidget />} />
            <Route path="/docs" element={<Document />} />
            <Route path="/testimonial" element={<Testimonial />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reviews/google-embed" element={<GoogleEmbed />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/record/:businessName" element={<RecordReview />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route
              path="/services/qr-collection"
              element={<QRCodeCollection />}
            />
            <Route path=":businessName" element={<PublicReviews />} />
            <Route path="/auth0-signup" element={<Auth0Signup />} />
            <Route path="/auth0-login" element={<Auth0Login />} />

            {/* Dashboard routes for admins */}
            <Route
              path="/dashboard"
              element={
                <AdminProtectedRoute>
                  <DashboardLayout />
                </AdminProtectedRoute>
              }
            >
              <Route
                index
                element={<Moderation userInfo={user} business={tenant} />}
              />
              <Route path="moderation" element={<Moderation />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="business/me" element={<BusinessDashboard />} />
              <Route
                path="widget-settings"
                element={<WidgetSettings business={tenant} />}
              />
              <Route path="billing" element={<Billing />} />
              <Route
                path="account"
                element={<Account userInfo={user} business={tenant} />}
              />
              <Route
                path="manage-subscription"
                element={<ManageSubscription />}
              />
              <Route path="admin-settings" element={<AdminSettings />} />
            </Route>
            {/* A catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* The new Footer component */}
        {!isDashboardRoute && <Footer />}
        {!isDashboardRoute && <FloatingReviewWidget />}
      </div>
    </>
  );
}

export default App;
