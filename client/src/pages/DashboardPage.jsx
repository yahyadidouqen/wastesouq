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

const STATUS_CONFIG = {
  active:  { label: "Disponible", color: "#16A34A", bg: "#f0fdf4", border: "#86efac" },
  sold:    { label: "Vendu",      color: "#D97706", bg: "#fffbeb", border: "#fcd34d" },
  expired: { label: "Expiré",    color: "#6B7280", bg: "#f9fafb", border: "#d1d5db" },
};

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-800 font-bold text-lg mb-2">Êtes-vous sûr ?</p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing, onStatusChange, onDelete }) {
  const color = MATERIAL_COLORS[listing.materialType] || "#1B4332";
  const icon = MATERIAL_ICONS[listing.materialType] || "♻️";
  const status = STATUS_CONFIG[listing.status] || STATUS_CONFIG.active;
  const date = new Date(listing.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Color bar */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${color}15` }}>
              {listing.photo
                ? <img src={`http://localhost:5000${listing.photo}`} alt="" className="w-full h-full object-cover rounded-2xl" />
                : icon}
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg leading-tight">{listing.materialType}</h3>
              <p className="text-gray-400 text-xs mt-0.5">📍 {listing.location?.city} · {date}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{ color: status.color, background: status.bg, borderColor: status.border }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Quantité</p>
            <p className="font-black text-gray-900">{listing.quantity} <span className="text-gray-400 font-normal text-sm">{listing.unit}</span></p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-gray-400 text-xs mb-0.5">Contact</p>
            <p className="font-bold text-gray-900 text-sm truncate">{listing.contact?.phone}</p>
          </div>
        </div>

        {listing.description && (
          <p className="text-gray-400 text-sm line-clamp-1 mb-4">{listing.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {/* Mark as sold */}
          {listing.status === "active" && (
            <button onClick={() => onStatusChange(listing._id, "sold")}
              className="flex-1 py-2.5 rounded-2xl text-white text-xs font-bold transition hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #D97706, #b45309)" }}>
              ✅ Marquer vendu
            </button>
          )}
          {listing.status === "sold" && (
            <button onClick={() => onStatusChange(listing._id, "active")}
              className="flex-1 py-2.5 rounded-2xl text-white text-xs font-bold transition hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #16A34A, #15803d)" }}>
              🔄 Remettre en ligne
            </button>
          )}

          {/* View */}
          <Link to={`/annonces/${listing._id}`}
            className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1">
            👁️ Voir
          </Link>

          {/* Delete */}
          <button onClick={() => onDelete(listing._id)}
            className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-xs font-semibold">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/listings/my");
      setListings(res.data.listings || []);
    } catch {
      showToast("Erreur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/listings/${id}`, JSON.stringify({ status }), {
        headers: { "Content-Type": "application/json" }
      });
      setListings((prev) => prev.map((l) => l._id === id ? { ...l, status } : l));
      showToast(status === "sold" ? "Annonce marquée comme vendue !" : "Annonce remise en ligne !");
    } catch {
      showToast("Erreur lors de la mise à jour.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/listings/${deleteId}`);
      setListings((prev) => prev.filter((l) => l._id !== deleteId));
      showToast("Annonce supprimée.");
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filtered = listings.filter((l) => filter === "all" || l.status === filter);
  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <div className="text-white text-xl font-bold animate-pulse">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <ConfirmModal
          message="Cette annonce sera définitivement supprimée."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Header */}
      <div className="px-5 pt-8 pb-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Dashboard</p>
            <h1 className="text-2xl font-black text-white mt-1">
              Bonjour, {user?.name?.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/annonces"
              className="px-4 py-2 rounded-2xl bg-white/10 text-white text-xs font-bold border border-white/20 hover:bg-white/20 transition">
              👀 Annonces
            </Link>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-2xl bg-white/10 text-white text-xs font-bold border border-white/20 hover:bg-red-500/50 transition">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6 fade-up">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total" value={stats.total} icon="📦" color="#1B4332" />
          <StatCard label="En ligne" value={stats.active} icon="✅" color="#16A34A" />
          <StatCard label="Vendues" value={stats.sold} icon="🏷️" color="#D97706" />
        </div>

        {/* Filter tabs + publish button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 bg-white/10 p-1 rounded-2xl border border-white/20">
            {[["all","Toutes"], ["active","En ligne"], ["sold","Vendues"], ["expired","Expirées"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                  ${filter === val ? "bg-white text-[#1B4332] shadow" : "text-white/60 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
          <Link to="/"
            className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-lg transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
            + Nouvelle annonce
          </Link>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white text-lg font-bold mb-2">Aucune annonce</p>
            <p className="text-white/50 text-sm mb-6">
              {filter === "all" ? "Vous n'avez pas encore publié d'annonce." : `Aucune annonce avec le statut "${filter}".`}
            </p>
            <Link to="/"
              className="inline-block px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-xl hover:scale-105 transition"
              style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
              + Publier ma première annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((listing) => (
              <ListingCard key={listing._id} listing={listing}
                onStatusChange={handleStatusChange}
                onDelete={(id) => setDeleteId(id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}