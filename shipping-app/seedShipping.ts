import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Inicialización de Prisma con el adaptador correspondiente para scripts independientes
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Ejecutando Algoritmo Determinista para Shipping App (Marzo - Junio 2026)...');

  // Listas de datos para generar 30 perfiles únicos y realistas
  const nombres = ["Agustin", "Lucia", "Martin", "Sofia", "Juan", "Maria", "Facundo", "Valentina", "Matias", "Camila"];
  const apellidos = ["Ramirez", "Gomez", "Perez", "Lopez", "Diaz", "Martinez", "Gonzalez", "Rodriguez", "Fernandez", "Silva"];
  const calles = ["Alem", "Chiclana", "Alsina", "O'Higgins", "Sarmiento", "Brown", "San Martin", "Belgrano", "Rivadavia", "Mitre"];
  const ciudades = ["Bahia Blanca", "Punta Alta", "Monte Hermoso", "Tornquist", "Coronel Dorrego"];

  const enviosHistoricos = [];

  // Generamos el cruce con las exactamente 60 transacciones
  for (let i = 1; i <= 60; i++) {
    // 1. Identificadores idénticos a los de la Payments App
    const hexI = i.toString(16).padStart(12, '0');
    const purchaseOrderId = `b0000000-0000-0000-0000-${hexI}`;
    const idShipment = `d0000000-0000-0000-0000-${hexI}`;
    const packageId = `e0000000-0000-0000-0000-${hexI}`;

    // 2. Lógica del Comprador (1 a 30)
    const buyerIndex = (i % 30) + 1;
    const idBuyer = `user_buyer_0000000000000000000_${buyerIndex.toString().padStart(2, '0')}`;
    
    // Asignación determinista de identidad basada en el buyerIndex
    const firstName = nombres[buyerIndex % nombres.length];
    const lastName = apellidos[buyerIndex % apellidos.length];
    const address = `${calles[buyerIndex % calles.length]} ${100 + (buyerIndex * 15)}, ${ciudades[buyerIndex % ciudades.length]}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${buyerIndex}@ejemplo.com`;
    const phone = `2914${buyerIndex.toString().padStart(5, '0')}8`;

    // 3. Cálculos de Costos de Envío (Iguales a la Payments App)
    const shippingCost = 1500 + ((i % 3) * 500); // 1500, 2000 o 2500
    const carrierName = i % 2 === 0 ? 'Correo Argentino' : 'Andreani';

    // 4. Mapeo de Estados de Pago
    let statusPago = 'APROBADO';
    if (i % 7 === 0) statusPago = 'CANCELADO';
    else if (i % 11 === 0) statusPago = 'REEMBOLSADO';
    else if (i % 13 === 0) statusPago = 'PENDIENTE';

    // La logística SOLO entra en juego si el pago se aprobó o se reembolsó (ya había arrancado)
    if (statusPago === 'APROBADO' || statusPago === 'REEMBOLSADO') {
      
      // 5. Distribución Temporal (Igual a la Payments App)
      const monthOffset = Math.floor((i - 1) / 15);
      const day = 1 + (i % 27);
      const hora = 9 + (i % 12);
      const minuto = (i * 7) % 60;
      
      const createdAt = new Date(Date.UTC(2026, 2 + monthOffset, day, hora, minuto, 0));
      
      // Simulación de tiempos logísticos
      const dispatchedAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // Se despacha al día siguiente
      let deliveredAt: Date | null = new Date(dispatchedAt.getTime() + 48 * 60 * 60 * 1000); // Se entrega 2 días después
      
      // --- SOLUCIÓN AQUÍ: Forzamos el tipo explícito sin asignación previa para evitar el bloqueo del compilador ---
      let statusLogistica: ShipmentStatus;
      let historyEvents = [];

      // Historial básico común a todos
      historyEvents.push({ date: createdAt, event: 'Orden de envío registrada. Esperando preparación del vendedor.' });
      historyEvents.push({ date: dispatchedAt, event: `Paquete recolectado y despachado por ${carrierName}.` });

      if (statusPago === 'REEMBOLSADO') {
        statusLogistica = ShipmentStatus.RETORNADO;
        deliveredAt = null;
        const returnDate = new Date(dispatchedAt.getTime() + 24 * 60 * 60 * 1000);
        historyEvents.push({ date: returnDate, event: 'No se ha podido concretar la entrega porque no te encontramos en tu hogar. El paquete está retornando al origen.' });
      } else if (monthOffset === 3 && i > 56) {
        // Los últimos 4 pedidos de Junio quedan "vivos" para que el sistema tenga actividad actual
        statusLogistica = i % 2 === 0 ? ShipmentStatus.EN_TRANSITO : ShipmentStatus.DESPACHADO;
        deliveredAt = null;
        if (statusLogistica === ShipmentStatus.EN_TRANSITO) {
          historyEvents.push({ date: new Date(dispatchedAt.getTime() + 12 * 60 * 60 * 1000), event: 'El paquete se encuentra en tránsito hacia el nodo regional.' });
        }
      } else {
        // Entrega normal
        statusLogistica = ShipmentStatus.ENTREGADO;
        historyEvents.push({ date: new Date(dispatchedAt.getTime() + 24 * 60 * 60 * 1000), event: 'Paquete en centro de distribución local.' });
        historyEvents.push({ date: deliveredAt, event: 'Entregado en el domicilio del comprador.' });
      }

      enviosHistoricos.push({
        id: idShipment,
        purchaseOrderId,
        packageId,
        carrierName,
        shippingCost,
        addressSnapshot: address,
        status: statusLogistica,
        createdAt,
        updatedAt: deliveredAt ? deliveredAt : dispatchedAt,
        dispatchedAt,
        deliveredAt,
        buyerId: idBuyer,
        buyerName: `${firstName} ${lastName}`,
        buyerPhone: phone,
        buyerEmail: email,
        history: historyEvents
      });
    }
  }

  console.log(` ⌛ Guardando ${enviosHistoricos.length} guías logísticas con historiales de seguimiento...`);

  for (const env of enviosHistoricos) {
    const { history, ...shipmentData } = env;

    // Usamos Upsert para que el script no rompa nada si Dolores lo corre dos veces
    await prisma.shipment.upsert({
      where: { packageId: env.packageId },
      update: {
        status: env.status,
        updatedAt: env.updatedAt
      },
      create: {
        ...shipmentData,
        history: {
          create: history
        }
      }
    });
  }

  console.log('✅ ¡Seeding de la Shipping App finalizado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error al inyectar los datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });