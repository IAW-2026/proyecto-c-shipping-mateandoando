import { NextRequest, NextResponse } from "next/server";

interface CostRequestBody {
  destination_zip_code: number | string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CostRequestBody = await request.json();
    const zipCodeStr = body.destination_zip_code?.toString().trim();

    if (!zipCodeStr) {
      return NextResponse.json(
        { error: "El campo destination_zip_code es requerido" },
        { status: 400 }
      );
    }

    // Asumo que los envios salen de Bahia Blanca
    const zipCodeNum = Number(zipCodeStr);
    let carrierName = "Correo Argentino";
    let costPackage = 2500; // Costo base
    switch (true) {
      case zipCodeStr === "8000":
        // Envios dentro de Bahia Blanca
        costPackage += 500;
        break;
      case zipCodeStr >= "7000" && zipCodeStr <= "8500":
        // Envios a ciudades vecinas a Bahia Blanca
        costPackage += 1500;
        break;
      case (zipCodeStr >= "1000" && zipCodeStr <= "1999") || (zipCodeStr >= "6000" && zipCodeStr <= "6999"):
        // Envios al resto de la provincia de Buenos Aires
        costPackage += 6500;
        break;
      case zipCodeStr >= "5000" && zipCodeStr <= "5999":
        // Envios al centro del pais
        costPackage += 8000;
        break;
      default:
        // Envios al resto del pais
        costPackage += 10000;
    }

    return NextResponse.json({
      carrier_name: carrierName,
      cost_package: costPackage
    });

  } catch (error) {
    console.error("Error al calcular el costo:", error);
    return NextResponse.json(
      { error: "Error interno al calcular el costo del paquete" },
      { status: 500 }
    );
  }
}