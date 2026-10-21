"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Cpu, Bell, Brain } from "lucide-react";

export function MobileNav() {
  const rutaActual = usePathname();

  const enlaces = [
    { nombre: "Inicio", ruta: "/", icono: LayoutDashboard },
    { nombre: "Analítica", ruta: "/analitica", icono: LineChart },
    { nombre: "Estaciones", ruta: "/dispositivos", icono: Cpu },
    { nombre: "IA", ruta: "/alertas", icono: Brain },
    { nombre: "Alertas", ruta: "/alertas-sistema", icono: Bell },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-agro-border px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl"
    >
      {enlaces.map((item) => {
        const esActivo = rutaActual === item.ruta;
        const Icono = item.icono;

        return (
          <Link
            key={item.ruta}
            href={item.ruta}
            aria-current={esActivo ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-[54px] min-h-[44px] rounded-xl text-[10px] font-medium transition-all ${
              esActivo
                ? "text-agro-orange font-semibold bg-slate-900/90 border border-agro-orange/30 shadow-inner"
                : "text-gray-400 hover:text-white active:scale-95"
            }`}
          >
            <Icono className="w-4 h-4 shrink-0" />
            <span className="truncate leading-none">{item.nombre}</span>
          </Link>
        );
      })}
    </nav>
  );
}