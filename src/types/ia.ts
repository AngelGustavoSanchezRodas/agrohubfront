export type EstadoSeveridadIA = "OPTIMO" | "ADVERTENCIA" | "CRITICO" | "DESCONOCIDO";

export interface DiagnosticoIA {
  estado_general: EstadoSeveridadIA;
  riesgo_detectado: string;
  recomendacion_tecnica: string;
}

export interface AlertaAgronomica {
  id: number;
  id_dispositivo: string | null;
  tipo_riesgo: string;
  severidad: string;
  mensaje_diagnostico: string;
  estado: string;
  creado_en?: string | null;
  resuelta_en?: string | null;
}

export interface RespuestaDiagnosticoBackend {
  status: string;
  dispositivo: string;
  diagnostico: DiagnosticoIA;
}
