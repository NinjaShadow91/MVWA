import { z } from "zod";
import { createProtectedRouter } from "./context";

export const UserDataRouter = createProtectedRouter()
  .query("getCart", {
    async resolve({ ctx }) {
      const cart = await ctx.prisma.cart.findUnique({
        where: { id: ctx.session.user.id },
        include: { products: true },
      });
      return cart;
    },
  })
  .query("getWishlist", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const reqWishList = await ctx.prisma.wishlist.findUnique({
        where: { id: input.id },
        select: { products: true, boughtProducts: true },
      });
      return reqWishList;
    },
  });
