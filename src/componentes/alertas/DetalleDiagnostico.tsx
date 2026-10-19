interface DetalleDiagnosticoProps {
  riesgoDetectado: string;
  recomendacionTecnica: string;
}

export function DetalleDiagnostico({
  riesgoDetectado,
  recomendacionTecnica,
}: DetalleDiagnosticoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tarjeta Riesgo */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Riesgo Detectado
        </h3>
        <p className="text-white text-lg font-medium">{riesgoDetectado}</p>
      </div>

      {/* Tarjeta Recomendacion */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Recomendación Técnica
        </h3>
        <p className="text-gray-300 leading-relaxed">{recomendacionTecnica}</p>
      </div>
    </div>
  );
}
