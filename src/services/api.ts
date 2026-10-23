import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { lecturaReciente } from "@/lib/tiempo";
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
    return res;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error("No se pudo conectar con la API de AgroHub");
  }
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
  // 1. Fuente primaria: Firebase Realtime Database (lecturas en vivo transmitidas por hardware)
  try {
    const datosFirebase = await obtenerHistorialDesdeFirebase(dispositivoId);
    if (datosFirebase.length > 0) {
      return limite ? datosFirebase.slice(-limite) : datosFirebase;
    }
  } catch {
    // Continuar al backend si la consulta en tiempo real falla
  }

  // 2. Fuente secundaria / contingencia: Backend Supabase PostgreSQL
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
    // Backend no disponible
  }

  return [];
};

export const obtenerDispositivos = async (): Promise<DispositivoBackend[]> => {
  // 1. Fuente primaria: Firebase Realtime Database
  try {
    const invRef = ref(db, "invernadero");
    const snap = await get(invRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, Record<string, unknown>>;
      const listaFirebase: DispositivoBackend[] = Object.entries(val).map(([id, nodo]) => {
        const estadoActual = (nodo?.estado_actual || {}) as Record<string, unknown>;
        const diagnostico = (nodo?.ultimo_diagnostico_ia || {}) as Record<string, unknown>;
        const ts = estadoActual?.timestamp ? String(estadoActual.timestamp) : null;
        const conectado = ts ? lecturaReciente(ts) : false;

        return {
          id_dispositivo: id,
          nombre: String(nodo?.nombre || id),
          ubicacion: nodo?.ubicacion ? String(nodo.ubicacion) : null,
          cultivo: diagnostico?.cultivo ? String(diagnostico.cultivo) : null,
          estado_conexion: conectado ? "ONLINE" : "OFFLINE",
          fecha_instalacion: ts,
        };
      });

      if (listaFirebase.length > 0) {
        return listaFirebase;
      }
    }
  } catch {
    // Continuar a backend en dado caso que Firebase no responda
  }

  // 2. Fuente secundaria / contingencia: Backend FastAPI / Supabase
  try {
    const respuesta = await ejecutarFetchSeguro("/api/dispositivos");
    if (respuesta.ok) {
      const data = (await respuesta.json()) as DispositivoBackend[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Backend no disponible
  }

  return [];
};

export const obtenerAlertas = async (): Promise<AlertaAgronomica[]> => {
  // 1. Fuente primaria: Firebase Realtime Database (alertas activas en tiempo real)
  try {
    const invRef = ref(db, "invernadero");
    const snap = await get(invRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, Record<string, unknown>>;
      const alertas: AlertaAgronomica[] = [];
      let contador = 1;

      for (const [idDispositivo, nodo] of Object.entries(val)) {
        if (nodo?.ultima_alerta && typeof nodo.ultima_alerta === "object") {
          const al = nodo.ultima_alerta as Record<string, unknown>;
          alertas.push({
            id: contador++,
            id_dispositivo: idDispositivo,
            tipo_riesgo: String(al.tipo_riesgo || "ALERTA_ACTIVA"),
            severidad: String(al.severidad || "MEDIA"),
            mensaje_diagnostico: String(
              al.mensaje || al.mensaje_diagnostico || "Condición anómala detectada en la estación."
            ),
            estado: (al.estado === "RESUELTA" ? "RESUELTA" : "ACTIVA") as "ACTIVA" | "RESUELTA",
            creado_en: String(al.timestamp || new Date().toISOString()),
          });
        }
      }

      if (alertas.length > 0) {
        return alertas;
      }
    }
  } catch {
    // Continuar a backend en dado caso que Firebase no responda
  }

  // 2. Fuente secundaria / contingencia: Backend FastAPI / Supabase
  try {
    const respuesta = await ejecutarFetchSeguro("/api/alertas?limite=50");
    if (respuesta.ok) {
      const data = (await respuesta.json()) as AlertaAgronomica[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Backend no disponible
  }

  return [];
};

export const resolverAlerta = async (
  idAlerta: number,
  idDispositivo?: string
): Promise<void> => {
  try {
    const respuesta = await ejecutarFetchSeguro(`/api/alertas/${idAlerta}/resolver`, {
      method: "PATCH",
    });
    if (respuesta.ok) return;
  } catch {
    // Si la API no responde, resolver en Firebase si se dispone del identificador de estacion
  }

  if (idDispositivo) {
    try {
      const alertaRef = ref(db, `invernadero/${idDispositivo}/ultima_alerta`);
      await update(alertaRef, {
        estado: "RESUELTA",
        resuelta_en: new Date().toISOString(),
      });
      return;
    } catch {
      // Error al actualizar Firebase
    }
  }

  throw new Error("No se pudo marcar la alerta como resuelta");
};

export const actualizarCultivoDispositivo = async (
  dispositivoId: string,
  cultivo: string
): Promise<void> => {
  const cultivoLimpio = cultivo.trim();

  try {
    const respuesta = await ejecutarFetchSeguro(`/api/dispositivos/${dispositivoId}`, {
      method: "PATCH",
      body: JSON.stringify({ cultivo: cultivoLimpio }),
    });
    if (respuesta.ok) {
      const diagRef = ref(db, `invernadero/${dispositivoId}/ultimo_diagnostico_ia`);
      await update(diagRef, { cultivo: cultivoLimpio }).catch(() => {});
      return;
    }
  } catch {
    // Continuar a Firebase si la API no está disponible
  }

  try {
    const diagRef = ref(db, `invernadero/${dispositivoId}/ultimo_diagnostico_ia`);
    await update(diagRef, { cultivo: cultivoLimpio });
  } catch {
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
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CLAVE_CULTIVOS_LOCAL, JSON.stringify(siguiente));
    } catch {
      // Ignorar error de storage
    }
  }
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
          descripcion: `Cultivo registrado: ${id}`,
          notas: "Cultivo registrado por el usuario.",
          origen: "personalizado",
        }));
      return {
        cultivo_por_defecto: data.cultivo_por_defecto || remotos[0]?.id || (locales[0] ?? "Tomate"),
        cultivos: [...remotos, ...extras],
      };
    }
  } catch {
    // Recuperar cultivos reales de las estaciones en Firebase si no hay API
  }

  const cultivosDetectados = new Set<string>(locales);
  try {
    const invRef = ref(db, "invernadero");
    const snap = await get(invRef);
    if (snap.exists()) {
      const val = snap.val() as Record<string, Record<string, unknown>>;
      for (const nodo of Object.values(val)) {
        const diag = nodo?.ultimo_diagnostico_ia as Record<string, unknown> | undefined;
        if (diag?.cultivo && typeof diag.cultivo === "string" && diag.cultivo.trim()) {
          cultivosDetectados.add(diag.cultivo.trim());
        }
      }
    }
  } catch {
    // Error en lectura de estaciones
  }

  const lista = Array.from(cultivosDetectados);
  if (lista.length === 0) {
    lista.push("Tomate");
  }

  return {
    cultivo_por_defecto: lista[0],
    cultivos: lista.map((id) => ({
      id,
      descripcion: id,
      notas: "Cultivo detectado en las estaciones de monitoreo.",
      origen: "estacion_campo",
    })),
  };
};

export const registrarCultivoIA = async (
  nombre: string
): Promise<{ cultivo: string; cultivos: CultivoCatalogo[] }> => {
  const limpio = nombre.trim();
  guardarCultivoLocal(limpio);

  try {
    const respuesta = await ejecutarFetchSeguro("/api/ia/cultivos", {
      method: "POST",
      body: JSON.stringify({ nombre: limpio }),
    });
    if (respuesta.ok) {
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
    // Fallback local
  }

  const catalogo = await obtenerCultivosIA();
  return { cultivo: limpio, cultivos: catalogo.cultivos };
};

export const obtenerDiagnosticoIA = async (
  dispositivoId: string = DISPOSITIVO_ACTIVO,
  cultivo?: string
): Promise<{ diagnostico: DiagnosticoIA; cultivo: string }> => {
  // 1. Fuente primaria: Firebase Realtime Database (diagnostico en tiempo real guardado)
  // Solo se consulta Firebase primero si no se pidio regenerar expresamente para un cultivo distinto
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
            evaluacion_humedad: val.evaluacion_humedad ? String(val.evaluacion_humedad) : undefined,
            evaluacion_temperatura: val.evaluacion_temperatura ? String(val.evaluacion_temperatura) : undefined,
            evaluacion_luz: val.evaluacion_luz ? String(val.evaluacion_luz) : undefined,
          },
          cultivo: String(val.cultivo || "Tomate"),
        };
      }
    } catch {
      // Continuar al backend si Firebase no responde
    }
  }

  // 2. Fuente secundaria / Generacion a demanda: Backend FastAPI Gemini IA
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

  // Si falló el backend pero el nodo tiene diagnostico previo en Firebase, usarlo de contingencia
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
          evaluacion_humedad: val.evaluacion_humedad ? String(val.evaluacion_humedad) : undefined,
          evaluacion_temperatura: val.evaluacion_temperatura ? String(val.evaluacion_temperatura) : undefined,
          evaluacion_luz: val.evaluacion_luz ? String(val.evaluacion_luz) : undefined,
        },
        cultivo: String(val.cultivo || cultivo || "Tomate"),
      };
    }
  } catch {
    // Sin contingencia
  }

  throw new Error(
    errorApi || "No se pudo obtener el diagnóstico. Verifica la conexión con Firebase y la API."
  );
};
