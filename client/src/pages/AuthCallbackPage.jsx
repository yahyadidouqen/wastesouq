import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setUserFromGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const id = searchParams.get("id");
    const avatar = searchParams.get("avatar");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    if (token && id) {
      setUserFromGoogle({ token, user: { id, name, email, role, avatar } });
      navigate("/annonces");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #1B4332 50%, #2d6a4f 100%)" }}>
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙️</div>
        <p className="text-white font-bold text-lg">Connexion avec Google...</p>
        <p className="text-white/50 text-sm mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
}