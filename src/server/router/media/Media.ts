import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const MediaRouter = createRouter().query("get", {
  input: z.string().uuid(),
  resolve: async ({ ctx, input }) => {
    try {
      const media = await ctx.prisma.media.findUnique({
        where: {
          mediaId: input,
        },
      });
      if (media && media.deletedAt === null) {
        return media;
      } else {
        throwTRPCError({
          message: "Media not found",
        });
      }
    } catch (err) {
      throwPrismaTRPCError({
        message: "Error getting media",
        cause: err,
      });
    }
  },
});
