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

    // --- DEFINIMOS LA FECHA DE CORTE ---
    // Ignoramos todo lo anterior al 21 de Junio de 2026 a las 00:00 UTC
    const FECHA_CORTE = new Date('2026-06-21T00:00:00.000Z');

    // 2. RECOPILACIÓN DE MÉTRICAS CON PRISMA

    // A) Total de envíos a partir de la fecha de corte
    const totalShipments = await prisma.shipment.count({
      where: {
        createdAt: { gte: FECHA_CORTE } // Filtro de fecha aplicado
      }
    });

    // B) Envíos agrupados por Estado (Filtrados desde el Día Cero)
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        createdAt: { gte: FECHA_CORTE } // Filtro de fecha aplicado
      }
    });

    // C) Envíos agrupados por Empresa (Filtrados desde el Día Cero)
    const shipmentsByCarrier = await prisma.shipment.groupBy({
      by: ['carrierName'],
      _count: { carrierName: true },
      where: {
        createdAt: { gte: FECHA_CORTE } // Filtro de fecha aplicado
      }
    });

    // D) Entregados en los últimos 7 días (pero que sean posteriores a la fecha de corte)
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
    
    const recentDeliveries = await prisma.shipment.count({
      where: {
        status: "ENTREGADO",
        deliveredAt: { gte: sieteDiasAtras },
        createdAt: { gte: FECHA_CORTE } // Nos asegura no traer datos basura pre-coordinación
      },
    });

    // 3. FORMATEAR Y RESPONDER
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