import { useState, useEffect } from "react";

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    // ✅ Register SW after page load + 2s delay to not block main thread
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          navigator.serviceWorker.register("/sw.js")
            .then((reg) => {
              setPushSupported("PushManager" in window);
              reg.pushManager.getSubscription().then((sub) => {
                setPushEnabled(!!sub);
              });
            })
            .catch((err) => console.error("SW registration failed:", err));
        }, 2000);
      });
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if already installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const enablePush = async () => {
    if (!pushSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return false;
      const reg = await navigator.serviceWorker.ready;
      const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) { setPushEnabled(true); return true; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch("http://localhost:5000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sub),
      });
      setPushEnabled(true);
      return true;
    } catch { return false; }
  };

  const disablePush = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await sub.unsubscribe(); setPushEnabled(false); }
  };

  return { isInstallable, isInstalled, isOnline, pushSupported, pushEnabled, installApp, enablePush, disablePush };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}