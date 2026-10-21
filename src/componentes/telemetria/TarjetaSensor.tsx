import React from "react";

interface TarjetaSensorProps {
  titulo: string;
  valor: number | string;
  unidad: string;
  subtitulo: string;
  icono: React.ElementType;
  iconoColorClass: string;
  badgeEstado?: {
    texto: string;
    clase: string;
  };
}

export function TarjetaSensor({
  titulo,
  valor,
  unidad,
  subtitulo,
  icono: Icono,
  iconoColorClass,
  badgeEstado,
}: TarjetaSensorProps) {
  return (
    <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-gray-400 font-semibold tracking-wider text-[11px] uppercase truncate">
          {titulo}
        </span>
        <div className={`p-2 rounded-xl bg-slate-950/60 border border-agro-border/50 shrink-0 ${iconoColorClass}`}>
          <Icono className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="flex flex-col gap-1 my-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            {valor}
          </span>
          <span className="text-gray-400 font-medium text-sm sm:text-base">
            {unidad}
          </span>
        </div>
        {badgeEstado && (
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeEstado.clase}`}>
              {badgeEstado.texto}
            </span>
          </div>
        )}
      </div>

      <span className="text-[11px] text-gray-500 mt-2 block font-normal leading-tight">
        {subtitulo}
      </span>
    </div>
  );
}
