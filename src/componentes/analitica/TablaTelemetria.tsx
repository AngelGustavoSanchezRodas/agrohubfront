import { DatosTelemetriaHistorica } from "@/types";

interface TablaTelemetriaProps {
  datos: DatosTelemetriaHistorica[];
  cargando: boolean;
}

export function TablaTelemetria({ datos, cargando }: TablaTelemetriaProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
        Tabla de Telemetría Relacional
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Registros procesados y persistidos en Supabase o transmitidos en vivo por Firebase Realtime.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="uppercase bg-slate-950/70 text-gray-400 border-b border-agro-border font-semibold">
            <tr>
              <th className="py-3 px-4">Dispositivo</th>
              <th className="py-3 px-4">Temperatura</th>
              <th className="py-3 px-4">Humedad Amb.</th>
              <th className="py-3 px-4">Suelo</th>
              <th className="py-3 px-4">Origen</th>
              <th className="py-3 px-4">Marca de Tiempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border/50">
            {datos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                  {cargando
                    ? "Cargando registros..."
                    : "No se encontraron lecturas de telemetría en la base de datos ni en Firebase."}
                </td>
              </tr>
            ) : (
              datos
                .slice()
                .reverse()
                .map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-gray-300">
                      {String(item.id_dispositivo || "invernadero_prueba_01")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-agro-orange">
                      {item.temperatura}°C
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-medium">
                      {item.humedad_ambiente}%
                    </td>
                    <td className="py-3 px-4 text-agro-green font-medium">
                      {item.humedad_suelo}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-slate-900 text-gray-300">
                        {item.origen_dato || "Supabase"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono">
                      {item.creado_en
                        ? new Date(item.creado_en).toLocaleString()
                        : String(item.tiempo || "--")}
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
