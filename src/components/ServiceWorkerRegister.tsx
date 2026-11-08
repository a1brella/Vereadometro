"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Registra apenas em produção ou HTTPS para evitar cache durante desenvolvimento local
      if (process.env.NODE_ENV === "production" || window.location.protocol === "https:") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker ativo:", registration.scope);
          })
          .catch((error) => {
            console.warn("Falha ao registrar Service Worker:", error);
          });
      }
    }
  }, []);

  return null;
}
