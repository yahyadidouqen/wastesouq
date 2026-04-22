import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MATERIALS = [
  { label: "Plastique", icon: "🧴", color: "#3B82F6" },
  { label: "Métal", icon: "⚙️", color: "#6B7280" },
  { label: "Papier & Carton", icon: "📦", color: "#D97706" },
  { label: "Verre", icon: "🍶", color: "#06B6D4" },
  { label: "Bois", icon: "🪵", color: "#92400E" },
  { label: "Textile", icon: "🧵", color: "#EC4899" },
  { label: "Déchets organiques", icon: "🌿", color: "#16A34A" },
  { label: "Gravats & Construction", icon: "🧱", color: "#78716C" },
  { label: "Électronique", icon: "💻", color: "#7C3AED" },
  { label: "Autre", icon: "♻️", color: "#1B4332" },
];

const UNITS = ["kg", "tonnes", "litres", "unités"];

export default function BuyerProfilePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [form, setForm] = useState({
    interestedIn: [],
    minQuantity: "",
    maxQuantity: "",
    unit: "kg",
    city: "",
    lat: null,
    lng: null,
    radius: 100,
    notificationsEnabled: true,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/buyers/profile");
        if (res.data.profile) {
          const p = res.data.profile;
          setForm({
            interestedIn: p.interestedIn || [],
            minQuantity: p.minQuantity || "",
            maxQuantity: p.maxQuantity === 999999 ? "" : p.maxQuantity || "",
            unit: p.unit || "kg",
            city: p.location?.city || "",
            lat: p.location?.lat || null,
            lng: p.location?.lng || null,
            radius: p.radius || 100,
            notificationsEnabled: p.notificationsEnabled !== false,
          });
        }
      } catch {}
      finally { setLoading(false); }
    };
    if (user) fetchProfile();
  }, [user]);

  const toggleMaterial = (label) => {
    setForm((f) => ({
      ...f,
      interestedIn: f.interestedIn.includes(label)
        ? f.interestedIn.filter((m) => m !== label)
        : [...f.interestedIn, label],
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || "Position détectée";
        setForm((f) => ({ ...f, city, lat: latitude, lng: longitude }));
      } catch {
        setForm((f) => ({ ...f, lat: latitude, lng: longitude }));
      }
      setDetecting(false);
    }, () => setDetecting(false));
  };

  const handleSave = async () => {
    if (form.interestedIn.length === 0) {
      showToast("Sélectionnez au moins une matière.", "error"); return;
    }
    if (!form.city) {
      showToast("Indiquez votre ville.", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/buyers/profile", {
        interestedIn: form.interestedIn,
        minQuantity: form.minQuantity || 0,
        maxQuantity: form.maxQuantity || 999999,
        unit: form.unit,
        city: form.city,
        lat: form.lat,
        lng: form.lng,
        radius: form.radius,
        notificationsEnabled: form.notificationsEnabled,
      });
      showToast("Profil sauvegardé !");
      setTimeout(() => navigate("/matches"), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur serveur.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <div className="text-white text-xl font-bold animate-pulse">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm">← Retour</button>
        <span className="text-white font-black text-lg">♻️ Waste<span style={{ color: "#F4A261" }}>Souq</span></span>
        <Link to="/matches" className="text-[#F4A261] text-xs font-bold hover:underline">Mes matches →</Link>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4 fade-up">

        {/* Header */}
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-black text-white">Profil Acheteur</h1>
          <p className="text-white/50 text-sm mt-1">Configurez vos préférences pour recevoir les meilleures annonces</p>
        </div>

        {/* Materials */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">♻️ Matières recherchées</h2>
          <p className="text-gray-400 text-xs mb-4">Sélectionnez tout ce qui vous intéresse</p>
          <div className="grid grid-cols-2 gap-2">
            {MATERIALS.map((m) => {
              const selected = form.interestedIn.includes(m.label);
              return (
                <button key={m.label} onClick={() => toggleMaterial(m.label)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-left transition-all
                    ${selected ? "border-transparent text-white shadow-md" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}
                  style={selected ? { background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` } : {}}>
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-xs font-bold leading-snug ${selected ? "text-white" : "text-gray-700"}`}>{m.label}</span>
                  {selected && <span className="ml-auto text-white text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {form.interestedIn.length > 0 && (
            <p className="text-green-600 text-xs mt-3 font-medium">✅ {form.interestedIn.length} matière(s) sélectionnée(s)</p>
          )}
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">⚖️ Quantité souhaitée</h2>
          <p className="text-gray-400 text-xs mb-4">Indiquez vos besoins minimum et maximum</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Minimum</label>
              <input type="number" min="0" value={form.minQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-bold focus:outline-none focus:border-[#F4A261]" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Maximum</label>
              <input type="number" min="0" value={form.maxQuantity}
                onChange={(e) => setForm((f) => ({ ...f, maxQuantity: e.target.value }))}
                placeholder="Illimité"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-bold focus:outline-none focus:border-[#F4A261]" />
            </div>
          </div>
          <div className="flex rounded-2xl border-2 border-gray-100 bg-gray-50 overflow-hidden">
            {UNITS.map((u) => (
              <button key={u} onClick={() => setForm((f) => ({ ...f, unit: u }))}
                className={`flex-1 py-2.5 text-xs font-bold transition-all
                  ${form.unit === u ? "bg-[#1B4332] text-white" : "text-gray-400 hover:text-gray-600"}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">📍 Localisation</h2>
          <p className="text-gray-400 text-xs mb-4">Où cherchez-vous de la matière ?</p>
          <div className="flex gap-2 mb-3">
            <input type="text" value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Votre ville (ex: Casablanca)"
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261]" />
            <button onClick={detectLocation} disabled={detecting}
              className="px-3 py-3 bg-[#1B4332] text-white text-xs rounded-2xl hover:bg-[#2d6a4f] transition disabled:opacity-60 whitespace-nowrap">
              {detecting ? "⏳" : "📍 GPS"}
            </button>
          </div>
          {form.lat && <p className="text-green-600 text-xs mb-3">✅ Position GPS détectée</p>}

          {/* Radius */}
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-2 flex justify-between">
              <span>Rayon de recherche</span>
              <span className="text-[#1B4332] font-black">{form.radius} km</span>
            </label>
            <input type="range" min="10" max="500" step="10" value={form.radius}
              onChange={(e) => setForm((f) => ({ ...f, radius: Number(e.target.value) }))}
              className="w-full accent-[#1B4332]" />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>10 km</span><span>500 km</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div onClick={() => setForm((f) => ({ ...f, notificationsEnabled: !f.notificationsEnabled }))}
            className={`flex items-center justify-between cursor-pointer p-3 rounded-2xl transition-all
              ${form.notificationsEnabled ? "bg-green-50 border-2 border-green-300" : "bg-gray-50 border-2 border-gray-100"}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">Notifications actives</p>
                <p className="text-gray-400 text-xs">Recevez une alerte quand une annonce correspond</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all relative ${form.notificationsEnabled ? "bg-green-500" : "bg-gray-200"}`}
              style={{ width: 48, height: 26 }}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.notificationsEnabled ? "left-7" : "left-1"}`} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-3xl text-white font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
          {saving ? "💾 Sauvegarde..." : "🎯 Sauvegarder & Voir mes matches"}
        </button>

      </div>
    </div>
  );
}