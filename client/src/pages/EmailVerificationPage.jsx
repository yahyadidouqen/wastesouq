import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserFromGoogle } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId) { navigate("/register"); return; }
    inputs.current[0]?.focus();
    const timer = setInterval(() => setCountdown((c) => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Entrez le code à 6 chiffres."); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-email", { userId, otp: code });
      setSuccess("✅ Email vérifié ! Connexion en cours...");
      // Auto login after verification
      setUserFromGoogle({ token: res.data.accessToken, user: res.data.user });
      setTimeout(() => navigate("/annonces"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Code incorrect.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await api.post("/api/auth/resend-verification", { userId });
      setCountdown(60);
      setError("");
      setSuccess("Nouveau code envoyé !");
      setTimeout(() => setSuccess(""), 3000);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du renvoi.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      <div className="w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">♻️ Waste<span style={{ color: "#F4A261" }}>Souq</span></h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #1B4332, #F4A261)" }} />
          <div className="p-8 text-center">

            <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📧
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Vérifiez votre email</h2>
            <p className="text-gray-400 text-sm mb-1">Nous avons envoyé un code à</p>
            <p className="text-[#1B4332] font-bold text-sm mb-2">{email}</p>
            <p className="text-gray-400 text-xs mb-6">Entrez le code pour activer votre compte</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mb-4 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-2xl text-green-600 text-sm font-medium">
                {success}
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all focus:outline-none
                    ${digit ? "border-[#1B4332] bg-[#f0fdf4] text-[#1B4332]" : "border-gray-200 bg-gray-50"}
                    focus:border-[#F4A261] focus:bg-orange-50`}
                />
              ))}
            </div>

            <button onClick={handleVerify} disabled={loading || otp.join("").length < 6}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 mb-4"
              style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Vérification...
                </span>
              ) : "✅ Vérifier mon email"}
            </button>

            {/* Resend */}
            <div className="text-center mb-4">
              {countdown > 0 ? (
                <p className="text-gray-400 text-sm">
                  Renvoyer dans <span className="font-bold text-[#1B4332]">{countdown}s</span>
                </p>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  className="text-[#1B4332] text-sm font-bold hover:underline disabled:opacity-60">
                  {resending ? "Envoi..." : "🔄 Renvoyer le code"}
                </button>
              )}
            </div>

            {/* Terminal hint */}
            <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-400 text-left">
              💡 <strong>Mode développement :</strong> Si l'email n'est pas configuré, le code apparaît dans le terminal backend.
            </div>

            <button onClick={() => navigate("/register")}
              className="mt-4 text-gray-400 text-xs hover:text-gray-600 transition block mx-auto">
              ← Modifier mon email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}