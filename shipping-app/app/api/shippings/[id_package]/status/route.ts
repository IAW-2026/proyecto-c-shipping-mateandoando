import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

// 1. Tipamos el cuerpo que nos envía el operador logístico
interface UpdateStatusRequestBody {
  status: ShipmentStatus; // Valida que sea uno de tus Enums en español (ej: EN_TRANSITO, DELIVERED, etc.)
}

type RouteParams = { params: Promise<{ id_package: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id_package } = await params;
    const body: UpdateStatusRequestBody = await request.json();

    // Validación básica de que nos envíen el estado en el JSON
    if (!body.status) {
      return NextResponse.json(
        { error: "El campo status es requerido" },
        { status: 400 }
      );
    }

    // 2. Actualizamos el estado. Prisma actualizará SOLO el campo updatedAt por nosotros.
    // También creamos el renglón en el historial de forma automática.
    const updatedShipment = await prisma.shipment.update({
      where: { packageId: id_package },
      data: {
        status: body.status,
        history: {
          create: {
            event: `El operador logístico cambió el estado a: ${body.status.replace("_", " ")}`
          }
        }
      }
    });

    // 3. Respondemos con la estructura exacta que pide la materia,
    // usando el valor real de updatedAt guardado en la base de datos.
    return NextResponse.json({
      id_shipments: updatedShipment.id,
      status: updatedShipment.status, // Devolverá el enum (ej: "EN_TRANSITO")
      updated_at: updatedShipment.updatedAt.toISOString().split("T")[0] // Convierte a formato "YYYY-MM-DD"
    });

  } catch (error: any) {
    console.error("Error al actualizar el estado del envío:", error);

    // Si el id_package no existe en la base de datos, Prisma tira el código P2025
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