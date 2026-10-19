export type EstadoSeveridadIA = "OPTIMO" | "ADVERTENCIA" | "CRITICO" | "DESCONOCIDO";

export interface DiagnosticoIA {
  estado_general: EstadoSeveridadIA;
  riesgo_detectado: string;
  recomendacion_tecnica: string;
}

export interface RespuestaDiagnosticoBackend {
  status: string;
  dispositivo: string;
  diagnostico: DiagnosticoIA;
}
