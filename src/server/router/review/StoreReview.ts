import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const storeReviewRouter = createProtectedRouter()
  .query("getStoreReviewsForStore", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const reviews = await ctx.prisma.storeReview.findMany({
          where: {
            storeId: input,
          },
        });
        return reviews.map((review) => {
          return review.deletedAt ? false : true;
        });
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching store reviews",
        });
      }
    },
  })
  .query("getStoreReviewsForUser", {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        const reviews = await ctx.prisma.storeReview.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });
        return reviews.map((review) => {
          return review.deletedAt ? false : true;
        });
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching store reviews",
        });
      }
    },
  })
  .query("getStoreReview", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const review = await ctx.prisma.storeReview.findUnique({
          where: {
            storeReviewId: input,
          },
        });
        if (!review || review.deletedAt) {
          throw throwTRPCError({
            message: "Review not found",
            code: "NOT_FOUND",
          });
        }
        return review;
      } catch (e) {
        throwPrismaTRPCError({
          cause: e,
          message: "Error while fetching store review",
        });
      }
    },
  });
