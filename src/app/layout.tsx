import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Courier_Prime, Gochi_Hand } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { TornFilters } from "@/components/editorial/Editorial";

/* Uma família só: Archivo larga e pesada nos títulos, largura normal no texto. */
const archivo = Archivo({
  variable: "--font-text",
  subsets: ["latin"],
  axes: ["wdth"],
});

/* Títulos: letra de cartaz condensada. */
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

/* Texto de apoio: máquina de escrever de redação. */
const typewriter = Courier_Prime({
  variable: "--font-type",
  weight: ["400", "700"],
  subsets: ["latin"],
});

/* Bilhetes escritos à mão na colagem. */
const hand = Gochi_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#151311",
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
    statusBarStyle: "default",
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
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${anton.variable} ${typewriter.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TornFilters />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
