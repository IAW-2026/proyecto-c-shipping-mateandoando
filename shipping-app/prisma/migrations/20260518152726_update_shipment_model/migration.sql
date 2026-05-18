/*
  Warnings:

  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_packageId_fkey";

-- DropForeignKey
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_purchaseOrderId_fkey";

-- DropTable
DROP TABLE "Package";

-- DropTable
DROP TABLE "PurchaseOrder";
