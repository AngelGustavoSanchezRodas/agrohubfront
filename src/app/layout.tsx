import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Usamos Inter como tipografía principal, limpia y muy legible para dashboards
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgroHub | Dashboard",
  description: "Tecnología para el futuro agrícola", // El eslogan de tu logo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        
        {/* Barra de Navegación Superior */}
        <header className="border-b border-agro-border bg-agro-dark py-4 px-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo Recreado en Código */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tighter text-white flex items-center">
                Agro
                {/* La caja naranja de "Hub" con bordes redondeados */}
                <span className="bg-agro-orange text-black px-2 py-0.5 ml-1 rounded-lg">
                  Hub
                </span>
              </h1>
              <span className="text-[0.6rem] tracking-[0.2em] text-gray-400 mt-1 uppercase">
                Tecnología para el futuro agrícola
              </span>
            </div>

            {/* Indicador de estado global */}
            <div className="flex items-center gap-3 bg-black px-4 py-2 rounded-full border border-agro-border">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agro-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-agro-green"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">
                Sistema en Línea
              </span>
            </div>

          </div>
        </header>

        {/* Contenedor donde irán las tarjetas y gráficas */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-6">
          {children}
        </main>

      </body>
    </html>
  );
}