-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'dispatchedAtIN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "carrierName" TEXT NOT NULL,
    "shippingCost" DECIMAL(10,2) NOT NULL,
    "addressSnapshot" TEXT NOT NULL,
    "dispatchedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "status" "ShipmentStatus" NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" UUID NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
