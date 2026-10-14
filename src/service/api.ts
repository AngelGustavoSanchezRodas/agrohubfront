const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DatosTelemetriaHistorica {
  id?: number | string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
  creado_en: string;
  [key: string]: unknown;
}

interface RespuestaHistorial {
  status: string;
  total: number;
  datos: DatosTelemetriaHistorica[];
}

export const alternarBombaAgua = async (encender: boolean): Promise<Record<string, unknown>> => {
  // Se recupera el token de la sesion actual del usuario
  const token = typeof window !== "undefined" ? localStorage.getItem("agrohub_jwt") : null;

  if (!token) {
    throw new Error("No hay sesion activa. Acceso denegado.");
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/control/bomba`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Inyeccion del JWT en la cabecera HTTP
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ estado: encender }),
    });

    if (respuesta.status === 401) {
      throw new Error("Token expirado o invalido. Por favor, inicie sesion nuevamente.");
    }

    if (!respuesta.ok) {
      throw new Error("Error en la comunicacion con el servidor");
    }

    return (await respuesta.json()) as Record<string, unknown>;
  } catch (error) {
    console.error("Error de seguridad ejecutando comando:", error);
    throw error;
  }
};

export const obtenerDatosGrafica = async (limite?: number): Promise<DatosTelemetriaHistorica[]> => {
  try {
    const url = limite ? `${API_URL}/api/historial?limite=${limite}` : `${API_URL}/api/historial`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("Error al obtener el historial de telemetria");
    }

    const json = (await respuesta.json()) as RespuestaHistorial;
    return json.datos;
  } catch (error) {
    console.error("Error consultando historial:", error);
    throw error;
  }
};