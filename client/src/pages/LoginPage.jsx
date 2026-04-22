<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
=======
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const [searchParams] = useSearchParams();
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
=======
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_failed") setError("Connexion Google échouée. Réessayez.");
    if (err === "server_error") setError("Erreur serveur. Réessayez.");
  }, []);

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/annonces");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      <div className="w-full max-w-md fade-up">
<<<<<<< HEAD
        {/* Logo */}
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">♻️ Waste<span style={{ color: "#F4A261" }}>Souq</span></h1>
          <p className="text-white/50 text-sm mt-2">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #1B4332, #F4A261)" }} />
          <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Connexion</h2>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

<<<<<<< HEAD
=======
            {/* Google Button */}
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all hover:scale-[1.01] active:scale-95 mb-5 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-bold text-gray-700 text-sm">Continuer avec Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition" />
              </div>
<<<<<<< HEAD

=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-[#F4A261] transition pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
=======
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
<<<<<<< HEAD

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 mt-2"
=======
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
                style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Connexion...
                  </span>
                ) : "🔐 Se connecter"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Pas encore de compte ?{" "}
<<<<<<< HEAD
              <Link to="/register" className="font-bold text-[#1B4332] hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          WasteSouq · La marketplace marocaine du recyclage
        </p>
=======
              <Link to="/register" className="font-bold text-[#1B4332] hover:underline">S'inscrire</Link>
            </p>
          </div>
        </div>
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
      </div>
    </div>
  );
}