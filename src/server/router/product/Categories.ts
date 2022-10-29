import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const CategoryRouter = createRouter().query("get", {
  input: z.object({}).nullish(),
  resolve: async ({ ctx }) => {
    try {
      const categories = await ctx.prisma.category.findMany({
        where: { deletedAt: null },
        select: {
          categoryId: true,
          name: true,
          description: true,
          media: {
            select: {
              mediaId: true,
            },
          },
        },
      });

      if (categories === null) {
        throw throwTRPCError({
          message: "Categories not found",
          code: "NOT_FOUND",
        });
      }
      return categories;
    } catch (err) {
      throw throwPrismaTRPCError({
        cause: err,
        message: "Something went bad while fetching the categories data",
      });
    }
  },
});
