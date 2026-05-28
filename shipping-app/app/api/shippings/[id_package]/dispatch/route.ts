import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

interface DispatchRequestBody {
  carrier_name: string;
  shipping_cost: number;
  address_snapshot: string;
}

type RouteParams = { params: Promise<{ id_package: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body: DispatchRequestBody = await request.json();
    const { id_package } = await params;

    if (!body.carrier_name || !body.shipping_cost || !body.address_snapshot) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en el body" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.create({
      data: {
        purchaseOrderId: crypto.randomUUID(), 
        packageId: id_package, 
        carrierName: body.carrier_name,
        shippingCost: body.shipping_cost, 
        addressSnapshot: body.address_snapshot,
        dispatchedAt: new Date(),
        status: ShipmentStatus.DESPACHADO,
      },
    });

    return NextResponse.json({
      id_shipments: shipment.id,
      status: shipment.status,
      dispatched_at: shipment.dispatchedAt,
    });

  } catch (error) {
    console.error("Error en el endpoint de despacho:", error);
    return NextResponse.json(
      { error: "Error creando el envío interno" },
      { status: 500 }
    );
  }
}