interface DetalleDiagnosticoProps {
  riesgoDetectado: string;
  recomendacionTecnica: string;
  evaluacionHumedad?: string;
  evaluacionLuz?: string;
  cultivo?: string;
}

export function DetalleDiagnostico({
  riesgoDetectado,
  recomendacionTecnica,
  evaluacionHumedad,
  evaluacionLuz,
  cultivo,
}: DetalleDiagnosticoProps) {
  return (
    <div className="space-y-6">
      {cultivo && (
        <p className="text-xs text-gray-500">
          Diagnóstico para cultivo: <span className="text-gray-300 font-medium">{cultivo}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Riesgo Detectado
          </h3>
          <p className="text-white text-lg font-medium">{riesgoDetectado}</p>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Recomendación Técnica
          </h3>
          <p className="text-gray-300 leading-relaxed">{recomendacionTecnica}</p>
        </div>
      </div>

      {(evaluacionHumedad || evaluacionLuz) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluacionHumedad && (
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Humedad
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{evaluacionHumedad}</p>
            </div>
          )}
          {evaluacionLuz && (
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Luz
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{evaluacionLuz}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
