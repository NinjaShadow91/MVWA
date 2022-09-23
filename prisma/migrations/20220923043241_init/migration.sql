/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "type" TEXT,
ALTER COLUMN "token" SET DEFAULT gen_random_uuid();
