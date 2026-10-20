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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-sm">
        {OPCIONES_LIMITE.map((cantidad) => (
          <button
            key={cantidad}
            onClick={() => setLimite(cantidad)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              limite === cantidad
                ? "bg-slate-700 text-white shadow-sm font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {cantidad} lecturas
          </button>
        ))}
      </div>

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
