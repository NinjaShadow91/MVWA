import { z } from "zod";
import { createProtectedRouter } from "./context";
import { throwPrismaTRPCError, throwTRPCError } from "./util";

export const StoreRouter = createProtectedRouter().query("getProductIDs", {
  input: z.string().uuid(),
  output: z.string().uuid().array().nullable(),
  async resolve({ input, ctx }) {
    try {
      const store = await ctx.prisma.store.findUnique({
        where: {
          id: input,
        },
        select: {
          manager: {
            select: {
              id: true,
            },
          },
          products: { select: { id: true } },
        },
      });
      if (store) {
        if (store.manager.id === ctx.session.user.id) {
          return store.products.map((product) => product.id);
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "No access to this store",
          });
        }
      } else {
        throw throwTRPCError({
          code: "BAD_REQUEST",
          message: "No store found",
        });
      }
    } catch (err) {
      throw throwPrismaTRPCError({
        cause: err,
        message: "Something went bad while fetching the store data",
      });
    }
  },
});
