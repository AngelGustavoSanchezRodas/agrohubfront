export type EstadoSeveridadIA = "OPTIMO" | "ADVERTENCIA" | "CRITICO" | "DESCONOCIDO";

export interface DiagnosticoIA {
  estado_general: EstadoSeveridadIA;
  riesgo_detectado: string;
  recomendacion_tecnica: string;
  evaluacion_humedad?: string;
  evaluacion_luz?: string;
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
  cultivo?: string;
  diagnostico: DiagnosticoIA;
}

export interface CultivoCatalogo {
  id: string;
  descripcion: string;
  temperatura_c: [number, number] | number[];
  humedad_ambiente_pct: [number, number] | number[];
  humedad_suelo_pct: [number, number] | number[];
  luz_lux: [number, number] | number[];
  notas: string;
  origen?: "catalogo" | "personalizado" | string;
}
