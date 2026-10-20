/** Estación que el Heltec usa hoy en Firebase y en el panel. */
export const DISPOSITIVO_ACTIVO = "invernadero_prueba_01";

/**
 * Nodos viejos de prueba que siguen en Firebase pero ya no son la estación operativa.
 * No se listan en Estaciones ni se mezclan con el monitoreo actual.
 */
export const NODOS_OBSOLETOS = new Set(["invernadero_01"]);

export function esNodoObsoleto(id: string): boolean {
  return NODOS_OBSOLETOS.has(id);
}
