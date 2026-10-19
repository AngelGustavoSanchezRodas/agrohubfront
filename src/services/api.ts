import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  DatosTelemetriaHistorica,
  RespuestaHistorialBackend,
  DispositivoBackend,
  DiagnosticoIA,
  RespuestaDiagnosticoBackend,
} from "@/types";

export type {
  DatosTelemetriaHistorica,
  DispositivoBackend,
  DiagnosticoIA,
};

const getBaseUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:8000").replace(/\/$/, "");
};

const getHeaders = (): Record<string, string> => {
  const apiKey = process.env.NEXT_PUBLIC_AGROHUB_API_KEY?.trim() || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
};

const ejecutarFetchSeguro = async (ruta: string, opciones?: RequestInit): Promise<Response> => {
  const baseUrl = getBaseUrl();
  const defaultHeaders = getHeaders();
  const headers = { ...defaultHeaders, ...(opciones?.headers as Record<string, string> | undefined) };

  try {
    const res = await fetch(`${baseUrl}${ruta}`, { ...opciones, headers });
    if (res.ok || (res.status !== 404 && res.status !== 502 && res.status !== 503)) {
      return res;
    }
  } catch {
    // Si falla la conexion remota, intentar con el host local
  }

  return fetch(`http://127.0.0.1:8000${ruta}`, { ...opciones, headers });
};

export const verificarEstadoBackend = async (): Promise<{ status: string; version?: string }> => {
  try {
    const respuesta = await ejecutarFetchSeguro("/");
    if (!respuesta.ok) return { status: "desconectado" };
    return (await respuesta.json()) as { status: string; version?: string };
  } catch {
    return { status: "desconectado" };
  }
};

export const alternarBombaAgua = async (encender: boolean): Promise<Record<string, unknown>> => {
  const respuesta = await ejecutarFetchSeguro("/api/control/bomba", {
    method: "POST",
    body: JSON.stringify({ estado: encender }),
  });

  if (!respuesta.ok) {
    throw new Error("No autorizado o error de servidor");
  }

  return (await respuesta.json()) as Record<string, unknown>;
};

export const obtenerHistorialDesdeFirebase = async (
  dispositivoId: string = "invernadero_prueba_01"
): Promise<DatosTelemetriaHistorica[]> => {
  try {
    const nodoRef = ref(db, `invernadero/${dispositivoId}`);
    const snapshot = await get(nodoRef);
    if (!snapshot.exists()) {
      return [];
    }

    const val = snapshot.val() as Record<string, unknown>;
    const registros: DatosTelemetriaHistorica[] = [];

    // 1. Revisar buffer de telemetria acumulada
    if (val.buffer_telemetria && typeof val.buffer_telemetria === "object") {
      const buffer = val.buffer_telemetria as Record<string, Record<string, unknown>>;
      for (const [key, item] of Object.entries(buffer)) {
        if (item && typeof item === "object") {
          registros.push({
            id: key,
            id_dispositivo: String(item.id_dispositivo || dispositivoId),
            temperatura: Number(item.temperatura) || 0,
            humedad_ambiente: Number(item.humedad_ambiente) || 0,
            humedad_suelo: Number(item.humedad_suelo) || 0,
            luz_uv: item.luz_uv !== undefined ? Number(item.luz_uv) : undefined,
            indice_calor: item.indice_calor !== undefined ? Number(item.indice_calor) : undefined,
            voltaje_bateria: item.voltaje_bateria !== undefined ? Number(item.voltaje_bateria) : undefined,
            creado_en: String(item.timestamp || new Date().toISOString()),
            origen_dato: "Firebase Realtime",
          });
        }
      }
    }

    // 2. Revisar historial explicito
    if (val.historial && typeof val.historial === "object") {
      const hist = val.historial as Record<string, Record<string, unknown>>;
      for (const [key, item] of Object.entries(hist)) {
        if (item && typeof item === "object") {
          registros.push({
            id: key,
            id_dispositivo: String(item.id_dispositivo || dispositivoId),
            temperatura: Number(item.temperatura) || 0,
            humedad_ambiente: Number(item.humedad_ambiente) || 0,
            humedad_suelo: Number(item.humedad_suelo) || 0,
            luz_uv: item.luz_uv !== undefined ? Number(item.luz_uv) : undefined,
            indice_calor: item.indice_calor !== undefined ? Number(item.indice_calor) : undefined,
            voltaje_bateria: item.voltaje_bateria !== undefined ? Number(item.voltaje_bateria) : undefined,
            creado_en: String(item.timestamp || new Date().toISOString()),
            origen_dato: "Firebase Realtime",
          });
        }
      }
    }

    // 3. Incluir estado actual para garantizar la medicion mas reciente
    if (val.estado_actual && typeof val.estado_actual === "object") {
      const actual = val.estado_actual as Record<string, unknown>;
      const tsActual = String(actual.timestamp || "");
      const yaExiste = registros.some((r) => r.creado_en === tsActual);
      if (!yaExiste && actual.temperatura !== undefined) {
        registros.push({
          id: `live-${dispositivoId}`,
          id_dispositivo: String(actual.id_dispositivo || dispositivoId),
          temperatura: Number(actual.temperatura) || 0,
          humedad_ambiente: Number(actual.humedad_ambiente) || 0,
          humedad_suelo: Number(actual.humedad_suelo) || 0,
          luz_uv: actual.luz_uv !== undefined ? Number(actual.luz_uv) : undefined,
          indice_calor: actual.indice_calor !== undefined ? Number(actual.indice_calor) : undefined,
          voltaje_bateria: actual.voltaje_bateria !== undefined ? Number(actual.voltaje_bateria) : undefined,
          creado_en: tsActual || new Date().toISOString(),
          origen_dato: "Firebase Realtime",
        });
      }
    }

    registros.sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
    return registros;
  } catch {
    return [];
  }
};

export const obtenerDatosGrafica = async (
  limite?: number,
  dispositivoId: string = "invernadero_prueba_01"
): Promise<DatosTelemetriaHistorica[]> => {
  const ruta = `/api/telemetria/historial/${dispositivoId}${limite ? `?limite=${limite}` : ""}`;

  try {
    const respuesta = await ejecutarFetchSeguro(ruta);
    if (respuesta.ok) {
      const json = (await respuesta.json()) as RespuestaHistorialBackend;
      const datosBackend = Array.isArray(json.datos) ? json.datos : [];
      if (datosBackend.length > 0) {
        return datosBackend.map((d) => ({
          ...d,
          origen_dato: "Supabase PostgreSQL",
        }));
      }
    }
  } catch {
    // Si el backend no responde, recuperar de Firebase RTDB
  }

  const datosFirebase = await obtenerHistorialDesdeFirebase(dispositivoId);
  return limite ? datosFirebase.slice(-limite) : datosFirebase;
};

export const obtenerDispositivos = async (): Promise<DispositivoBackend[]> => {
  try {
    const respuesta = await ejecutarFetchSeguro("/api/dispositivos");
    if (respuesta.ok) {
      const data = (await respuesta.json()) as DispositivoBackend[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Continuar a fallback de Firebase si falla
  }

  try {
    const invRef = ref(db, "invernadero");
    const snap = await get(invRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, Record<string, unknown>>;
      return Object.keys(val).map((id) => ({
        id_dispositivo: id,
        nombre: `Nodo ${id}`,
        ubicacion: "Invernadero",
        estado_conexion: "ONLINE",
      }));
    }
  } catch {
    // Error en lectura de Firebase
  }

  return [];
};

export const registrarDispositivo = async (datos: {
  id_dispositivo: string;
  nombre: string;
  ubicacion?: string;
}): Promise<DispositivoBackend> => {
  const respuesta = await ejecutarFetchSeguro("/api/dispositivos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => null);
    const mensaje = typeof errorData?.detail === "string" ? errorData.detail : "Error al registrar dispositivo";
    throw new Error(mensaje);
  }

  return (await respuesta.json()) as DispositivoBackend;
};

export const obtenerDiagnosticoIA = async (
  dispositivoId: string = "invernadero_prueba_01"
): Promise<DiagnosticoIA> => {
  try {
    const respuesta = await ejecutarFetchSeguro(`/api/ia/diagnostico/${dispositivoId}`);
    if (respuesta.ok) {
      const json = (await respuesta.json()) as RespuestaDiagnosticoBackend;
      return json.diagnostico;
    }
  } catch {
    // Fallback a Firebase si el backend falla
  }

  try {
    const diagRef = ref(db, `invernadero/${dispositivoId}/ultimo_diagnostico_ia`);
    const snap = await get(diagRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, unknown>;
      return {
        estado_general: (val.estado_general as DiagnosticoIA["estado_general"]) || "DESCONOCIDO",
        riesgo_detectado: String(val.riesgo_detectado || "Sin anomalía reportada"),
        recomendacion_tecnica: String(val.recomendacion_tecnica || "Mantener monitoreo continuo."),
      };
    }
  } catch {
    // Error en lectura de Firebase
  }

  throw new Error("No se pudo obtener el diagnóstico del backend ni de la base de datos de Firebase.");
};
