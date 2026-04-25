import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublishPage from "./pages/PublishPage";
import BrowsePage from "./pages/BrowsePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BuyerProfilePage from "./pages/BuyerProfilePage";
import MatchesPage from "./pages/MatchesPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import OTPPage from "./pages/OTPPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}