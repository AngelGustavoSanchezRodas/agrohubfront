import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import {
  DatosTelemetriaHistorica,
  RespuestaHistorialBackend,
  DispositivoBackend,
  DiagnosticoIA,
  RespuestaDiagnosticoBackend,
  AlertaAgronomica,
  CultivoCatalogo,
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

const mapearRegistroHistorico = (
  key: string,
  item: Record<string, unknown>,
  dispositivoId: string
): DatosTelemetriaHistorica => ({
  id: key,
  id_dispositivo: String(item.id_dispositivo || dispositivoId),
  temperatura: Number(item.temperatura) || 0,
  humedad_ambiente: Number(item.humedad_ambiente) || 0,
  humedad_suelo: Number(item.humedad_suelo) || 0,
  luz_uv: item.luz_uv !== undefined ? Number(item.luz_uv) : undefined,
  intensidad_luz_lux:
    item.intensidad_luz_lux !== undefined ? Number(item.intensidad_luz_lux) : undefined,
  estado_bomba: typeof item.estado_bomba === "boolean" ? item.estado_bomba : undefined,
  indice_calor: item.indice_calor !== undefined ? Number(item.indice_calor) : undefined,
  voltaje_bateria: item.voltaje_bateria !== undefined ? Number(item.voltaje_bateria) : undefined,
  creado_en: String(item.timestamp || item.creado_en || new Date().toISOString()),
  origen_dato: "Firebase Realtime",
});

export const obtenerHistorialDesdeFirebase = async (
  dispositivoId: string = DISPOSITIVO_ACTIVO
): Promise<DatosTelemetriaHistorica[]> => {
  try {
    const nodoRef = ref(db, `invernadero/${dispositivoId}`);
    const snapshot = await get(nodoRef);
    if (!snapshot.exists()) {
      return [];
    }

    const val = snapshot.val() as Record<string, unknown>;
    const registros: DatosTelemetriaHistorica[] = [];

    if (val.buffer_telemetria && typeof val.buffer_telemetria === "object") {
      const buffer = val.buffer_telemetria as Record<string, Record<string, unknown>>;
      for (const [key, item] of Object.entries(buffer)) {
        if (item && typeof item === "object") {
          registros.push(mapearRegistroHistorico(key, item, dispositivoId));
        }
      }
    }

    if (val.historial && typeof val.historial === "object") {
      const hist = val.historial as Record<string, Record<string, unknown>>;
      for (const [key, item] of Object.entries(hist)) {
        if (item && typeof item === "object") {
          registros.push(mapearRegistroHistorico(key, item, dispositivoId));
        }
      }
    }

    if (val.estado_actual && typeof val.estado_actual === "object") {
      const actual = val.estado_actual as Record<string, unknown>;
      const tsActual = String(actual.timestamp || "");
      const yaExiste = registros.some((r) => r.creado_en === tsActual);
      if (!yaExiste && actual.temperatura !== undefined) {
        registros.push(mapearRegistroHistorico(`live-${dispositivoId}`, actual, dispositivoId));
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
  dispositivoId: string = DISPOSITIVO_ACTIVO
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
        nombre: id,
        ubicacion: null,
        estado_conexion: "INACTIVO",
      }));
    }
  } catch {
    // Error en lectura de telemetría
  }

  return [];
};

export const obtenerAlertas = async (): Promise<AlertaAgronomica[]> => {
  const respuesta = await ejecutarFetchSeguro("/api/alertas?limite=50");
  if (!respuesta.ok) {
    throw new Error("No se pudieron consultar las alertas agronomicas");
  }
  const data = (await respuesta.json()) as AlertaAgronomica[];
  return Array.isArray(data) ? data : [];
};

export const resolverAlerta = async (idAlerta: number): Promise<void> => {
  const respuesta = await ejecutarFetchSeguro(`/api/alertas/${idAlerta}/resolver`, {
    method: "PATCH",
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo marcar la alerta como resuelta");
  }
};

export const actualizarCultivoDispositivo = async (
  dispositivoId: string,
  cultivo: string
): Promise<void> => {
  const respuesta = await ejecutarFetchSeguro(`/api/dispositivos/${dispositivoId}`, {
    method: "PATCH",
    body: JSON.stringify({ cultivo }),
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo guardar el cultivo del invernadero");
  }
};

export const obtenerCultivosIA = async (): Promise<{
  cultivo_por_defecto: string;
  cultivos: CultivoCatalogo[];
}> => {
  const respuesta = await ejecutarFetchSeguro("/api/ia/cultivos");
  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el catalogo de cultivos");
  }
  const data = (await respuesta.json()) as {
    cultivo_por_defecto?: string;
    cultivos?: CultivoCatalogo[];
  };
  return {
    cultivo_por_defecto: data.cultivo_por_defecto || "Tomate",
    cultivos: Array.isArray(data.cultivos) ? data.cultivos : [],
  };
};

export const registrarCultivoIA = async (
  nombre: string
): Promise<{ cultivo: string; cultivos: CultivoCatalogo[] }> => {
  const respuesta = await ejecutarFetchSeguro("/api/ia/cultivos", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo agregar el cultivo al selector");
  }
  const data = (await respuesta.json()) as {
    cultivo?: string;
    cultivos?: CultivoCatalogo[];
  };
  return {
    cultivo: data.cultivo || nombre.trim(),
    cultivos: Array.isArray(data.cultivos) ? data.cultivos : [],
  };
};

export const obtenerDiagnosticoIA = async (
  dispositivoId: string = DISPOSITIVO_ACTIVO,
  cultivo?: string
): Promise<{ diagnostico: DiagnosticoIA; cultivo: string }> => {
  const query = cultivo ? `?cultivo=${encodeURIComponent(cultivo)}` : "";
  try {
    const respuesta = await ejecutarFetchSeguro(
      `/api/ia/diagnostico/${dispositivoId}${query}`
    );
    if (respuesta.ok) {
      const json = (await respuesta.json()) as RespuestaDiagnosticoBackend;
      return {
        diagnostico: json.diagnostico,
        cultivo: json.cultivo || cultivo || "Tomate",
      };
    }
  } catch {
    // Continuar a lectura de contingencia
  }

  try {
    const diagRef = ref(db, `invernadero/${dispositivoId}/ultimo_diagnostico_ia`);
    const snap = await get(diagRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, unknown>;
      return {
        diagnostico: {
          estado_general: (val.estado_general as DiagnosticoIA["estado_general"]) || "DESCONOCIDO",
          riesgo_detectado: String(val.riesgo_detectado || "Sin anomalía reportada"),
          recomendacion_tecnica: String(val.recomendacion_tecnica || "Mantener monitoreo continuo."),
          evaluacion_humedad: val.evaluacion_humedad
            ? String(val.evaluacion_humedad)
            : undefined,
          evaluacion_luz: val.evaluacion_luz ? String(val.evaluacion_luz) : undefined,
        },
        cultivo: String(val.cultivo || cultivo || "Tomate"),
      };
    }
  } catch {
    // Error en lectura de contingencia
  }

  throw new Error("No se pudo obtener el diagnóstico del servicio agronómico inteligente.");
};
