import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

interface DispatchRequestBody {
  id_package: string;
  carrier_name: string;
  shipping_cost: number;
  address_snapshot: string;
  id_user: string; 
}

type RouteParams = { params: Promise<{ id_package: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.SHIPPING_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Acceso no autorizado. API Key inválida o faltante." },
        { status: 401 }
      );
    }

    const body: DispatchRequestBody = await request.json();
    const { id_package } = await params;

    if (!body.id_package || !body.carrier_name || !body.shipping_cost || !body.address_snapshot || !body.id_user) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en el body" },
        { status: 400 }
      );
    }

    const BUYER_APP_URL = process.env.BUYER_APP_URL || "http://localhost:3001"; 
    let customerData = null;

    try {
      const buyerResponse = await fetch(`${BUYER_APP_URL}/api/customers/${body.id_user}`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BUYER_API_KEY || "" 
        }
      });
      
      if (buyerResponse.ok) {
        customerData = await buyerResponse.json();
      } else {
        console.warn(`La Buyer App respondió con estado: ${buyerResponse.status}`);
      }
    } catch (fetchError) {
      console.error("No se pudo conectar con la Buyer App:", fetchError);
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
        
        buyerId: body.id_user,
        buyerName: customerData ? `${customerData.first_name} ${customerData.last_name}` : "No disponible",
        buyerPhone: customerData?.phone || "No disponible",
        buyerEmail: customerData?.email || "No disponible",
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