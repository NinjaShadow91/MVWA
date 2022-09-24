/*
  Warnings:

  - You are about to drop the column `downVotes` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "downVotes",
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0;
