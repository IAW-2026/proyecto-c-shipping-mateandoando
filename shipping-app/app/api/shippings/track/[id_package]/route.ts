import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

type RouteParams = { params: Promise<{ id_package: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id_package } = await params;

    const shipment = await prisma.shipment.findFirst({
      where: { packageId: id_package },
      include: {
        history: {
          orderBy: { date: "asc" }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: "No se encontro un envio para el paquete especificado. " }, { status: 404 });
    }

    const formattedHistory = shipment.history.map((h) => ({
      date: h.date.toISOString().split("T")[0], // Convierte la fecha fea a "YYYY-MM-DD"
      event: h.event
    }));

  
    return NextResponse.json({
      status: shipment.status,            
      carrier_name: shipment.carrierName, 
      history: formattedHistory           
    });

  } catch (error) {
    console.error("Error al obtener el tracking:", error);
    return NextResponse.json(
      { error: "Error al obtener el seguimiento del paquete" },
      { status: 500 }
    );
  }
}