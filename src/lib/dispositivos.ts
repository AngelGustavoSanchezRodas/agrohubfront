/**
 * Gestion de identificadores de estacion y dispositivos.
 * Los identificadores reales provienen directamente de Firebase y el backend.
 */

const CLAVE_DISPOSITIVO_LOCAL = "agrohub_dispositivo_activo";

/** Fallback inicial si aun no se han sincronizado estaciones desde Firebase o la API */
export const DISPOSITIVO_ACTIVO =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DISPOSITIVO_ID) ||
  "invernadero_prueba_01";

/**
 * Obtiene el dispositivo activo persistido en el navegador o el valor predeterminado.
 */
export function obtenerDispositivoActivo(): string {
  if (typeof window === "undefined") {
    return DISPOSITIVO_ACTIVO;
  }
  try {
    const guardado = window.localStorage.getItem(CLAVE_DISPOSITIVO_LOCAL)?.trim();
    return guardado || DISPOSITIVO_ACTIVO;
  } catch {
    return DISPOSITIVO_ACTIVO;
  }
}

/**
 * Guarda la seleccion de estacion en el almacenamiento local.
 */
export function guardarDispositivoActivo(idDispositivo: string): void {
  if (typeof window === "undefined") return;
  try {
    const limpio = idDispositivo.trim();
    if (limpio) {
      window.localStorage.setItem(CLAVE_DISPOSITIVO_LOCAL, limpio);
      window.dispatchEvent(
        new CustomEvent("agrohub_dispositivo_cambiado", { detail: limpio })
      );
    }
  } catch {
    // Manejo seguro en caso de navegacion privada
  }
}

/**
 * No censura dispositivos arbitrariamente. Toda estacion en Firebase o Supabase es valida.
 */
export function esNodoObsoleto(_id?: string): boolean {
  void _id;
  return false;
}
