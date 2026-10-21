interface DetalleDiagnosticoProps {
  riesgoDetectado: string;
  recomendacionTecnica: string;
  evaluacionHumedad?: string;
  evaluacionTemperatura?: string;
  cultivo?: string;
}

export function DetalleDiagnostico({
  riesgoDetectado,
  recomendacionTecnica,
  evaluacionHumedad,
  evaluacionTemperatura,
  cultivo,
}: DetalleDiagnosticoProps) {
  return (
    <div className="space-y-6">
      {cultivo && (
        <p className="text-xs text-gray-500">
          Diagnóstico agronómico para cultivo:{" "}
          <span className="text-gray-300 font-medium">{cultivo}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Riesgo Fitosanitario / Ambiental
          </h3>
          <p className="text-white text-lg font-medium">{riesgoDetectado}</p>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Recomendación Agronómica
          </h3>
          <p className="text-gray-300 leading-relaxed text-sm">{recomendacionTecnica}</p>
        </div>
      </div>

      {(evaluacionHumedad || evaluacionTemperatura) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluacionHumedad && (
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Condición Hídrica (Suelo y Aire)
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{evaluacionHumedad}</p>
            </div>
          )}
          {evaluacionTemperatura && (
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Condición Térmica
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{evaluacionTemperatura}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}