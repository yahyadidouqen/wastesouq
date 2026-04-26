import { useState } from "react";
import { usePWA } from "../hooks/usePWA";

export default function PWABanner() {
  const { isInstallable, isOnline, pushSupported, pushEnabled, installApp, enablePush, disablePush } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-center gap-2 text-white text-sm font-semibold"
          style={{ background: "#D97706" }}>
          📵 Vous êtes hors ligne — certaines fonctionnalités sont limitées
        </div>
      )}

      {/* Install banner */}
      {isInstallable && !dismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4"
          style={{ background: "linear-gradient(to top, #0a2e1a, transparent)" }}>
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-5 flex items-center gap-4">
            <div className="text-4xl">♻️</div>
            <div className="flex-1">
              <p className="font-black text-gray-900 text-sm">Installer WasteSouq</p>
              <p className="text-gray-400 text-xs mt-0.5">Accès rapide depuis votre écran d'accueil</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDismissed(true)}
                className="px-3 py-2 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-100 transition">
                Plus tard
              </button>
              <button onClick={installApp}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:scale-105"
                style={{ background: "linear-gradient(135deg, #F4A261, #e08c4a)" }}>
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push notification prompt */}
      {pushSupported && !pushEnabled && showPushPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔔</div>
              <h3 className="font-black text-gray-900 text-lg">Activer les notifications</h3>
              <p className="text-gray-400 text-sm mt-1">
                Recevez une alerte quand une annonce correspond à votre profil acheteur
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPushPrompt(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition">
                Non merci
              </button>
              <button onClick={async () => {
                const ok = await enablePush();
                if (ok) setShowPushPrompt(false);
              }}
                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #1B4332, #2d6a4f)" }}>
                Activer 🔔
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}