import { useLocation } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";

// Core Components (Always loaded)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingReviewWidget from "./components/FloatingReviewWidget";
import EmailVerification from "./components/EmailVerification";
import Onboarding from "./components/Onboarding";
import Auth0ProtectedRoute from "./components/Auth0ProtectedRoute";
import PaymentGuard from "./components/PaymentGuard";
import NotFound from "./pages/NotFound";
import AdminSettings from "./pages/Dashboard/AdminSettings";

// Lazy loaded components for better performance
const Home = lazy(() => import("./pages/Home/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Support = lazy(() => import("./pages/Support"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Features = lazy(() => import("./components/Features"));

// Auth Components
const Auth0Login = lazy(() => import("./pages/Auth0Login"));
const Auth0Signup = lazy(() => import("./pages/Auth0Signup"));
const CreateBusiness = lazy(() => import("./pages/CreateBusiness"));

// Public Review Components
const PublicReviews = lazy(() => import("./pages/PublicReviews"));
const RecordReview = lazy(() => import("./pages/RecordReview"));

// Dashboard Components
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Moderation = lazy(() => import("./pages/Dashboard/Moderation"));
const Analytics = lazy(() => import("./pages/Dashboard/Analytics"));
const BusinessDashboard = lazy(() => import("./pages/Dashboard/BusinessDashboard"));
const WidgetSettings = lazy(() => import("./pages/Dashboard/WidgetSettings"));
const GoogleReviews = lazy(() => import("./pages/Dashboard/GoogleReviews"));
const Account = lazy(() => import("./pages/Account"));
const Billing = lazy(() => import("./pages/Billing"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
);

function App() {
  const { user, tenant, needsOnboarding } = useContext(AuthContext);
  const { isAuthenticated, user: auth0User, isLoading } = useAuth0();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isOnboardingRoute = location.pathname === "/onboarding";
  const isCreateBusinessRoute = location.pathname === "/create-business";
  const isPublicRoute = location.pathname.startsWith("/record/") || 
                       (!location.pathname.startsWith("/dashboard") && 
                        !location.pathname.startsWith("/auth0") &&
                        !location.pathname.startsWith("/onboarding") &&
                        !location.pathname.startsWith("/create-business"));

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // SaaS Flow: Email Verification Required
  if (isAuthenticated && auth0User && !auth0User.email_verified) {
    return <EmailVerification />;
  }

  // SaaS Flow: Business Setup Required (Onboarding)
  if (isAuthenticated && auth0User && auth0User.email_verified && needsOnboarding && !isOnboardingRoute && !isCreateBusinessRoute) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Navbar - Only show on public routes */}
      {isPublicRoute && <Navbar />}

      {/* Main content area */}
      <main className={`flex-1 w-full ${isPublicRoute ? "max-w-7xl mx-auto p-4 mt-5 pb-32" : ""}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Marketing Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/features" element={<Features />} />

            {/* Auth Routes */}
            <Route path="/auth0-login" element={<Auth0Login />} />
            <Route path="/auth0-signup" element={<Auth0Signup />} />
            
            {/* Onboarding Flow */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/create-business" element={<CreateBusiness />} />

            {/* Public Review Routes */}
            <Route path="/record/:businessName" element={<RecordReview />} />
            <Route path="/:businessName" element={<PublicReviews />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <Auth0ProtectedRoute>
                  <PaymentGuard>
                    <DashboardLayout />
                  </PaymentGuard>
                </Auth0ProtectedRoute>
              }
            >
              <Route index element={<Moderation />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="business/me" element={<BusinessDashboard />} />
              <Route path="widgets" element={<WidgetSettings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="account" element={<Account />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="google-reviews" element={<GoogleReviews />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer and Floating Widget - Only on public routes */}
      {isPublicRoute && (
        <>
          <Footer />
          <FloatingReviewWidget />
        </>
      )}
    </div>
  );
}

export default App;
