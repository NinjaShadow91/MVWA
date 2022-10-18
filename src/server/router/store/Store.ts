import { z } from "zod";
import { createRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const storeRouter = createRouter().query("getStoreDetails", {
  input: z.string().uuid(),
  resolve: async ({ input, ctx }) => {
    try {
      const store = await ctx.prisma.store.findUnique({
        where: {
          storeId: input,
        },
        include: {
          Media: true,
          Contacts: {
            include: {
              ContactType: true,
            },
          },
          Tags: true,
        },
      });
      if (!store || store.deletedAt) {
        throw throwTRPCError({
          code: "BAD_REQUEST",
          message: "Store not found",
        });
      } else return store;
    } catch (err) {
      throw throwPrismaTRPCError({
        cause: err,
        message: "Error getting store details",
      });
    }
  },
});
