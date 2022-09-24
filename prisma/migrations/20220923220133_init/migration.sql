/*
  Warnings:

  - You are about to drop the column `descriptionImage` on the `TechnicalDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TechnicalDetails" DROP COLUMN "descriptionImage",
ADD COLUMN     "descriptionImages" TEXT[];
