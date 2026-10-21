import { RefreshCw } from "lucide-react";

const OPCIONES_LIMITE = [24, 50, 100] as const;

interface FiltrosToolbarProps {
  limite: number;
  setLimite: (val: number) => void;
  consultarHistorial: (limite: number) => void;
  cargando: boolean;
}

export function FiltrosToolbar({
  limite,
  setLimite,
  consultarHistorial,
  cargando,
}: FiltrosToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
      <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-agro-border text-xs">
        {OPCIONES_LIMITE.map((cantidad) => (
          <button
            key={cantidad}
            onClick={() => setLimite(cantidad)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] sm:text-xs font-medium ${
              limite === cantidad
                ? "bg-slate-800 text-white shadow-sm font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {cantidad}
          </button>
        ))}
      </div>

      <button
        onClick={() => consultarHistorial(limite)}
        disabled={cargando}
        className="flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 border border-agro-border text-gray-300 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-agro-green" : ""}`} />
        <span>Actualizar</span>
      </button>
    </div>
  );
}