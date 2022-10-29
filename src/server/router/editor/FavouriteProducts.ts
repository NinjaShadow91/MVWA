import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError } from "../util";

export const FavouriteProductsRouter = createRouter().query("get", {
  input: z
    .object({
      category: z.string().uuid(),
    })
    .nullish(),
  resolve: async ({ ctx, input }) => {
    try {
      if (input) {
        return await ctx.prisma.product.findMany({
          where: {
            categoryCategoryId: input.category,
          },
          select: {
            productId: true,
            name: true,
            price: true,
            description: true,
            Media: { select: { mediaId: true } },
          },
          take: 10,
        });
      } else {
        return await ctx.prisma.product.findMany({
          select: {
            productId: true,
            name: true,
            price: true,
            description: true,
            Media: { select: { mediaId: true } },
          },
          take: 10,
        });
      }
    } catch (err) {
      throwPrismaTRPCError({
        message: "Error getting favourite products",
        cause: err,
      });
    }
  },
});
