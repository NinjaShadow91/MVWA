import { createProtectedRouter } from "../context";
import { z } from "zod";
import { throwTRPCError } from "../util";

export const orderRouter = createProtectedRouter()
  .mutation("placeOrder", {
    input: z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    }),
    resolve: async ({ input, ctx }) => {
      const { productId, quantity } = input;
      try {
        const product = await ctx.prisma.product.findUnique({
          where: { productId: productId },
          select: {
            productId: true,
            name: true,
            description: true,
            productInventoryId: true,
            Details: true,
            Media: true,
            Category: true,
            IsVariantOf: true,
            OtherVariants: true,
          },
        });
        if (product === null) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }
        const productInventory = await ctx.prisma.productInventory.findUnique({
          where: { productInventoryId: product.productInventoryId },
          select: {
            productInventoryId: true,
            price: true,
            stock: true,
            productId: true,
            deletedAt: true,
          },
        });
        if (productInventory === null || productInventory.deletedAt) {
          throw throwTRPCError({
            message: "Product Inventory not found",
            code: "NOT_FOUND",
          });
        }
        if (productInventory.stock < quantity) {
          throw throwTRPCError({
            message: "Not enough stock",
            code: "BAD_REQUEST",
          });
        }

        // Add logic to process payment
        const payment = { id: "123", status: "PAID" };

        if (payment.status === "PAID") {
          try {
            const { orderStatusId } = (await ctx.prisma.orderStatus.findUnique({
              where: { name: "PAID" },
              select: {
                orderStatusId: true,
              },
            })) ?? { orderStatusId: "" };

            // Add logic for tracking
            let { ordersId } = (await ctx.prisma.orders.findUnique({
              where: { userId: ctx.session.user.id },
              select: {
                ordersId: true,
              },
            })) ?? { ordersId: "" };

            if (ordersId === "") {
              ordersId =
                (
                  await ctx.prisma.orders.create({
                    data: {
                      userId: ctx.session.user.id,
                      // OrderItems:[]
                    },
                    select: {
                      ordersId: true,
                    },
                  })
                ).ordersId ?? "";
            }

            if (ordersId !== "") {
              await ctx.prisma.$transaction([
                ctx.prisma.orderItem.create({
                  data: {
                    productId: product.productInventoryId,
                    quantity: quantity,
                    Order: { connect: { ordersId: ordersId } },
                    // Add logic to change order status dynamically
                    OrderStatus: {
                      connect: {
                        orderStatusId: orderStatusId,
                      },
                    },
                    // Add logic to add delivery tracker
                    // Add payment info
                  },
                }),
                ctx.prisma.productInventory.update({
                  where: { productInventoryId: product.productInventoryId },
                  data: {
                    stock: {
                      decrement: quantity,
                    },
                  },
                }),
              ]);
              return true;
            } else {
              throw throwTRPCError({
                message: "Something went wrong while creating order",
                code: "INTERNAL_SERVER_ERROR",
              });
            }
          } catch (err) {
            // Add logic to revert payment
            throw throwTRPCError({
              cause: err,
              message: "Something went bad while placing the order",
            });
          }
        } else {
          throw throwTRPCError({
            message: "Payment failed",
            code: "BAD_REQUEST",
          });
        }
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while placing the order",
        });
      }
    },
  })
  .mutation("cancelOrder", {
    input: z.object({
      orderId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { orderId } = input;
      try {
        const orderItem = await ctx.prisma.orderItem.findUnique({
          where: { orderItemId: orderId },
          select: {
            orderItemId: true,
            productId: true,
            quantity: true,
            Order: true,
            OrderStatus: true,
            DeliveryTracker: true,
            Payment: true,
          },
        });
        if (orderItem === null) {
          throw throwTRPCError({
            message: "Order not found",
            code: "NOT_FOUND",
          });
        }
        if (orderItem.OrderStatus.name !== "PAID") {
          throw throwTRPCError({
            message: "Order cannot be cancelled",
            code: "BAD_REQUEST",
          });
        }
        if (orderItem.Order.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to cancel this order",
            code: "UNAUTHORIZED",
          });
        }
        const { orderStatusId } = (await ctx.prisma.orderStatus.findUnique({
          where: { name: "CANCELLED" },
          select: {
            orderStatusId: true,
          },
        })) ?? { orderStatusId: "" };
        if (orderStatusId === "") {
          throw throwTRPCError({
            message: "Order status not found",
            code: "NOT_FOUND",
          });
        }
        await ctx.prisma.$transaction([
          ctx.prisma.orderItem.update({
            where: { orderItemId: orderId },
            data: {
              OrderStatus: {
                connect: {
                  orderStatusId: orderStatusId,
                },
              },
            },
          }),
          // revert payment logic
          // cancel the delivery process
          ctx.prisma.productInventory.update({
            where: {
              productInventoryId: orderItem.productId,
            },
            data: {
              stock: {
                increment: orderItem.quantity,
              },
            },
          }),
        ]);
        return true;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while cancelling the order",
        });
      }
    },
  })
  .query("getOrder", {
    input: z.object({
      orderId: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { orderId } = input;
      try {
        const orderItem = await ctx.prisma.orderItem.findUnique({
          where: { orderItemId: orderId },
          select: {
            orderItemId: true,
            productId: true,
            quantity: true,
            Order: true,
            OrderStatus: true,
            DeliveryTracker: true,
            Payment: true,
          },
        });
        if (orderItem === null) {
          throw throwTRPCError({
            message: "Order not found",
            code: "NOT_FOUND",
          });
        }
        if (orderItem.Order.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to view this order",
            code: "UNAUTHORIZED",
          });
        }
        return orderItem;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while getting the order",
        });
      }
    },
  })
  .query("getOrders", {
    input: z.object({}),
    resolve: async ({ ctx }) => {
      try {
        const orders = await ctx.prisma.orders.findUnique({
          where: { userId: ctx.session.user.id },
          select: {
            ordersId: true,
            OrderItems: {
              select: {
                orderItemId: true,
                productId: true,
                quantity: true,
              },
            },
          },
        });
        if (orders === null) {
          throw throwTRPCError({
            message: "Orders not found",
            code: "NOT_FOUND",
          });
        }
        return orders;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while getting the orders",
        });
      }
    },
  });
