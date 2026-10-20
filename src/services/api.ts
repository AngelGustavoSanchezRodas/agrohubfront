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
  const esLocal = baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost");
  const candidatos = esLocal
    ? [baseUrl]
    : [baseUrl, "http://127.0.0.1:8000"];

  let ultimoError: unknown = null;
  for (const origen of candidatos) {
    try {
      const res = await fetch(`${origen}${ruta}`, { ...opciones, headers });
      if (res.ok || (res.status !== 404 && res.status !== 502 && res.status !== 503)) {
        return res;
      }
      ultimoError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      ultimoError = err;
    }
  }

  throw ultimoError instanceof Error
    ? ultimoError
    : new Error("No se pudo conectar con la API de AgroHub");
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

const CLAVE_CULTIVOS_LOCAL = "agrohub_cultivos_personalizados";

const leerCultivosLocales = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLAVE_CULTIVOS_LOCAL);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? data.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const guardarCultivoLocal = (nombre: string): string[] => {
  const limpio = nombre.trim();
  const actuales = leerCultivosLocales();
  const sinDup = actuales.filter((c) => c.toLowerCase() !== limpio.toLowerCase());
  const siguiente = [...sinDup, limpio];
  window.localStorage.setItem(CLAVE_CULTIVOS_LOCAL, JSON.stringify(siguiente));
  return siguiente;
};

export const obtenerCultivosIA = async (): Promise<{
  cultivo_por_defecto: string;
  cultivos: CultivoCatalogo[];
}> => {
  const locales = leerCultivosLocales();
  try {
    const respuesta = await ejecutarFetchSeguro("/api/ia/cultivos");
    if (respuesta.ok) {
      const data = (await respuesta.json()) as {
        cultivo_por_defecto?: string;
        cultivos?: CultivoCatalogo[];
      };
      const remotos = Array.isArray(data.cultivos) ? data.cultivos : [];
      const ids = new Set(remotos.map((c) => c.id.toLowerCase()));
      const extras = locales
        .filter((n) => !ids.has(n.toLowerCase()))
        .map((id) => ({
          id,
          descripcion: `Cultivo personalizado: ${id}`,
          temperatura_c: [18, 28],
          humedad_ambiente_pct: [45, 75],
          humedad_suelo_pct: [55, 80],
          luz_lux: [8000, 35000],
          notas: "Agregado localmente en este navegador.",
          origen: "personalizado",
        }));
      return {
        cultivo_por_defecto: data.cultivo_por_defecto || "Tomate",
        cultivos: [...remotos, ...extras],
      };
    }
  } catch {
    // Continuar con catalogo local
  }

  const base = ["Tomate", "Lechuga", "Pimiento", "Fresa", "Albahaca", "Pepino"];
  const unidos = [...base];
  for (const n of locales) {
    if (!unidos.some((c) => c.toLowerCase() === n.toLowerCase())) {
      unidos.push(n);
    }
  }
  return {
    cultivo_por_defecto: "Tomate",
    cultivos: unidos.map((id) => ({
      id,
      descripcion: id,
      temperatura_c: [18, 28],
      humedad_ambiente_pct: [45, 75],
      humedad_suelo_pct: [55, 80],
      luz_lux: [8000, 35000],
      notas: "",
      origen: "personalizado",
    })),
  };
};

export const registrarCultivoIA = async (
  nombre: string
): Promise<{ cultivo: string; cultivos: CultivoCatalogo[] }> => {
  const limpio = nombre.trim();
  try {
    const respuesta = await ejecutarFetchSeguro("/api/ia/cultivos", {
      method: "POST",
      body: JSON.stringify({ nombre: limpio }),
    });
    if (respuesta.ok) {
      guardarCultivoLocal(limpio);
      const data = (await respuesta.json()) as {
        cultivo?: string;
        cultivos?: CultivoCatalogo[];
      };
      return {
        cultivo: data.cultivo || limpio,
        cultivos: Array.isArray(data.cultivos) ? data.cultivos : [],
      };
    }
  } catch {
    // Fallback local si la API desplegada no tiene el endpoint o esta caída
  }

  const locales = guardarCultivoLocal(limpio);
  const catalogo = await obtenerCultivosIA();
  const ids = new Set(catalogo.cultivos.map((c) => c.id.toLowerCase()));
  for (const n of locales) {
    if (!ids.has(n.toLowerCase())) {
      catalogo.cultivos.push({
        id: n,
        descripcion: `Cultivo personalizado: ${n}`,
        temperatura_c: [18, 28],
        humedad_ambiente_pct: [45, 75],
        humedad_suelo_pct: [55, 80],
        luz_lux: [8000, 35000],
        notas: "Guardado en este navegador hasta sincronizar con la API.",
        origen: "personalizado",
      });
    }
  }
  return { cultivo: limpio, cultivos: catalogo.cultivos };
};

export const obtenerDiagnosticoIA = async (
  dispositivoId: string = DISPOSITIVO_ACTIVO,
  cultivo?: string
): Promise<{ diagnostico: DiagnosticoIA; cultivo: string }> => {
  const query = cultivo ? `?cultivo=${encodeURIComponent(cultivo)}` : "";
  let errorApi: string | null = null;

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
    if (respuesta.status === 404) {
      throw new Error(
        "No hay historial en Supabase para diagnosticar. Con el circuito apagado solo queda la última foto en Firebase."
      );
    }
    errorApi = `La API respondió ${respuesta.status} al pedir el diagnóstico.`;
  } catch (err) {
    if (err instanceof Error && err.message.includes("historial")) {
      throw err;
    }
    errorApi =
      err instanceof Error
        ? err.message === "Failed to fetch"
          ? "No hay conexión con la API. Arranca el backend o revisa NEXT_PUBLIC_API_URL."
          : err.message
        : "No se pudo conectar con la API.";
  }

  // Solo usar Firebase si NO se pidió regenerar para un cultivo concreto.
  // Si se pidió (ej. Tomate), no devolver un diagnóstico viejo de Pepino.
  if (!cultivo) {
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
          cultivo: String(val.cultivo || "Tomate"),
        };
      }
    } catch {
      // sin contingencia
    }
  }

  throw new Error(
    errorApi ||
      "No se pudo obtener un diagnóstico nuevo. Verifica que la API esté en marcha y actualizada."
  );
};
