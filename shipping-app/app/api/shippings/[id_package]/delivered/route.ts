import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

type RouteParams = { params: Promise<{ id_package: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id_package } = await params;

    const updatedShipment = await prisma.shipment.update({
      where: { packageId: id_package },
      data: {
        status: ShipmentStatus.ENTREGADO,
        deliveredAt: new Date(),
        history: {
          create: {
            event: "Paquete entregado al comprador"
          }
        }
      }
    });

    return NextResponse.json({
      id_shipments: updatedShipment.id,
      status: updatedShipment.status, 
      delivered_at: updatedShipment.deliveredAt?.toISOString().split("T")[0] // Formato YYYY-MM-DD
    });

  } catch (error: any) {
    console.error("Error al marcar como entregado:", error);
    
    // Si el paquete no existe en la base de datos, prisma tira este codigo de error 
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "No se encontró ningún envío activo para este paquete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error interno al procesar la entrega" },
      { status: 500 }
    );
  }
}