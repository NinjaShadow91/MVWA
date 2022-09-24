/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ADD COLUMN     "downVotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upVotes" INTEGER NOT NULL DEFAULT 0;
