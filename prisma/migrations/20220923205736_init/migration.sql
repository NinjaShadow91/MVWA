/*
  Warnings:

  - You are about to drop the column `BoughtWishListId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `CurrentWarehouseId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `PastWarehouseId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stockAvailable` on the `Product` table. All the data in the column will be lost.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_BoughtWishListId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_CurrentWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_PastWarehouseId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "BoughtWishListId",
DROP COLUMN "CurrentWarehouseId",
DROP COLUMN "PastWarehouseId",
DROP COLUMN "stockAvailable",
ADD COLUMN     "boughtWishListId" UUID,
ADD COLUMN     "currentWarehouseId" UUID,
ADD COLUMN     "pastWarehouseId" UUID,
ADD COLUMN     "stock" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_currentWarehouseId_fkey" FOREIGN KEY ("currentWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_pastWarehouseId_fkey" FOREIGN KEY ("pastWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_boughtWishListId_fkey" FOREIGN KEY ("boughtWishListId") REFERENCES "Wishlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
