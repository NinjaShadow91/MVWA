/*
  Warnings:

  - You are about to drop the column `featureRating` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeatureRating" ADD COLUMN     "reviewId" UUID;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "featureRating";

-- AddForeignKey
ALTER TABLE "FeatureRating" ADD CONSTRAINT "FeatureRating_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
