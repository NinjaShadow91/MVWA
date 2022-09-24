/*
  Warnings:

  - You are about to drop the column `downVotes` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "downVotes",
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0;
