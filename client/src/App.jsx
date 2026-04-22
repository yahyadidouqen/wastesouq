import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublishPage from "./pages/PublishPage";
import BrowsePage from "./pages/BrowsePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
<<<<<<< HEAD
=======
import BuyerProfilePage from "./pages/BuyerProfilePage";
import MatchesPage from "./pages/MatchesPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67

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
          <Route path="/dashboard" element={<DashboardPage />} />
<<<<<<< HEAD
=======
          <Route path="/buyer-profile" element={<BuyerProfilePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}