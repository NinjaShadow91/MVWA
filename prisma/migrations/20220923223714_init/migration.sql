/*
  Warnings:

  - You are about to drop the column `downVotes` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `upVotes` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "downVotes",
DROP COLUMN "upVotes",
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0;
