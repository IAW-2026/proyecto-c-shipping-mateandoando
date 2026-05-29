"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  // Estados para el rastreo del paquete
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [errorTrack, setErrorTrack] = useState("");

  // Función de conexión al Endpoint de Rastreo (GET /api/shippings/track/{id_package})
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoadingTrack(true);
    setErrorTrack("");
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/shippings/track/${trackingId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No encontramos ningún paquete con ese número de seguimiento.");
      }

      setTrackingResult(data);
    } catch (err: any) {
      setErrorTrack(err.message || "Ocurrió un error al consultar el estado.");
    } finally {
      setLoadingTrack(false);
    }
  };

  // Función auxiliar para darle color a las pastillas de estado
  const getStatusBadgeClass = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s.includes("DELIVERED") || s.includes("ENTREGADO")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (s.includes("TRANSITO") || s.includes("VIAJE") || s.includes("RETIRADO")) {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    }
    return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-50">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold tracking-tighter shadow-sm shadow-blue-500/20">
              
            </div>
            <div>
              <span className="font-bold tracking-tight text-base block leading-none"></span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Módulo de Envíos</span>
            </div>
          </div>

          <Link 
            href="/operador" 
            className="text-xs font-semibold px-4 h-9 flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
             Acceso Operadores
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 sm:py-20 space-y-8">
        
        {/* TEXTO DE BIENVENIDA */}
        <div className="text-center space-y-2.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Siga su envío en tiempo real
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Ingrese el identificador único de su paquete para conocer el estado actual y el historial logístico.
          </p>
        </div>

        {/* MOTOR DE BÚSQUEDA */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ej: pck_01jm8w..."
                className="w-full h-12 pl-4 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loadingTrack}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
            >
              {loadingTrack ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                "Rastrear Paquete"
              )}
            </button>
          </form>

          {/* MENSAJE DE ERROR */}
          {errorTrack && (
            <div className="flex gap-2.5 items-start p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-xl">
              <span className="text-base select-none"></span>
              <p className="font-medium">{errorTrack}</p>
            </div>
          )}
        </div>

        {/* RESULTADO Y LÍNEA DE TIEMPO (TIMELINE) */}
        {trackingResult && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            
            {/* Cabezal del resultado */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Identificador consultado</span>
                <p className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300 select-all">{trackingId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border rounded-full ${getStatusBadgeClass(trackingResult.status || trackingResult.state)}`}>
                  {trackingResult.status || trackingResult.state || "PROCESADO"}
                </span>
              </div>
            </div>

            {/* Datos complementarios */}
            <div className="grid grid-cols-2 border-b border-zinc-100 dark:border-zinc-800 text-xs px-5 py-3 bg-zinc-50/20 dark:bg-zinc-900/20">
              <p className="text-zinc-500">Empresa Transportista: <strong className="text-zinc-800 dark:text-zinc-200 block mt-0.5 text-sm font-medium">{trackingResult.carrier_name || "Correo Argentino"}</strong></p>
              <p className="text-zinc-500">Última Actualización: <strong className="text-zinc-800 dark:text-zinc-200 block mt-0.5 text-sm font-medium">{trackingResult.updated_at ? new Date(trackingResult.updated_at).toLocaleDateString() : new Date().toLocaleDateString()}</strong></p>
            </div>

            {/* El Historial Logístico */}
            <div className="p-6 sm:p-8 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Historial de Movimientos</h3>
              
              <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-2.5 pl-6 space-y-6">
                {trackingResult.history && trackingResult.history.length > 0 ? (
                  trackingResult.history.map((item: any, i: number) => {
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="relative group">
                        
                        {/* Nodo indicador en la línea */}
                        <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-zinc-900 transition-all ${
                          isFirst 
                            ? "border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/50 scale-110" 
                            : "border-zinc-400 group-hover:border-zinc-600"
                        }`} />

                        {/* Contenido del hito */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-zinc-400 block dark:text-zinc-500 font-medium">
                            {item.date || new Date().toLocaleString()}
                          </span>
                          <p className={`text-sm font-semibold transition-colors ${
                            isFirst ? "text-blue-600 dark:text-blue-400 text-base" : "text-zinc-700 dark:text-zinc-300"
                          }`}>
                            {item.event || item.description || JSON.stringify(item)}
                          </p>
                          {item.location && (
                            <span className="text-xs text-zinc-400 block"> Ubicación: {item.location}</span>
                          )}
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-white dark:bg-zinc-900 ring-4 ring-blue-100 dark:ring-blue-950/50" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-zinc-400 block">{new Date().toLocaleDateString()}</span>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Envío Registrado / Despachado</p>
                      <p className="text-xs text-zinc-400">El paquete ingresó al sistema informático de la central logística y espera recolección.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* PIE DE PÁGINA */}
      <footer className="w-full py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 mt-auto">
        <p></p>
      </footer>

    </div>
  );
}