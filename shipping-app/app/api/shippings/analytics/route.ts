import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. CAPA DE SEGURIDAD (El Dashboard te tiene que mandar tu llave)
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.SHIPPING_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Acceso no autorizado. API Key inválida o faltante." },
        { status: 401 }
      );
    }

    // 2. RECOPILACIÓN DE MÉTRICAS CON PRISMA
    
    // A) Total histórico de envíos
    const totalShipments = await prisma.shipment.count();

    // B) Envíos agrupados por Estado (Cuántos PENDIENTES, cuántos ENTREGADOS, etc.)
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // C) Envíos agrupados por Empresa (Correo Argentino, Andreani, etc.)
    const shipmentsByCarrier = await prisma.shipment.groupBy({
      by: ['carrierName'],
      _count: { carrierName: true },
    });

    // D) Entregados en los últimos 7 días
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
    
    const recentDeliveries = await prisma.shipment.count({
      where: {
        status: "ENTREGADO",
        deliveredAt: { gte: sieteDiasAtras },
      },
    });

    // 3. FORMATEAR Y RESPONDER
    // Acomodamos los datos para que al Dashboard le sea súper fácil leerlos
    return NextResponse.json({
      total_shipments: totalShipments,
      recent_deliveries: recentDeliveries,
      by_status: shipmentsByStatus.map(s => ({
        status: s.status,
        count: s._count.status
      })),
      by_carrier: shipmentsByCarrier.map(c => ({
        carrier: c.carrierName,
        count: c._count.carrierName
      }))
    });

  } catch (error) {
    console.error("Error obteniendo analíticas del servicio de envíos y logística:", error);
    return NextResponse.json(
      { error: "Error interno al procesar las métricas de envíos y logística" },
      { status: 500 }
    );
  }
}