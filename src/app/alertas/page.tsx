"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Bot,
  Clock,
  Filter,
  Check,
  Zap,
} from "lucide-react";

interface AlertaIA {
  id: string;
  titulo: string;
  severidad: "critica" | "advertencia" | "informativa" | "resuelta";
  dispositivoId: string;
  ubicacion: string;
  diagnosticoIA: string;
  recomendacion: string;
  fecha: string;
  leida: boolean;
  accionSugerida?: string;
}

const ALERTAS_INICIALES: AlertaIA[] = [
  {
    id: "ALT-2026-0891",
    titulo: "Detección de Estrés Hídrico en Sustrato",
    severidad: "critica",
    dispositivoId: "invernadero_prueba_01",
    ubicacion: "Sector A - Zona de Cultivo",
    diagnosticoIA:
      "El modelo de regresión detectó humedad de suelo en 18.2% con temperatura sostenida de 29.8°C durante 180 minutos consecutivos, superando el umbral de desecación radicular.",
    recomendacion:
      "Se requiere activación inmediata de la bomba de agua por 12 minutos para restaurar el contenido volumétrico de agua (VWC) óptimo.",
    fecha: "Hoy a las 15:42",
    leida: false,
    accionSugerida: "Activar ciclo de riego de emergencia",
  },
  {
    id: "ALT-2026-0888",
    titulo: "Riesgo de Proliferación Fúngica por Humedad Alta",
    severidad: "advertencia",
    dispositivoId: "invernadero_02",
    ubicacion: "Sector B - Hortalizas",
    diagnosticoIA:
      "La red neuronal de patología vegetal calculó un 84% de probabilidad de condensación foliar debido a una humedad ambiente persistente del 92% con diferencial térmico bajo.",
    recomendacion:
      "Encender ventilación forzada o regular el cierre de cortinas cenitales para favorecer la circulación de aire seco.",
    fecha: "Hoy a las 13:10",
    leida: false,
    accionSugerida: "Ventilar sector",
  },
  {
    id: "ALT-2026-0875",
    titulo: "Anomalía Térmica Nocturna Detectada",
    severidad: "advertencia",
    dispositivoId: "invernadero_semillero",
    ubicacion: "Área de Germinación",
    diagnosticoIA:
      "Descenso abrupto de 4.5°C en un intervalo de 20 minutos durante la madrugada. Patrón atípico con respecto al promedio estacional.",
    recomendacion:
      "Verificar el aislamiento térmico y el funcionamiento del calefactor auxiliar del semillero.",
    fecha: "Ayer a las 03:25",
    leida: true,
  },
  {
    id: "ALT-2026-0850",
    titulo: "Ciclo de Riego Automático Concluido",
    severidad: "resuelta",
    dispositivoId: "invernadero_prueba_01",
    ubicacion: "Sector A - Zona de Cultivo",
    diagnosticoIA:
      "El actuador de la bomba completó la irrigación programada. Los niveles de humedad de suelo alcanzaron el rango meta (62%).",
    recomendacion: "Parámetros restablecidos al régimen agronómico nominal.",
    fecha: "Ayer a las 18:00",
    leida: true,
  },
  {
    id: "ALT-2026-0842",
    titulo: "Calibración Periódica de Sensor Sugerida",
    severidad: "informativa",
    dispositivoId: "estacion_meteo_ext",
    ubicacion: "Exterior Perimetral",
    diagnosticoIA:
      "Algoritmo de deriva detectó un desfase sistemático de +1.2% en lecturas de humedad relativa en comparación con los valores barométricos locales.",
    recomendacion: "Programar limpieza e higrometría de referencia en el próximo mantenimiento.",
    fecha: "Hace 2 días",
    leida: true,
  },
];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaIA[]>(ALERTAS_INICIALES);
  const [filtro, setFiltro] = useState<string>("todas");
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  const alertasFiltradas = alertas.filter((a) => {
    if (filtro === "todas") return true;
    return a.severidad === filtro;
  });

  const marcarComoAtendida = (id: string) => {
    setAlertas((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, severidad: "resuelta", leida: true } : a
      )
    );
    setMensajeAccion(`Alerta ${id} marcada como atendida y archivada.`);
  };

  const ejecutarAccion = (id: string, accion?: string) => {
    setAlertas((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, severidad: "resuelta", leida: true } : a
      )
    );
    setMensajeAccion(`Comando ejecutado para ${id}: "${accion || "Acción completada"}".`);
  };

  const conteoCriticas = alertas.filter((a) => a.severidad === "critica").length;
  const conteoAdvertencias = alertas.filter((a) => a.severidad === "advertencia").length;
  const conteoInformativas = alertas.filter((a) => a.severidad === "informativa").length;
  const conteoResueltas = alertas.filter((a) => a.severidad === "resuelta").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera del modulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-agro-orange" />
            Centro de Alertas y Diagnósticos IA
          </h2>
          <p className="text-gray-400 mt-1">
            Bandeja de advertencias generadas por los modelos analíticos y predictivos de Python.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-agro-dark border border-agro-border px-3.5 py-2 rounded-xl text-xs font-mono text-gray-300">
          <Bot className="w-4 h-4 text-agro-green" />
          <span>Motor de IA: FastAPI Activo</span>
        </div>
      </div>

      {/* Tarjetas de Resumen de Incidentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-red-400">Críticas</span>
          <div className="mt-2 text-3xl font-extrabold text-red-500">{conteoCriticas}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Acción inmediata recomendada</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-amber-400">Advertencias</span>
          <div className="mt-2 text-3xl font-extrabold text-amber-500">{conteoAdvertencias}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Tendencias preventivas</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-blue-400">Informativas</span>
          <div className="mt-2 text-3xl font-extrabold text-blue-400">{conteoInformativas}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Avisos del sistema</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-agro-green">Resueltas</span>
          <div className="mt-2 text-3xl font-extrabold text-agro-green">{conteoResueltas}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Histórico de mitigaciones</span>
        </div>
      </div>

      {/* Notificacion de accion */}
      {mensajeAccion && (
        <div className="bg-black/60 border border-agro-green text-agro-green p-3.5 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{mensajeAccion}</span>
        </div>
      )}

      {/* Filtros de la bandeja */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
        {[
          { id: "todas", label: "Todas las Alertas" },
          { id: "critica", label: "Críticas" },
          { id: "advertencia", label: "Advertencias" },
          { id: "informativa", label: "Informativas" },
          { id: "resuelta", label: "Resueltas" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              filtro === f.id
                ? "bg-agro-orange text-black font-semibold"
                : "bg-agro-dark border border-agro-border text-gray-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Alertas IA */}
      <div className="space-y-4">
        {alertasFiltradas.length === 0 ? (
          <div className="bg-agro-dark border border-agro-border rounded-xl p-12 text-center text-gray-500 text-sm">
            No se encontraron alertas en la categoría seleccionada.
          </div>
        ) : (
          alertasFiltradas.map((alerta) => (
            <div
              key={alerta.id}
              className={`bg-agro-dark border rounded-xl p-6 transition-colors ${
                alerta.severidad === "critica"
                  ? "border-red-900/60 bg-red-950/10"
                  : alerta.severidad === "advertencia"
                  ? "border-amber-900/60 bg-amber-950/10"
                  : alerta.severidad === "resuelta"
                  ? "border-agro-green/30 bg-black/40 opacity-75"
                  : "border-agro-border"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Badge de Severidad */}
                    {alerta.severidad === "critica" && (
                      <span className="bg-red-500/20 border border-red-500 text-red-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Crítica
                      </span>
                    )}
                    {alerta.severidad === "advertencia" && (
                      <span className="bg-amber-500/20 border border-amber-500 text-amber-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Advertencia
                      </span>
                    )}
                    {alerta.severidad === "informativa" && (
                      <span className="bg-blue-500/20 border border-blue-500 text-blue-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Informativa
                      </span>
                    )}
                    {alerta.severidad === "resuelta" && (
                      <span className="bg-agro-green/20 border border-agro-green text-agro-green font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Resuelta
                      </span>
                    )}

                    <span className="text-xs font-mono text-gray-500">
                      {alerta.id}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {alerta.ubicacion} ({alerta.dispositivoId})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {alerta.titulo}
                  </h3>

                  {/* Diagnostico de la IA */}
                  <div className="bg-black/60 border border-agro-border rounded-xl p-3.5 text-xs text-gray-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-agro-orange">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Diagnóstico Generado por el Motor Python:</span>
                    </div>
                    <p className="leading-relaxed text-gray-300">
                      {alerta.diagnosticoIA}
                    </p>
                  </div>

                  {/* Recomendacion de la IA */}
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">Recomendación agronómica: </span>
                    {alerta.recomendacion}
                  </div>
                </div>

                {/* Acciones y Metadatos */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{alerta.fecha}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {alerta.severidad !== "resuelta" && (
                      <>
                        {alerta.accionSugerida && (
                          <button
                            onClick={() => ejecutarAccion(alerta.id, alerta.accionSugerida)}
                            className="bg-agro-orange hover:bg-orange-500 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Ejecutar</span>
                          </button>
                        )}
                        <button
                          onClick={() => marcarComoAtendida(alerta.id)}
                          className="bg-black hover:bg-neutral-900 border border-agro-border hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          Atender
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
