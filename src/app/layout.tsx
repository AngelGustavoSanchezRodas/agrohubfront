import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/componentes/ui/Sidebar";
import { MobileNav } from "@/componentes/ui/MobileNav";
import { EstadoRecepcion } from "@/componentes/ui/EstadoRecepcion";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgroHub | Dashboard",
  description: "Sistema industrial de monitoreo agrícola",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-agro-darker text-gray-200 antialiased flex flex-col md:flex-row h-screen overflow-hidden`}>
        {/* Navegacion Lateral Modular para Escritorio */}
        <Sidebar />

        {/* Contenedor Principal */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-agro-darker pb-16 md:pb-0">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-6 sm:px-8 border-b border-agro-border bg-agro-dark/50 backdrop-blur-sm shrink-0">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white tracking-tight truncate">
              AgroHub - Estación de Monitoreo Agrícola
            </h1>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 shrink-0">
              <EstadoRecepcion />
            </div>
          </header>

          {/* Área de renderizado dinámico */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>

        {/* Barra de Navegacion Inferior para Dispositivos Moviles */}
        <MobileNav />
      </body>
    </html>
  );
}