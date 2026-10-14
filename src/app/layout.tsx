import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, LineChart, Cpu, Bell, Sprout } from "lucide-react";
import "./globals.css";

// Tipografía geométrica y limpia
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
      <body className={`${inter.className} bg-agro-darker text-gray-200 antialiased flex h-screen overflow-hidden`}>
        
        {/* Sidebar (Navegación Lateral) */}
        <aside className="w-64 bg-agro-dark border-r border-agro-border flex flex-col">
          {/* Logo y Branding */}
          <div className="h-16 flex items-center px-6 border-b border-agro-border">
            <Sprout className="text-agro-green w-6 h-6 mr-3" />
            <span className="text-white font-bold text-lg tracking-wide uppercase">AgroHub</span>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/" className="flex items-center px-4 py-3 bg-slate-800/50 text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
              <LayoutDashboard className="w-5 h-5 mr-3 text-agro-green" />
              <span className="font-medium">Panel de Control</span>
            </Link>
            <Link href="/analitica" className="flex items-center px-4 py-3 text-gray-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-colors">
              <LineChart className="w-5 h-5 mr-3" />
              <span className="font-medium">Analítica</span>
            </Link>
            <Link href="/dispositivos" className="flex items-center px-4 py-3 text-gray-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-colors">
              <Cpu className="w-5 h-5 mr-3" />
              <span className="font-medium">Hardware ESP32</span>
            </Link>
            <Link href="/alertas" className="flex items-center px-4 py-3 text-gray-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-colors">
              <Bell className="w-5 h-5 mr-3" />
              <span className="font-medium">Diagnósticos IA</span>
            </Link>
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-agro-border">
            <div className="flex items-center px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3">
                OP
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Operador Local</span>
                <span className="text-xs text-gray-500">Solo Lectura</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenedor Principal */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-agro-darker">
          
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-agro-border bg-agro-dark/50 backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-white tracking-tight">Sector Norte - Invernadero A</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-agro-green shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Recepción activa
              </span>
            </div>
          </header>

          {/* Área de renderizado dinámico (Aquí se inyecta page.tsx) */}
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>

        </main>
      </body>
    </html>
  );
}