import { Orders, PrismaPromise, ProductInventory } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const CartRouter = createProtectedRouter()
  .query("getCart", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            cartId: true,
            Items: true,
          },
        });
        if (!cart) {
          throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }
        return cart;
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error getting cart",
          cause: err,
        });
      }
    },
  })
  .mutation("addItem", {
    input: z.object({
      productId: z.string().uuid(),
      quantity: z.number().min(1),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: {
            productId: input.productId,
          },
        });
        if (!prod) {
          throwTRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
          const cart = await ctx.prisma.cart.findUnique({
            where: {
              userId: ctx.session.user.id,
            },
            select: {
              cartId: true,
              Items: {
                select: {
                  productId: true,
                  cartItemId: true,
                },
              },
            },
          });
          if (!cart) {
            throw throwTRPCError({
              code: "NOT_FOUND",
              message: "Cart not found",
            });
          }
          const item = cart.Items.find(
            (item) => item.productId === input.productId
          );
          if (item) {
            await ctx.prisma.cartItem.update({
              where: {
                cartItemId: item.cartItemId,
              },
              data: {
                quantity: input.quantity,
              },
            });
          } else {
            await ctx.prisma.cartItem.create({
              data: {
                quantity: input.quantity,
                productId: input.productId,
                cartId: cart.cartId,
              },
            });
          }
        }
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error adding item to cart",
          cause: err,
        });
      }
    },
  })
  .mutation("removeItem", {
    input: z.object({
      productId: z.string().uuid(),
      quantity: z.number().min(1),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            cartId: true,
            Items: {
              select: {
                productId: true,
                cartItemId: true,
              },
            },
          },
        });
        if (!cart) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }
        const item = cart.Items.find(
          (item) => item.productId === input.productId
        );
        if (item) {
          await ctx.prisma.cartItem.delete({
            where: {
              cartItemId: item.cartItemId,
            },
          });
        }
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error removing item from cart",
          cause: err,
        });
      }
    },
  })
  .mutation("clearCart", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            cartId: true,
            Items: {
              select: {
                productId: true,
                cartItemId: true,
              },
            },
          },
        });
        if (!cart) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }
        await ctx.prisma.cartItem.deleteMany({
          where: {
            cartId: cart.cartId,
          },
        });
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error clearing cart",
          cause: err,
        });
      }
    },
  })
  .mutation("checkout", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            cartId: true,
            Items: {
              select: {
                productId: true,
                cartItemId: true,
                quantity: true,
              },
            },
          },
        });
        if (!cart) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }

        const itemConfig = await Promise.all(
          cart.Items.map(async (item) => {
            const { stock } = (await ctx.prisma.productInventory.findUnique({
              where: {
                productId: item.productId,
              },
              select: {
                stock: true,
              },
            })) ?? { stock: 0 };
            const productId = item.productId;
            const purchasable = stock >= item.quantity;
            return { productId, purchasable };
          })
        );

        itemConfig.forEach((item) => {
          if (!item.purchasable) {
            throwTRPCError({
              code: "NOT_FOUND",
              message: "Product not found",
            });
          }
        });

        // race condition

        const transcationArray: PrismaPromise<ProductInventory | Orders>[] =
          cart.Items.map((item) => {
            return ctx.prisma.productInventory.update({
              where: {
                productId: item.productId,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          });

        transcationArray.push(
          ctx.prisma.orders.update({
            where: {
              userId: ctx.session.user.id,
            },
            data: {
              OrderItems: {
                create: cart.Items.map((item) => ({
                  OrderStatus: {
                    connect: {
                      status: "PAID",
                    },
                  },
                  productId: item.productId,
                  quantity: item.quantity,
                })),
              },
            },
          })
        );

        ctx.prisma.$transaction(transcationArray);

        await ctx.prisma.cartItem.deleteMany({
          where: {
            cartId: cart.cartId,
          },
        });
      } catch (err) {
        throwPrismaTRPCError({
          message: "Error clearing cart",
          cause: err,
        });
      }
    },
  });
