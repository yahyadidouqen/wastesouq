import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
import LocationPicker from "./LocationPicker";

const MATERIALS = [
  "Plastique","Métal","Papier & Carton","Verre","Bois",
  "Textile","Déchets organiques","Gravats & Construction","Électronique","Autre"
];

const UNITS = ["kg","tonnes","litres","unités"];

const inputClass = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition ${err ? "border-red-400" : "border-gray-300"}`;

export default function ListingForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    photo: null, materialType: "", quantity: "", unit: "kg",
    city: "", lat: null, lng: null, description: "", phone: "", whatsapp: false,
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.materialType) e.materialType = "Veuillez sélectionner un type de matière.";
    if (!form.quantity || form.quantity <= 0) e.quantity = "Veuillez indiquer une quantité valide.";
    if (!form.city.trim()) e.city = "Veuillez indiquer une ville.";
    if (!form.phone.trim()) e.phone = "Veuillez entrer un numéro de téléphone.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const data = new FormData();
    if (form.photo) data.append("photo", form.photo);
    data.append("materialType", form.materialType);
    data.append("quantity", form.quantity);
    data.append("unit", form.unit);
    data.append("city", form.city);
    if (form.lat) data.append("lat", form.lat);
    if (form.lng) data.append("lng", form.lng);
    data.append("description", form.description);
    data.append("phone", form.phone);
    data.append("whatsapp", form.whatsapp);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Photo */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <PhotoUpload onChange={(f) => set("photo", f)} error={errors.photo} />
      </div>

      {/* Material Type */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-semibold text-[#1B4332] mb-2">
          ♻️ Type de matière <span className="text-red-500">*</span>
        </label>
        <select
          value={form.materialType}
          onChange={(e) => set("materialType", e.target.value)}
          className={inputClass(errors.materialType)}
        >
          <option value="">-- Sélectionner un type --</option>
          {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {errors.materialType && <p className="text-red-500 text-xs mt-1">{errors.materialType}</p>}
      </div>

      {/* Quantity + Unit */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-semibold text-[#1B4332] mb-2">
          ⚖️ Quantité <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <input
            type="number" min="0" step="0.1"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="Ex: 500"
            className={inputClass(errors.quantity) + " flex-1"}
          />
          <select
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <LocationPicker
          value={form.city}
          onChange={(v) => set("city", v)}
          onCoords={({ lat, lng }) => setForm((f) => ({ ...f, lat, lng }))}
          error={errors.city}
        />
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-semibold text-[#1B4332] mb-2">
          📝 Description <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="État de la matière, disponibilité, conditions particulières..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition resize-none"
        />
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-semibold text-[#1B4332] mb-2">
          📞 Contact <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+212 6XX XXX XXX"
          className={inputClass(errors.phone)}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm text-gray-600">💬 Contacter via WhatsApp</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#F4A261] hover:bg-[#e08c4a] text-white font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Publication en cours...
          </span>
        ) : "🚀 Publier mon annonce"}
      </button>
    </form>
  );
}
