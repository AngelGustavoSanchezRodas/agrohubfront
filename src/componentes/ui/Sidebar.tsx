"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  Bell,
  Activity,
  Layers,
} from "lucide-react";

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
    descripcion: "Telemetría en tiempo real",
  },
  {
    nombre: "Analítica",
    ruta: "/analitica",
    icono: LineChart,
    descripcion: "Historial de Supabase",
  },
  {
    nombre: "Dispositivos",
    ruta: "/dispositivos",
    icono: Cpu,
    descripcion: "Inventario de ESP32",
  },
  {
    nombre: "Alertas IA",
    ruta: "/alertas",
    icono: Bell,
    descripcion: "Diagnósticos predictivos",
  },
];

export function Sidebar() {
  const rutaActual = usePathname();

  return (
    <aside className="w-64 border-r border-agro-border bg-agro-dark min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3">
            Módulos del Sistema
          </span>
          <nav className="mt-3 space-y-1">
            {elementosNavegacion.map((item) => {
              const esActivo = rutaActual === item.ruta;
              const Icono = item.icono;

              return (
                <Link
                  key={item.ruta}
                  href={item.ruta}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm group ${
                    esActivo
                      ? "bg-black text-agro-orange border border-agro-orange/40 font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-black/40"
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

        <div className="border-t border-agro-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3">
            Estado de Conexión
          </span>
          <div className="mt-3 bg-black/60 border border-agro-border rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-agro-green" />
                Firebase Realtime
              </span>
              <span className="text-agro-green font-semibold">Activo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                FastAPI / Supabase
              </span>
              <span className="text-agro-green font-semibold">En línea</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-black/40 border border-agro-border rounded-xl text-xs text-gray-500">
        <p className="font-semibold text-gray-300">AgroHub IoT Suite</p>
        <p className="text-[11px] mt-0.5">Versión 1.0.0 - Entorno Agrícola</p>
      </div>
    </aside>
  );
}
