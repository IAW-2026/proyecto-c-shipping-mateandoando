// app/api/shippings/route.ts (Ruta interna para tu tabla)
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const data = await prisma.shipment.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}