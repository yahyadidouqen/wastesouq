import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-72 bg-white/10 rounded-3xl" />
      <div className="h-8 bg-white/10 rounded-full w-1/2" />
      <div className="h-4 bg-white/10 rounded-full w-1/3" />
      <div className="h-24 bg-white/10 rounded-2xl" />
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(res.data.listing);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <Skeleton />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <span className="text-6xl mb-4">🔍</span>
      <h2 className="text-white text-2xl font-black mb-2">Annonce introuvable</h2>
      <p className="text-white/50 mb-6 text-sm">Elle a peut-être été supprimée ou vendue.</p>
      <Link to="/annonces"
        className="px-6 py-3 rounded-2xl bg-[#F4A261] text-white font-bold text-sm hover:scale-105 transition">
        ← Retour aux annonces
      </Link>
    </div>
  );

  const color = MATERIAL_COLORS[listing.materialType] || "#1B4332";
  const icon = MATERIAL_ICONS[listing.materialType] || "♻️";
  const date = new Date(listing.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric"
  });
  const phoneClean = listing.contact?.phone?.replace(/\D/g, "");

  return (
    <div className="min-h-screen pb-32"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both}
        @keyframes zoomIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Top nav */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-medium">
          ← Retour
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">♻️</span>
          <span className="text-white font-black text-lg">Waste<span style={{ color: "#F4A261" }}>Souq</span></span>
        </div>
        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4 fade-up">

        {/* Image */}
        <div className="relative rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
          onClick={() => listing.photo && setImgZoomed(true)}>
          {listing.photo ? (
            <img src={`http://localhost:5000${listing.photo}`} alt={listing.materialType}
              className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-56 flex items-center justify-center">
              <span style={{ fontSize: 96 }}>{icon}</span>
            </div>
          )}
          {/* Status badge */}
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black shadow-lg
            ${listing.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
            {listing.status === "active" ? "✅ Disponible" : "❌ Indisponible"}
          </div>
        </div>

        {/* Image zoom modal */}
        {imgZoomed && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setImgZoomed(false)}
            style={{ animation: "zoomIn 0.2s ease both" }}>
            <img src={`http://localhost:5000${listing.photo}`} alt={listing.materialType}
              className="max-w-full max-h-full rounded-2xl shadow-2xl" />
            <button className="absolute top-4 right-4 text-white text-2xl">✕</button>
          </div>
        )}

        {/* Main info card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Color strip */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{icon}</span>
                  <h1 className="text-2xl font-black text-gray-900">{listing.materialType}</h1>
                </div>
                <p className="text-gray-400 text-sm">📅 Publié le {date}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-4xl font-black" style={{ color }}>{listing.quantity}</div>
                <div className="text-sm text-gray-400 font-semibold">{listing.unit}</div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-400 text-xs font-semibold mb-1">📍 Localisation</p>
                <p className="text-gray-900 font-bold">{listing.location?.city}</p>
                {listing.location?.coordinates?.lat && (
                  <a href={`https://maps.google.com/?q=${listing.location.coordinates.lat},${listing.location.coordinates.lng}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs mt-1 block font-medium hover:underline"
                    style={{ color }}>
                    Voir sur la carte →
                  </a>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-400 text-xs font-semibold mb-1">⚖️ Quantité</p>
                <p className="text-gray-900 font-bold">{listing.quantity} {listing.unit}</p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-gray-400 text-xs font-semibold mb-2">📝 Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* WhatsApp badge */}
            {listing.contact?.whatsapp && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <span className="text-xl">💬</span>
                <p className="text-green-700 text-sm font-semibold">Vendeur disponible sur WhatsApp</p>
              </div>
            )}
          </div>
        </div>

        {/* Similar listings teaser */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/10">
          <p className="text-white/60 text-xs font-semibold mb-1">💡 Vous cherchez ce type de matière ?</p>
          <p className="text-white text-sm font-bold">Voir toutes les annonces {listing.materialType}</p>
          <Link to={`/annonces?materialType=${listing.materialType}`}
            className="inline-block mt-2 text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:scale-105"
            style={{ background: color }}>
            Voir les annonces →
          </Link>
        </div>

      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(to top, #0a2e1a, transparent)" }}>
        <div className="max-w-lg mx-auto flex gap-3">
          <a href={`tel:${phoneClean}`}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-gray-900 font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition">
            📞 Appeler
          </a>
          {listing.contact?.whatsapp && (
            <a href={`https://wa.me/${phoneClean}?text=Bonjour, je suis intéressé par votre annonce sur WasteSouq : ${listing.materialType} (${listing.quantity} ${listing.unit}) à ${listing.location?.city}.`}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              💬 WhatsApp
            </a>
          )}
          {!listing.contact?.whatsapp && (
            <a href={`https://wa.me/${phoneClean}?text=Bonjour, je suis intéressé par votre annonce WasteSouq.`}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition"
              style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
              💬 Contacter
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
