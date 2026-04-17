
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ProgressBar from "../components/ProgressBar";
import ListingForm from "../components/ListingForm";

export default function PublishPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post("/api/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "✅ Votre annonce a été publiée avec succès !");
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue.";
      showToast("error", "❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <div className="text-white text-xl font-bold animate-pulse">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all
          ${toast.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">♻️ WasteSouq</h1>
          <p className="text-sm text-white/60 mt-1">Bonjour {user?.name?.split(" ")[0]} 👋</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/annonces" className="text-xs text-[#F4A261] underline font-medium">
              👀 Voir les annonces
            </Link>
            <Link to="/dashboard" className="text-xs text-[#F4A261] underline font-medium">
              📊 Mon dashboard
            </Link>
          </div>
        </div>
        <ProgressBar currentStep={1} />
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Publier une annonce</h2>
          <p className="text-sm text-white/60">Remplissez les informations sur votre matière recyclable</p>
        </div>
        <ListingForm onSubmit={handleSubmit} loading={loading} />
        <p className="text-center text-xs text-white/30 mt-6">
          WasteSouq · La marketplace marocaine du recyclage
        </p>
      </div>
    </div>
  );
}