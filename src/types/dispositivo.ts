export interface DispositivoBackend {
  id_dispositivo: string;
  nombre: string;
  ubicacion?: string | null;
  fecha_instalacion?: string | null;
  estado_conexion?: string;
  [key: string]: unknown;
}

export interface DispositivoConsolidado {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: "ONLINE" | "OFFLINE" | "INACTIVO";
  ultimaConexion: string;
  temperatura?: number | string;
  humedadAmbiente?: number | string;
  humedadSuelo?: number | string;
  origen: "Supabase" | "Firebase" | "Híbrido";
}

export interface NodoFirebase {
  estado_actual?: {
    temperatura?: number;
    humedad_ambiente?: number;
    humedad_suelo?: number;
    timestamp?: string;
    id_dispositivo?: string;
    luz_uv?: number;
    radiacion_solar?: number;
    estado_bomba?: boolean;
    [key: string]: unknown;
  };
  buffer_telemetria?: Record<string, Record<string, unknown>>;
  historial?: Record<string, Record<string, unknown>>;
  ultimo_diagnostico_ia?: Record<string, unknown>;
  [key: string]: unknown;
}
