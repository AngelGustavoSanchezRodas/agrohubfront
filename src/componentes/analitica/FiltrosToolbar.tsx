import { RefreshCw } from "lucide-react";

interface FiltrosToolbarProps {
  rango: "24h" | "7d";
  setRango: (val: "24h" | "7d") => void;
  limite: number;
  setLimite: (val: number | ((prev: number) => number)) => void;
  consultarHistorial: (limite: number) => void;
  cargando: boolean;
}

export function FiltrosToolbar({
  rango,
  setRango,
  limite,
  setLimite,
  consultarHistorial,
  cargando,
}: FiltrosToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Botones de rango temporal */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-sm">
        <button
          onClick={() => {
            setRango("24h");
            setLimite(24);
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
            rango === "24h"
              ? "bg-slate-700 text-white shadow-sm font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          24 lecturas
        </button>
        <button
          onClick={() => {
            setRango("7d");
            setLimite(50);
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
            rango === "7d"
              ? "bg-slate-700 text-white shadow-sm font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          50 lecturas
        </button>
      </div>

      {/* Botón de actualización */}
      <button
        onClick={() => consultarHistorial(limite)}
        disabled={cargando}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-agro-green" : ""}`} />
        <span>Actualizar</span>
      </button>
    </div>
  );
}
