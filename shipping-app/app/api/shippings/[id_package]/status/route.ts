import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

interface UpdateStatusRequestBody {
  status: ShipmentStatus; 
}

type RouteParams = { params: Promise<{ id_package: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id_package } = await params;
    const body: UpdateStatusRequestBody = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "El campo status es requerido" },
        { status: 400 }
      );
    }

    const updatedShipment = await prisma.shipment.update({
      where: { packageId: id_package },
      data: {
        status: body.status,
        deliveredAt: body.status === "ENTREGADO" ? new Date() : undefined,
        history: {
          create: {
            event: `El operador logístico cambió el estado a: ${body.status.replace("_", " ")}`
          }
        }
      }
    });

    return NextResponse.json({
      id_shipments: updatedShipment.id,
      status: updatedShipment.status, 
      updated_at: updatedShipment.updatedAt.toISOString().split("T")[0] 
    });

  } catch (error: any) {
    console.error("Error al actualizar el estado del envío:", error);

    // Si el id_package no existe en la base de datos
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "No se encontró ningún envío activo para el paquete especificado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error interno al procesar la actualización de estado" },
      { status: 500 }
    );
  }
}