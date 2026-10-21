import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/componentes/ui/Sidebar";
import { MobileNav } from "@/componentes/ui/MobileNav";
import { EstadoRecepcion } from "@/componentes/ui/EstadoRecepcion";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0b1329",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://agrohub.local"),
  title: {
    default: "AgroHub | Plataforma de Monitoreo Agrícola IoT",
    template: "%s | AgroHub",
  },
  description:
    "Sistema integral de telemetría, monitoreo agroclimático en tiempo real, gestión inteligente de riego y analítica para invernaderos.",
  keywords: [
    "agricultura de precision",
    "monitoreo agricola",
    "telemetria iot",
    "invernadero inteligente",
    "riego automatico",
    "humedad de suelo",
    "indice de calor agricola",
    "agrohub",
  ],
  authors: [{ name: "AgroHub AgroIoT" }],
  creator: "AgroHub",
  publisher: "AgroHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AgroHub | Plataforma de Monitoreo Agrícola IoT",
    description:
      "Telemetría agroclimática en tiempo real, control de riego y diagnóstico agronómico para cultivos bajo invernadero.",
    type: "website",
    locale: "es_LA",
    siteName: "AgroHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroHub | Monitoreo Agrícola IoT",
    description:
      "Monitoreo en tiempo real de temperatura, humedad y gestión de riego para cultivos protegidos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} bg-agro-darker text-gray-200 antialiased flex flex-col md:flex-row h-screen overflow-hidden`}
      >
        {/* Navegación Lateral Modular para Escritorio */}
        <Sidebar />

        {/* Contenedor Principal Adaptativo */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-agro-darker pb-24 md:pb-0">
          {/* Cabecera Superior Responsiva */}
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 md:px-8 border-b border-agro-border bg-agro-dark/80 backdrop-blur-md shrink-0">
            <h1 className="text-xs sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
              AgroHub - Monitoreo Agrícola
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <EstadoRecepcion />
            </div>
          </header>

          {/* Área de renderizado dinámico con scroll suave */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
            {children}
          </div>
        </main>

        {/* Barra de Navegación Inferior para Dispositivos Móviles y Tablets */}
        <MobileNav />
      </body>
    </html>
  );
}