import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PWABanner from "./components/PWABanner";

const PublishPage = lazy(() => import("./pages/PublishPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const BuyerProfilePage = lazy(() => import("./pages/BuyerProfilePage"));
const MatchesPage = lazy(() => import("./pages/MatchesPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const OTPPage = lazy(() => import("./pages/OTPPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PWABanner />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #0a2e1a, #1B4332)" }}>
            <div className="text-white text-xl font-bold animate-pulse">♻️ Chargement...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<PublishPage />} />
            <Route path="/annonces" element={<BrowsePage />} />
            <Route path="/annonces/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/verify-otp" element={<OTPPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/buyer-profile" element={<BuyerProfilePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
