/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Product` table. All the data in the column will be lost.
  - Added the required column `paymentMethods` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethods" INTEGER NOT NULL;
