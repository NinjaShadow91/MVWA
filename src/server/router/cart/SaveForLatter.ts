import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const SaveForLatter = createProtectedRouter()
  .query("getSaveForLatter", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const cart = await ctx.prisma.savedForLaterProducts.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            savedForLaterProductsId: true,
            products: true,
          },
        });
        if (!cart) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }
        return cart;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting cart",
          cause: err,
        });
      }
    },
  })
  .mutation("addItem", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            productId: input,
          },
        });
        if (!prod) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }
        const prods = await ctx.prisma.savedForLaterProducts.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            savedForLaterProductsId: true,
            products: true,
          },
        });
        if (!prods) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }
        const product = prods.products.find((p) => p === prod.productId);
        if (product) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Product already in cart",
          });
        }
        const newCart = await ctx.prisma.savedForLaterProducts.update({
          where: {
            savedForLaterProductsId: prods.savedForLaterProductsId,
          },
          data: {
            products: { push: prod.productId },
          },
          select: {
            savedForLaterProductsId: true,
            products: true,
          },
        });
        return newCart;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error adding item to cart",
          cause: err,
        });
      }
    },
  })
  .mutation("removeItem", {
    input: z.string().uuid(),
    resolve: async ({ ctx, input }) => {
      try {
        const prods = await ctx.prisma.savedForLaterProducts.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            savedForLaterProductsId: true,
            products: true,
          },
        });
        if (!prods) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Error",
          });
        }
        const product = prods.products.find((p) => p === input);
        if (!product) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Product not saved",
          });
        }
        const newCart = await ctx.prisma.savedForLaterProducts.update({
          where: {
            savedForLaterProductsId: prods.savedForLaterProductsId,
          },
          data: {
            products: prods.products.filter((p) => p !== input),
          },
          select: {
            savedForLaterProductsId: true,
            products: true,
          },
        });
        return newCart;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error adding item to cart",
          cause: err,
        });
      }
    },
  });
