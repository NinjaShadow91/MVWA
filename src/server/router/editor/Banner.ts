import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const BannerRouter = createRouter().query("get", {
  input: z.number().positive(),
  resolve: async ({ ctx, input }) => {
    try {
      const res = await ctx.prisma.banner.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          bannerId: true,
          title: true,
          query: true,
          // productIds: true,
          description: true,
          Media: { select: { mediaId: true } },
        },
        take: input,
      });
      if (res === null || res.length === 0) {
        throw throwTRPCError({
          message: "Banner not found",
          code: "NOT_FOUND",
        });
      }
      return res;
    } catch (err) {
      throw throwPrismaTRPCError({
        message: "Error getting banner",
        cause: err,
      });
    }
  },
});
