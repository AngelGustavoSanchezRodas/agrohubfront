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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-agro-dark border-t border-agro-border px-1 py-2 flex items-center justify-around">
      {enlaces.map((item) => {
        const esActivo = rutaActual === item.ruta;
        const Icono = item.icono;

        return (
          <Link
            key={item.ruta}
            href={item.ruta}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] transition-colors ${
              esActivo
                ? "text-agro-orange font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icono className="w-5 h-5" />
            <span>{item.nombre}</span>
          </Link>
        );
      })}
    </nav>
  );
}
