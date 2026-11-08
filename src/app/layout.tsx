import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Vereadômetro Juazeiro | Fiscalização Cidadã dos 21 Vereadores",
  description:
    "Saiba quanto custa cada um dos 21 vereadores de Juazeiro do Norte / CE. Gastos de gabinete, folha de assessores, projetos e alertas no WhatsApp.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vereadômetro Juazeiro",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "Juazeiro do Norte",
    "Câmara Municipal",
    "Vereadores Juazeiro",
    "Gastos Públicos",
    "Fiscalização Cidadã",
    "Transparência Ceará",
    "Iniciativa Popular",
  ],
  openGraph: {
    title: "Vereadômetro Juazeiro | Quem mais custa ao pagador de impostos?",
    description:
      "Auditoria independente dos gastos, salários e assessores dos 21 vereadores de Juazeiro do Norte / CE.",
    url: "https://vereadometro-juazeiro.com.br",
    siteName: "Vereadômetro Juazeiro",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
