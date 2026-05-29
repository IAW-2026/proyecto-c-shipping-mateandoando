"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OperadorPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cargar los paquetes desde Neon al entrar a la página
  const fetchShipments = async () => {
    try {
      const res = await fetch("/api/shippings");
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error("Error cargando paquetes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Función para pegarle al PATCH de cambio de estado
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/shippings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Si salió bien, recargamos la lista para ver los datos frescos
        await fetchShipments();
      } else {
        alert("No se pudo actualizar el estado.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABEZAL */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel de Control Logístico</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Portal exclusivo para operadores y repartidores de correo.</p>
          </div>
          <Link 
            href="/" 
            className="text-xs font-semibold px-4 h-9 flex items-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            ← Volver al Rastreo Público
          </Link>
        </div>

        {/* TABLA DE CONTROL */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-500">Cargando paquetes en ruta...</div>
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">No hay paquetes registrados en el sistema todavía.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-4">ID Paquete (Package ID)</th>
                    <th className="p-4">Comprador</th>
                    <th className="p-4">Dirección</th>
                    <th className="p-4">Empresa</th>
                    <th className="p-4">Estado Actual</th>
                    <th className="p-4 text-right">Acción Repartidor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 max-w-[150px] truncate" title={shipment.packageId}>
                        {shipment.packageId}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{shipment.buyerName || "No asignado"}</div>
                        <div className="text-[10px] text-zinc-400">{shipment.buyerPhone || "Sin tel"}</div>
                      </td>
                      <td className="p-4 text-xs text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate" title={shipment.addressSnapshot}>
                        {shipment.addressSnapshot}
                      </td>
                      <td className="p-4 text-xs font-medium">{shipment.carrierName}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          shipment.status === "ENTREGADO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          shipment.status === "EN_TRANSITO" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          shipment.status === "DESPACHADO" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {updatingId === shipment.id ? (
                          <span className="text-xs text-zinc-400 animate-pulse">Guardando...</span>
                        ) : (
                          <select
                            value={shipment.status}
                            onChange={(e) => handleStatusChange(shipment.packageId, e.target.value)}
                            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="DESPACHADO">DESPACHADO</option>
                            <option value="EN_TRANSITO">EN TRANSITO</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="RETORNADO">RETORNADO</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}