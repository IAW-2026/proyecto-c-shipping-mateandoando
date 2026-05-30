import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

interface EstimateRequestBody {
  destination_zip_code: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EstimateRequestBody = await request.json();
    
    if (!body.destination_zip_code) {
        return NextResponse.json(
            { error: "Falta el campo destination_zip_code en el body" },
            { status: 400 }
        );
    }
    //Logica para calcular el costo del envio y dias estimados de demora en funcion del codigo postal.
    const zip = parseInt(body.destination_zip_code);

    if (isNaN(zip)) {
    return NextResponse.json({ error: "Codigo postal invalido" }, { status: 400 });
    }

    // Asumo que los envios salen de Bahia Blanca
    let cost = 2500; // Costo base
    let estimated_days = 1; // Entrega en 24hs si es local

    switch (true) {
      case zip === 8000:
        // Envios dentro de Bahia Blanca
        cost += 500;
        estimated_days = 1;
        break;
      case zip >= 7000 && zip <= 8500:
        // Envios a ciudades vecinas a Bahia Blanca
        cost += 1500;
        estimated_days = 2;
        break;
      case (zip >= 1000 && zip <= 1999) || (zip >= 6000 && zip <= 6999):
        // Envios al resto de la provincia de Buenos Aires
        cost += 6500;
        estimated_days = 5;
        break;
      case zip >= 5000 && zip <= 5999:
        // Envios al centro del pais
        cost += 8000;
        estimated_days = 7;
        break;
      default:
        // Envios al resto del pais
        cost += 10000;
        estimated_days = 14;
    }

    // Respuesta con el costo y días estimados
    return NextResponse.json({
      cost,
      estimated_days,
    }); 
    } catch (error) {
        return NextResponse.json(
            { error: "Error al calcular el costo de envío" },
            { status: 500 }
        );
    }
}