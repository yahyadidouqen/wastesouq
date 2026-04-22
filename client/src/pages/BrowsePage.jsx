import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const MATERIALS = [
  "Tous", "Plastique", "Métal", "Papier & Carton", "Verre",
  "Bois", "Textile", "Déchets organiques", "Gravats & Construction", "Électronique", "Autre"
];

const MATERIAL_ICONS = {
  "Plastique": "🧴", "Métal": "⚙️", "Papier & Carton": "📦", "Verre": "🍶",
  "Bois": "🪵", "Textile": "🧵", "Déchets organiques": "🌿",
  "Gravats & Construction": "🧱", "Électronique": "💻", "Autre": "♻️", "Tous": "🌍"
};

const MATERIAL_COLORS = {
  "Plastique": "#3B82F6", "Métal": "#6B7280", "Papier & Carton": "#D97706",
  "Verre": "#06B6D4", "Bois": "#92400E", "Textile": "#EC4899",
  "Déchets organiques": "#16A34A", "Gravats & Construction": "#78716C",
  "Électronique": "#7C3AED", "Autre": "#1B4332"
};

function ListingCard({ listing, onClick }) {
  const [hovered, setHovered] = useState(false);
  const color = MATERIAL_COLORS[listing.materialType] || "#1B4332";
  const icon = MATERIAL_ICONS[listing.materialType] || "♻️";
  const date = new Date(listing.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? "translateY(-6px)" : "translateY(0)", transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)", cursor: "pointer" }}
      className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl group"
    >
      <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
        {listing.photo ? (
          <img src={`http://localhost:5000${listing.photo}`} alt={listing.materialType}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: 64 }}>{icon}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow"
          style={{ backgroundColor: color }}>
          {icon} {listing.materialType}
        </div>
        {listing.contact?.whatsapp && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            💬 WhatsApp
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{listing.materialType}</h3>
            <p className="text-gray-400 text-sm mt-0.5">📍 {listing.location?.city}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black" style={{ color }}>{listing.quantity}</div>
            <div className="text-xs text-gray-400 font-medium">{listing.unit}</div>
          </div>
        </div>
        {listing.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{listing.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{date}</span>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow"
            style={{ backgroundColor: color }}>
            Voir l'annonce →
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
        <div className="h-9 bg-gray-100 rounded-xl w-1/3 ml-auto mt-4" />
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMaterial, setActiveMaterial] = useState(searchParams.get("materialType") || "Tous");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeMaterial !== "Tous") params.materialType = activeMaterial;
      if (city.trim()) params.city = city.trim();
      const res = await axios.get("http://localhost:5000/api/listings", { params });
      setListings(res.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [activeMaterial, city]);

  const filtered = listings
    .filter((l) => !search ||
      l.materialType.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "recent"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : b.quantity - a.quantity);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>

      {/* Hero */}
      <div className="px-4 pt-12 pb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #52b788, transparent)", transform: "translate(-50%, -40%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-white/80 text-xs font-medium mb-4 border border-white/20">
            ♻️ Marketplace du recyclage · Maroc
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            Waste<span style={{ color: "#F4A261" }}>Souq</span>
          </h1>
          <p className="text-white/60 text-sm mb-8">
            {loading ? "Chargement..." : `${listings.length} annonce${listings.length !== 1 ? "s" : ""} disponible${listings.length !== 1 ? "s" : ""}`}
          </p>
          <div className="max-w-xl mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une matière, une ville..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-sm font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur border-t border-white/10 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
            {MATERIALS.map((m) => (
              <button key={m} onClick={() => setActiveMaterial(m)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all
                  ${activeMaterial === m ? "bg-[#F4A261] text-white shadow-lg scale-105" : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"}`}>
                <span>{MATERIAL_ICONS[m]}</span>
                <span className="hidden sm:inline">{m}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📍</span>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="Filtrer par ville..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none cursor-pointer">
              <option value="recent" className="text-gray-800">🕐 Plus récents</option>
              <option value="quantity" className="text-gray-800">⚖️ Plus grande quantité</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-white text-xl font-bold mb-2">Aucune annonce trouvée</h3>
            <p className="text-white/50 text-sm">Essayez un autre filtre ou revenez plus tard.</p>
          </div>
        ) : (
          <>
            <p className="text-white/50 text-sm mb-5">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing) => (
                <ListingCard key={listing._id} listing={listing}
                  onClick={() => navigate(`/annonces/${listing._id}`)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
<<<<<<< HEAD
=======
        <button onClick={() => navigate("/matches")}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6d28d9)" }}>
          🎯 Mes Matches
        </button>
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1B4332, #2d6a4f)" }}>
          📊 Dashboard
        </button>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
          <span className="text-lg">+</span> Publier
        </button>
      </div>
    </div>
  );
}
