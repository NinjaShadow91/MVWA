import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const ProductRecommendationBasedOnPreviousOrders = createRouter().query(
  "getBasedOnPreviousOrders",
  {
    input: z.object({}).nullish(),
    resolve: async ({ ctx, input }) => {
      // add logic, now just random
      try {
        const res = await ctx.prisma.product.findMany({
          select: {
            productId: true,
            name: true,
            price: true,
            description: true,
            Media: { select: { mediaId: true } },
          },
          take: 10,
        });

        if (res === null || res.length === 0) {
          throw throwTRPCError({
            message: "Products not found",
            code: "NOT_FOUND",
          });
        }
        return res;

        // return [
        //   {
        //     productId: "1",
        //     name: "Product 1",
        //     price: 100,
        //     description: "Product 1 description",
        //     Media: [{ mediaId: "1" }],
        //   },
        //   {
        //     productId: "2",
        //     name: "Product 2",
        //     price: 200,
        //     description: "Product 2 description",
        //     Media: [{ mediaId: "2" }],
        //   },
        // ];
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error getting favourite products",
          cause: err,
        });
      }
    },
  }
);
