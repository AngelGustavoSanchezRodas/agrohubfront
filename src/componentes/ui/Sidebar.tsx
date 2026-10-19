"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  Bell,
  Activity,
  Layers,
  Sprout,
} from "lucide-react";
import { verificarEstadoBackend } from "@/services/api";

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
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    verificarEstadoBackend().then((res) => {
      setBackendOnline(res.status === "ok");
    });
  }, []);

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

        {/* Estado de Conectividad de Servicios */}
        <div className="border-t border-agro-border pt-4 px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-3">
            Estado de Conexión
          </span>
          <div className="mt-2 bg-black/60 border border-agro-border rounded-xl p-3 space-y-2 text-xs">
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
              <span
                className={`font-semibold ${
                  backendOnline ? "text-agro-green" : "text-amber-400"
                }`}
              >
                {backendOnline ? "En línea" : "Desconectado"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del Sidebar con perfil de operador */}
      <div className="p-4 border-t border-agro-border">
        <div className="flex items-center px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3">
            OP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Operador Agrónomo</span>
            <span className="text-xs text-gray-500">Sesión Activa</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
