export interface DatosTelemetriaHistorica {
  id?: number | string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
  indice_calor?: number;
  estado_bomba?: boolean;
  creado_en: string;
  tiempo?: string;
  id_dispositivo?: string;
  origen_dato?: "Supabase PostgreSQL" | "Firebase Realtime";
  [key: string]: unknown;
}

export interface TelemetriaEnVivo {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  indice_calor?: number | string;
  estado_bomba?: boolean;
  timestamp?: string;
}

export interface MetricasResumen {
  tempPromedio: string;
  tempMax: string;
  tempMin: string;
  humAmbPromedio: string;
  humSueloPromedio: string;
  indiceCalorPromedio: string;
}

export interface RespuestaHistorialBackend {
  status?: string;
  total?: number;
  total_registros?: number;
  dispositivo?: string;
  datos?: DatosTelemetriaHistorica[];
}
