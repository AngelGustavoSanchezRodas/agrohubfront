import { DatosTelemetriaHistorica } from "@/types";

interface TablaTelemetriaProps {
  datos: DatosTelemetriaHistorica[];
  cargando: boolean;
}

export function TablaTelemetria({ datos, cargando }: TablaTelemetriaProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
        Registro Cronológico de Lecturas
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Historial de mediciones ambientales y condiciones del suelo.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="uppercase bg-slate-950/70 text-gray-400 border-b border-agro-border font-semibold">
            <tr>
              <th className="py-3 px-4">Fecha y Hora</th>
              <th className="py-3 px-4">Temperatura</th>
              <th className="py-3 px-4">Humedad Amb.</th>
              <th className="py-3 px-4">Humedad Sustrato</th>
              <th className="py-3 px-4">Luz</th>
              <th className="py-3 px-4">Bomba</th>
              <th className="py-3 px-4 text-right">Condición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border/50">
            {datos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                  {cargando
                    ? "Cargando registros..."
                    : "No se encontraron lecturas en el período seleccionado."}
                </td>
              </tr>
            ) : (
              datos
                .slice()
                .reverse()
                .map((item, idx) => {
                  const tempNum = Number(item.temperatura) || 0;
                  const esOptimo = tempNum >= 18 && tempNum <= 28;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-300 font-medium">
                        {item.creado_en
                          ? new Date(item.creado_en).toLocaleString()
                          : String(item.tiempo || "--")}
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
                      <td className="py-3 px-4 text-amber-300 font-medium">
                        {item.intensidad_luz_lux != null ? `${item.intensidad_luz_lux} lx` : "--"}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {item.estado_bomba === true ? "Encendida" : item.estado_bomba === false ? "Apagada" : "--"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
                            esOptimo
                              ? "bg-agro-green/10 text-agro-green border border-agro-green/30"
                              : "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                          }`}
                        >
                          {esOptimo ? "NOMINAL" : "ATENCIÓN"}
                        </span>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
