"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  Bell,
  Brain,
  Sprout,
} from "lucide-react";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";

interface ElementoNavegacion {
  nombre: string;
  ruta: string;
  icono: React.ElementType;
  descripcion: string;
}

const elementosNavegacion: ElementoNavegacion[] = [
  {
    nombre: "Dashboard",
    ruta: "/",
    icono: LayoutDashboard,
    descripcion: "Lecturas en tiempo real",
  },
  {
    nombre: "Analítica",
    ruta: "/analitica",
    icono: LineChart,
    descripcion: "Historial y tendencias",
  },
  {
    nombre: "Estaciones",
    ruta: "/dispositivos",
    icono: Cpu,
    descripcion: "Nodos y sectores de cultivo",
  },
  {
    nombre: "Diagnósticos IA",
    ruta: "/alertas",
    icono: Brain,
    descripcion: "Diagnóstico agronómico",
  },
  {
    nombre: "Alertas",
    ruta: "/alertas-sistema",
    icono: Bell,
    descripcion: "Umbrales y anomalías activas",
  },
];

export function Sidebar() {
  const rutaActual = usePathname();

  return (
    <aside className="w-64 border-r border-agro-border bg-agro-dark h-screen flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-4">
        {/* Logo y Branding */}
        <div className="h-16 flex items-center px-6 border-b border-agro-border">
          <Sprout className="text-agro-green w-6 h-6 mr-3" />
          <span className="text-white font-bold text-lg tracking-wide uppercase">AgroHub</span>
        </div>

        {/* Módulos de Navegación */}
        <div className="px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-3">
            Módulos del Sistema
          </span>
          <nav className="mt-2 space-y-1">
            {elementosNavegacion.map((item) => {
              const esActivo = rutaActual === item.ruta;
              const Icono = item.icono;

              return (
                <Link
                  key={item.ruta}
                  href={item.ruta}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm group ${
                    esActivo
                      ? "bg-slate-900 text-agro-orange border border-agro-orange/40 font-semibold shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                >
                  <Icono
                    className={`w-5 h-5 transition-colors ${
                      esActivo
                        ? "text-agro-orange"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span>{item.nombre}</span>
                    <span className="text-[10px] text-gray-500 font-normal leading-tight">
                      {item.descripcion}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Identificador del Invernadero y Sector */}
      <div className="p-4 border-t border-agro-border">
        <div className="flex items-center px-3 py-2 bg-slate-950/60 rounded-xl border border-agro-border/60">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-agro-green mr-3 border border-emerald-500/20 shrink-0">
            <Sprout className="w-4 h-4 text-agro-green" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-white truncate">
              Invernadero Principal
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              Sector de cultivo activo
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}