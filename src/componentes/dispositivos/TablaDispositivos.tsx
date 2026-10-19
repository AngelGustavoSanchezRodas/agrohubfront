import { Wifi, WifiOff, Thermometer, Droplets, Leaf, Clock } from "lucide-react";
import { DispositivoConsolidado } from "@/types";

interface TablaDispositivosProps {
  dispositivos: DispositivoConsolidado[];
  cargando: boolean;
}

export function TablaDispositivos({ dispositivos, cargando }: TablaDispositivosProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800/50 border-b border-agro-border text-gray-400 uppercase tracking-wider text-xs font-semibold">
          <tr>
            <th className="px-6 py-4">Dispositivo</th>
            <th className="px-6 py-4">Ubicación</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Última Telemetría</th>
            <th className="px-6 py-4">Origen</th>
            <th className="px-6 py-4 text-right">Último Reporte</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-agro-border text-gray-300 text-xs">
          {dispositivos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                {cargando
                  ? "Consultando catálogo de hardware..."
                  : "No se encontraron microcontroladores registrados ni detectados en Firebase."}
              </td>
            </tr>
          ) : (
            dispositivos.map((nodo) => (
              <tr key={nodo.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white text-sm">{nodo.nombre}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{nodo.id}</div>
                </td>
                <td className="px-6 py-4 text-gray-400">{nodo.ubicacion}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      nodo.estado === "ONLINE"
                        ? "bg-agro-green/10 text-agro-green border border-agro-green/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {nodo.estado === "ONLINE" ? (
                      <Wifi className="w-3.5 h-3.5" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5" />
                    )}
                    {nodo.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {nodo.temperatura !== undefined ? (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-agro-orange font-medium">
                        <Thermometer className="w-3.5 h-3.5" />
                        {nodo.temperatura}°C
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 font-medium">
                        <Droplets className="w-3.5 h-3.5" />
                        {nodo.humedadAmbiente}%
                      </span>
                      <span className="flex items-center gap-1 text-agro-green font-medium">
                        <Leaf className="w-3.5 h-3.5" />
                        {nodo.humedadSuelo}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Sin lecturas en vivo</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-slate-900 text-gray-300">
                    {nodo.origen}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-gray-400 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{nodo.ultimaConexion}</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
