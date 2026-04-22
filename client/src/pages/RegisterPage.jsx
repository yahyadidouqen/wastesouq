import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = ["", "Faible", "Moyen", "Bon", "Fort"];
const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = getStrength(form.password);

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Veuillez remplir tous les champs."); return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères."); return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas."); return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      navigate("/login", { state: { success: "Compte créé ! Vous pouvez vous connecter." } });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">♻️ Waste<span style={{ color: "#F4A261" }}>Souq</span></h1>
          <p className="text-white/50 text-sm mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #1B4332, #F4A261)" }} />
          <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Inscription</h2>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Nom complet</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📞 Téléphone</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {/* Password strength indicator */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                          style={{ backgroundColor: i <= strength ? strengthColor[strength] : "#e5e7eb" }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Confirmer le mot de passe</label>
                <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className={`w-full px-4 py-3 rounded-2xl border-2 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition
                    ${form.confirm && form.confirm !== form.password ? "border-red-300" : "border-gray-100"}`} />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 mt-2"
                style={{ background: "linear-gradient(135deg, #1B4332, #2d6a4f)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Création du compte...
                  </span>
                ) : "✅ Créer mon compte"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Déjà un compte ?{" "}
              <Link to="/login" className="font-bold text-[#1B4332] hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}