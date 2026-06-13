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

    // 1. ACTUALIZAMOS TU BASE DE DATOS
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

    // 2. DISPARAMOS EL WEBHOOK SI EL ESTADO ES "ENTREGADO"
    if (updatedShipment.status === "ENTREGADO") {
      const sellerAppUrl = process.env.NEXT_PUBLIC_SELLER_URL || "https://mateandoando-seller-app.vercel.app";
      const sellerApiKey = process.env.SELLER_API_KEY || "sk_seller_webhook_2026";

      console.log(`[Webhook] Notificando a Seller App la entrega del paquete: ${id_package}`);

      try {
        const webhookRes = await fetch(`${sellerAppUrl}/api/packages/${id_package}/delivered`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": sellerApiKey
          },
          body: JSON.stringify({
            status: "ENTREGADO",
            id_shipments: updatedShipment.id
            //delivered_at: updatedShipment.deliveredAt?.toISOString() 
          })
        });

        if (!webhookRes.ok) {
          console.error(`[Webhook Error] La Seller App respondió con error: ${webhookRes.status}`);
        } else {
          console.log(`[Webhook Success] Seller App notificada correctamente.`);
        }
      } catch (webhookErr) {
        // Capturamos el error solo para loguearlo. 
        // No frenamos la ejecución porque en NUESTRA base de datos ya se guardó con éxito.
        console.error("[Webhook Error] Falló la conexión con la Seller App:", webhookErr);
      }
    }

    // 3. RESPONDEMOS A TU FRONTEND
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