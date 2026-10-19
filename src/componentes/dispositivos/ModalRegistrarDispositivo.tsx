import React, { useState } from "react";
import { Plus } from "lucide-react";

interface ModalRegistrarDispositivoProps {
  abierto: boolean;
  onCerrar: () => void;
  onRegistrar: (datos: { id_dispositivo: string; nombre: string; ubicacion?: string }) => Promise<void>;
}

export function ModalRegistrarDispositivo({
  abierto,
  onCerrar,
  onRegistrar,
}: ModalRegistrarDispositivoProps) {
  const [nuevoId, setNuevoId] = useState<string>("");
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoId.trim() || !nuevoNombre.trim()) return;

    setGuardando(true);
    try {
      await onRegistrar({
        id_dispositivo: nuevoId.trim(),
        nombre: nuevoNombre.trim(),
        ubicacion: nuevaUbicacion.trim() || undefined,
      });
      setNuevoId("");
      setNuevoNombre("");
      setNuevaUbicacion("");
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-agro-dark border border-agro-border rounded-2xl p-6 max-w-md w-full space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-agro-green" />
            Registrar Nuevo Microcontrolador
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Agrega el identificador del hardware al catálogo de public.dispositivos en Supabase.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              ID del Dispositivo
            </label>
            <input
              type="text"
              required
              value={nuevoId}
              onChange={(e) => setNuevoId(e.target.value)}
              placeholder="ej: invernadero_02"
              className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Nombre Descriptivo
            </label>
            <input
              type="text"
              required
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="ej: Nodo Central Cultivo Tomate"
              className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Ubicación Física (Opcional)
            </label>
            <input
              type="text"
              value={nuevaUbicacion}
              onChange={(e) => setNuevaUbicacion(e.target.value)}
              placeholder="ej: Sector Sur - Invernadero B"
              className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-agro-green hover:bg-emerald-600 text-black font-bold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {guardando ? "Registrando..." : "Guardar en Supabase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
