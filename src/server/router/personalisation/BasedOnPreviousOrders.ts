import { createProtectedRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const ProductRecommendationBasedOnPreviousOrders =
  createProtectedRouter().query("getBasedOnPreviousOrders", {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      // add logic, now just random
      try {
        const res = await ctx.prisma.product.findMany({
          select: {
            productId: true,
            name: true,
            description: true,
            Media: { select: { mediaId: true } },
          },
          take: 4,
        });

        if (res === null || res.length === 0) {
          throw throwTRPCError({
            message: "Products not found",
            code: "NOT_FOUND",
          });
        }
        return res;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting favourite products",
          cause: err,
        });
      }
    },
  });
