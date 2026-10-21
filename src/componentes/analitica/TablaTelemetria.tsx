import { DatosTelemetriaHistorica } from "@/types";
import { etiquetaLectura } from "@/lib/tiempo";

interface TablaTelemetriaProps {
  datos: DatosTelemetriaHistorica[];
  cargando: boolean;
}

export function TablaTelemetria({ datos, cargando }: TablaTelemetriaProps) {
  return (
    <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
        Registro Cronológico de Lecturas
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Historial de mediciones ambientales y condiciones del sustrato.
      </p>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="uppercase bg-slate-950/80 text-gray-400 border-b border-agro-border font-semibold">
            <tr>
              <th className="py-3 px-3 sm:px-4">Fecha y Hora</th>
              <th className="py-3 px-3 sm:px-4">Temperatura</th>
              <th className="py-3 px-3 sm:px-4">Humedad Aire</th>
              <th className="py-3 px-3 sm:px-4">Humedad Suelo</th>
              <th className="py-3 px-3 sm:px-4">Índice Calor</th>
              <th className="py-3 px-3 sm:px-4">Bomba</th>
              <th className="py-3 px-3 sm:px-4 text-right">Condición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border/40">
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
                  const indiceCalor = item.indice_calor !== undefined && item.indice_calor !== null
                    ? `${Number(item.indice_calor).toFixed(1)}°C`
                    : `${tempNum.toFixed(1)}°C`;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-4 text-gray-300 font-medium whitespace-nowrap">
                        {item.creado_en
                          ? etiquetaLectura(item.creado_en)
                          : String(item.tiempo || "--")}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-agro-orange whitespace-nowrap">
                        {item.temperatura}°C
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-blue-400 font-medium whitespace-nowrap">
                        {item.humedad_ambiente}%
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-agro-green font-medium whitespace-nowrap">
                        {item.humedad_suelo}%
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-rose-400 font-medium whitespace-nowrap">
                        {indiceCalor}
                      </td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.estado_bomba
                              ? "bg-agro-green/15 text-agro-green border border-agro-green/30"
                              : "bg-slate-800 text-gray-400 border border-slate-700"
                          }`}
                        >
                          {item.estado_bomba ? "ENCENDIDA" : "APAGADA"}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            esOptimo
                              ? "border-agro-green/30 text-agro-green bg-agro-green/10"
                              : "border-agro-orange/30 text-agro-orange bg-agro-orange/10"
                          }`}
                        >
                          {esOptimo ? "Óptimo" : "Atención"}
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
