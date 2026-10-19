import { Calendar, RefreshCw } from "lucide-react";

interface FiltrosToolbarProps {
  dispositivoId: string;
  setDispositivoId: (val: string) => void;
  rango: "24h" | "7d";
  setRango: (val: "24h" | "7d") => void;
  limite: number;
  setLimite: (val: number | ((prev: number) => number)) => void;
  consultarHistorial: (limite: number, id?: string) => void;
  cargando: boolean;
}

export function FiltrosToolbar({
  dispositivoId,
  setDispositivoId,
  rango,
  setRango,
  limite,
  setLimite,
  consultarHistorial,
  cargando,
}: FiltrosToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Selector de nodo */}
      <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
        <span className="text-gray-400 font-mono text-[11px]">Nodo:</span>
        <input
          type="text"
          value={dispositivoId}
          onChange={(e) => setDispositivoId(e.target.value)}
          placeholder="invernadero_prueba_01"
          className="bg-transparent text-white font-mono focus:outline-none w-36 text-xs"
        />
      </div>

      {/* Botones de rango */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-sm">
        <button
          onClick={() => {
            setRango("24h");
            setLimite(24);
          }}
          className={`px-3 py-1 rounded transition-colors cursor-pointer ${
            rango === "24h"
              ? "bg-slate-700 text-white shadow-sm font-medium"
              : "text-gray-400 hover:text-white"
          }`}
        >
          24h
        </button>
        <button
          onClick={() => {
            setRango("7d");
            setLimite(50);
          }}
          className={`px-3 py-1 rounded transition-colors cursor-pointer ${
            rango === "7d"
              ? "bg-slate-700 text-white shadow-sm font-medium"
              : "text-gray-400 hover:text-white"
          }`}
        >
          7d
        </button>
        <button
          onClick={() => setLimite((prev) => (prev === 24 ? 50 : 24))}
          className="px-3 py-1 text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer text-xs"
        >
          <Calendar className="w-4 h-4" /> Filtro ({limite})
        </button>
      </div>

      {/* Boton de actualizacion */}
      <button
        onClick={() => consultarHistorial(limite, dispositivoId)}
        disabled={cargando}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 px-3.5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Actualizar</span>
      </button>
    </div>
  );
}
