import { useState } from "react";

export default function LocationPicker({ value, onChange, onCoords, error }) {
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Géolocalisation non supportée par votre navigateur.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "Position détectée";
          onChange(city);
        } catch {
          onChange("Position détectée");
        }
        setDetected(true);
        setDetecting(false);
      },
      () => {
        alert("Impossible de détecter votre position.");
        setDetecting(false);
      }
    );
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#1B4332] mb-2">
        📍 Localisation <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ville ou quartier (ex: Marrakech, Guéliz)"
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition
            ${error ? "border-red-400" : "border-gray-300"}
          `}
        />
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="px-3 py-2.5 bg-[#1B4332] text-white text-xs rounded-xl hover:bg-[#2d6a4f] transition whitespace-nowrap disabled:opacity-60"
        >
          {detecting ? "⏳ Détection..." : "📍 Ma position"}
        </button>
      </div>
      {detected && (
        <p className="text-green-600 text-xs mt-1">✅ Position détectée : {value}</p>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
