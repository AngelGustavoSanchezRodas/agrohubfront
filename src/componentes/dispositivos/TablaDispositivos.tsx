import { Wifi, WifiOff, Thermometer, Droplets, Leaf, Clock } from "lucide-react";
import { DispositivoConsolidado } from "@/types";

interface TablaDispositivosProps {
  dispositivos: DispositivoConsolidado[];
  cargando: boolean;
}

export function TablaDispositivos({ dispositivos, cargando }: TablaDispositivosProps) {
  return (
    <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto -mx-0">
        <table className="w-full text-left text-sm min-w-[620px]">
          <thead className="bg-slate-950/80 border-b border-agro-border text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th className="px-4 sm:px-6 py-3.5">Estación de Monitoreo</th>
              <th className="px-4 sm:px-6 py-3.5">Sector / Ubicación</th>
              <th className="px-4 sm:px-6 py-3.5">Estado</th>
              <th className="px-4 sm:px-6 py-3.5">Última Telemetría</th>
              <th className="px-4 sm:px-6 py-3.5 text-right">Último Reporte</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border/50 text-gray-300 text-xs">
            {dispositivos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                  {cargando
                    ? "Consultando catálogo de estaciones..."
                    : "No se encontraron estaciones de monitoreo activas en campo."}
                </td>
              </tr>
            ) : (
              dispositivos.map((estacion) => (
                <tr key={estacion.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 font-medium whitespace-nowrap">
                    <div className="font-semibold text-white text-xs sm:text-sm">
                      {estacion.nombre || estacion.id}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-gray-400 whitespace-nowrap">
                    {estacion.ubicacion}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        estacion.estado === "ONLINE"
                          ? "bg-agro-green/10 text-agro-green border border-agro-green/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {estacion.estado === "ONLINE" ? (
                        <Wifi className="w-3 h-3 shrink-0" />
                      ) : (
                        <WifiOff className="w-3 h-3 shrink-0" />
                      )}
                      {estacion.estado === "ONLINE" ? "EN LÍNEA" : "DESCONECTADA"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    {estacion.temperatura !== undefined ? (
                      <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
                        <span className="flex items-center gap-1 text-agro-orange font-medium">
                          <Thermometer className="w-3.5 h-3.5 shrink-0" />
                          {estacion.temperatura}°C
                        </span>
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <Droplets className="w-3.5 h-3.5 shrink-0" />
                          {estacion.humedadAmbiente}%
                        </span>
                        <span className="flex items-center gap-1 text-agro-green font-medium">
                          <Leaf className="w-3.5 h-3.5 shrink-0" />
                          {estacion.humedadSuelo}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic text-[11px]">Sin lecturas recientes</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">
                    <div className="text-gray-400 inline-flex items-center justify-end gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{estacion.ultimaConexion}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}