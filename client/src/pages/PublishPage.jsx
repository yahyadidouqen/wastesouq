import { useState } from "react";
import axios from "axios";
import ProgressBar from "../components/ProgressBar";
import ListingForm from "../components/ListingForm";

export default function PublishPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "✅ Votre annonce a été publiée avec succès !");
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
      showToast("error", "❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D8F3DC] py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all
          ${toast.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#1B4332]">♻️ WasteSouq</h1>
          <p className="text-sm text-gray-500 mt-1">Transformez vos déchets en valeur</p>
        </div>

        <ProgressBar currentStep={1} />

        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#1B4332]">Publier une annonce</h2>
          <p className="text-sm text-gray-500">Remplissez les informations sur votre matière recyclable</p>
        </div>

        <ListingForm onSubmit={handleSubmit} loading={loading} />

        <p className="text-center text-xs text-gray-400 mt-6">
          WasteSouq · La marketplace marocaine du recyclage
        </p>
      </div>
    </div>
  );
}
