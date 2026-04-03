import { useRef, useState } from "react";

export default function PhotoUpload({ onChange, error }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Fichier trop volumineux. Maximum 5MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + " KB");
    onChange(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#1B4332] mb-2">
        📷 Photo de la matière
      </label>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${dragOver ? "border-[#1B4332] bg-[#D8F3DC]" : "border-gray-300 hover:border-[#1B4332] hover:bg-[#D8F3DC]/30"}
          ${error ? "border-red-400" : ""}
        `}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img src={preview} alt="preview" className="w-40 h-40 object-cover rounded-xl shadow" />
            <p className="text-sm text-gray-600">{fileName} · {fileSize}</p>
            <p className="text-xs text-[#1B4332] underline">Changer la photo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-4xl">📁</span>
            <p className="font-medium text-gray-600">Glissez une photo ici</p>
            <p className="text-sm">ou cliquez pour parcourir</p>
            <p className="text-xs">JPG, PNG, WEBP · Max 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}
