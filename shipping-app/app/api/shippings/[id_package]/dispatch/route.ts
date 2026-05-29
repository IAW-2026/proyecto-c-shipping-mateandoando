import { NextRequest, NextResponse } from "next/server";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

// 1. Actualizamos la interfaz para exigir el id_user que te va a mandar la Seller App
interface DispatchRequestBody {
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
    const body: DispatchRequestBody = await request.json();
    const { id_package } = await params;

    // Controlamos que venga el id_user obligatorio
    if (!body.carrier_name || !body.shipping_cost || !body.address_snapshot || !body.id_user) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en el body (incluyendo id_user)" },
        { status: 400 }
      );
    }

    // 2. COMUNICACIÓN B2B: Vamos a buscar al comprador a la Buyer App de tu compañero
    const BUYER_APP_URL = process.env.BUYER_APP_URL || "http://localhost:3001"; 
    let customerData = null;

    try {
      // Le pegamos al endpoint de tu compañero usando el id_user recibido
      const buyerResponse = await fetch(`${BUYER_APP_URL}/api/customers/${body.id_user}`);
      
      if (buyerResponse.ok) {
        customerData = await buyerResponse.json();
      } else {
        console.warn(`La Buyer App respondió con estado: ${buyerResponse.status}`);
      }
    } catch (fetchError) {
      // Si la app de tu compañero está apagada o da timeout, lo atajamos acá 
      // para que tu proceso de despacho no se cancele por culpa de un externo.
      console.error("No se pudo conectar con la Buyer App:", fetchError);
    }

    // 3. CREACIÓN EN TU BASE DE DATOS DE NEON (Con tus nuevas columnas cargadas)
    const shipment = await prisma.shipment.create({
      data: {
        purchaseOrderId: crypto.randomUUID(), 
        packageId: id_package, 
        carrierName: body.carrier_name,
        shippingCost: body.shipping_cost, 
        addressSnapshot: body.address_snapshot,
        dispatchedAt: new Date(),
        status: ShipmentStatus.DESPACHADO,
        
        // Guardamos la información que recolectamos de la otra app
        buyerId: body.id_user,
        buyerName: customerData ? `${customerData.first_name} ${customerData.last_name}` : "No disponible",
        buyerPhone: customerData?.phone || "No disponible",
        buyerEmail: customerData?.email || "No disponible",
      },
    });

    // 4. RESPUESTA (Respetando tu formato original)
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