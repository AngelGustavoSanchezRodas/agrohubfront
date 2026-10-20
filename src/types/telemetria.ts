export interface DatosTelemetriaHistorica {
  id?: number | string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
  creado_en: string;
  tiempo?: string;
  id_dispositivo?: string;
  luz_uv?: number;
  indice_calor?: number;
  voltaje_bateria?: number;
  origen_dato?: "Supabase PostgreSQL" | "Firebase Realtime";
  [key: string]: unknown;
}

export interface TelemetriaEnVivo {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  estado_bomba?: boolean;
  timestamp?: string;
  intensidad_luz_lux?: number | string;
  luz_uv?: number;
  radiacion_solar?: number;
  indice_calor?: number;
  voltaje_bateria?: number;
}

export interface MetricasResumen {
  tempPromedio: string;
  tempMax: string;
  tempMin: string;
  humAmbPromedio: string;
  humSueloPromedio: string;
}

export interface RespuestaHistorialBackend {
  status?: string;
  total?: number;
  total_registros?: number;
  dispositivo?: string;
  datos?: DatosTelemetriaHistorica[];
}
