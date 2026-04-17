import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MATERIAL_COLORS = {
  "Plastique": "#3B82F6", "Métal": "#6B7280", "Papier & Carton": "#D97706",
  "Verre": "#06B6D4", "Bois": "#92400E", "Textile": "#EC4899",
  "Déchets organiques": "#16A34A", "Gravats & Construction": "#78716C",
  "Électronique": "#7C3AED", "Autre": "#1B4332"
};

const MATERIAL_ICONS = {
  "Plastique": "🧴", "Métal": "⚙️", "Papier & Carton": "📦", "Verre": "🍶",
  "Bois": "🪵", "Textile": "🧵", "Déchets organiques": "🌿",
  "Gravats & Construction": "🧱", "Électronique": "💻", "Autre": "♻️"
};

function ScoreRing({ score }) {
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#F4A261" : "#6B7280";
  return (
    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 shrink-0"
      style={{ borderColor: color }}>
      <span className="text-lg font-black" style={{ color }}>{score}</span>
      <span className="text-xs text-gray-400" style={{ fontSize: 9 }}>/ 100</span>
    </div>
  );
}

function MatchCard({ match }) {
  const { listing, score, breakdown, distance } = match;
  const color = MATERIAL_COLORS[listing.materialType] || "#1B4332";
  const icon = MATERIAL_ICONS[listing.materialType] || "♻️";
  const phoneClean = listing.contact?.phone?.replace(/\D/g, "");
  const date = new Date(listing.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {/* Image or icon */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-2xl"
            style={{ background: `${color}15` }}>
            {listing.photo
              ? <img src={`http://localhost:5000${listing.photo}`} className="w-full h-full object-cover" alt="" />
              : icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-gray-900 text-lg">{listing.materialType}</h3>
            <p className="text-gray-400 text-xs">📍 {listing.location?.city} · {date}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-black text-xl" style={{ color }}>{listing.quantity}</span>
              <span className="text-gray-400 text-sm">{listing.unit}</span>
              {distance && <span className="text-gray-300 text-xs">· ~{distance} km</span>}
            </div>
          </div>

          <ScoreRing score={score} />
        </div>

        {/* Score breakdown */}
        <div className="bg-gray-50 rounded-2xl p-3 mb-4 space-y-2">
          <p className="text-xs font-bold text-gray-500 mb-2">Détail du score</p>
          {[
            { label: "Type de matière", value: breakdown.materialMatch, max: 40, icon: "♻️" },
            { label: "Proximité", value: breakdown.distanceScore, max: 35, icon: "📍" },
            { label: "Quantité", value: breakdown.quantityScore, max: 25, icon: "⚖️" },
          ].map(({ label, value, max, icon }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs w-4">{icon}</span>
              <span className="text-xs text-gray-500 w-28">{label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${(value / max) * 100}%`, backgroundColor: value === max ? "#16A34A" : "#F4A261" }} />
              </div>
              <span className="text-xs font-bold text-gray-600 w-10 text-right">{value}/{max}</span>
            </div>
          ))}
        </div>

        {listing.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">{listing.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/annonces/${listing._id}`}
            className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-bold text-center hover:bg-gray-200 transition">
            👁️ Voir l'annonce
          </Link>
          <a href={`tel:${phoneClean}`}
            className="px-4 py-2.5 rounded-2xl bg-white border-2 text-xs font-bold transition hover:scale-105"
            style={{ borderColor: color, color }}>
            📞
          </a>
          {listing.contact?.whatsapp && (
            <a href={`https://wa.me/${phoneClean}?text=Bonjour, je suis intéressé par votre annonce WasteSouq : ${listing.materialType} (${listing.quantity} ${listing.unit}) à ${listing.location?.city}.`}
              target="_blank" rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl text-white text-xs font-bold transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              💬
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get("/api/buyers/matches");
        setMatches(res.data.matches || []);
        if (res.data.message) setMessage(res.data.message);
      } catch {
        setMessage("Erreur lors du chargement des matches.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMatches();
  }, [user]);

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <div className="text-white text-xl font-bold animate-pulse">Recherche des meilleurs matches...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm">← Retour</button>
        <span className="text-white font-black text-lg">♻️ Waste<span style={{ color: "#F4A261" }}>Souq</span></span>
        <Link to="/buyer-profile" className="text-[#F4A261] text-xs font-bold hover:underline">⚙️ Profil</Link>
      </div>

      <div className="max-w-lg mx-auto px-4 fade-up">

        {/* Header */}
        <div className="text-center py-4 mb-6">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-black text-white">Vos Matches</h1>
          <p className="text-white/50 text-sm mt-1">
            {matches.length > 0
              ? `${matches.length} annonce(s) correspondent à votre profil`
              : "Annonces correspondant à votre profil"}
          </p>
        </div>

        {/* No profile configured */}
        {message && matches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white text-lg font-bold mb-2">Profil non configuré</p>
            <p className="text-white/50 text-sm mb-6">{message}</p>
            <Link to="/buyer-profile"
              className="inline-block px-6 py-3 rounded-2xl text-white font-bold shadow-xl hover:scale-105 transition"
              style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
              ⚙️ Configurer mon profil
            </Link>
          </div>
        )}

        {/* No matches */}
        {!message && matches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white text-lg font-bold mb-2">Aucun match pour l'instant</p>
            <p className="text-white/50 text-sm mb-6">Revenez plus tard ou élargissez vos critères.</p>
            <div className="flex flex-col gap-3 items-center">
              <Link to="/buyer-profile"
                className="px-6 py-3 rounded-2xl text-white font-bold shadow-xl hover:scale-105 transition"
                style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
                ⚙️ Modifier mes préférences
              </Link>
              <Link to="/annonces" className="text-white/50 text-sm hover:text-white">
                Voir toutes les annonces →
              </Link>
            </div>
          </div>
        )}

        {/* Matches list */}
        {matches.length > 0 && (
          <div className="space-y-4">
            {/* Score legend */}
            <div className="flex gap-3 justify-center mb-2">
              {[["#16A34A","≥ 80 Excellent"],["#F4A261","≥ 60 Bon"],["#6B7280","< 60 Partiel"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-white/50 text-xs">{l}</span>
                </div>
              ))}
            </div>

            {matches.map((match, i) => (
              <MatchCard key={match.listing._id || i} match={match} />
            ))}

            <div className="text-center pt-4">
              <Link to="/buyer-profile" className="text-white/40 text-xs hover:text-white/70 transition">
                ⚙️ Modifier mes préférences
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}