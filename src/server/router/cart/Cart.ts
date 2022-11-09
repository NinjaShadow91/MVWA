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
            Items: {
              where: {
                deletedAt: null,
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
        return cart;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting cart",
          cause: err,
        });
      }
    },
  })
  .query("getDeliveryEstimate", {
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
              where: {
                deletedAt: null,
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
        return 10;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting cart",
          cause: err,
        });
      }
    },
  })
  .query("getTaxEstimate", {
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
              where: {
                deletedAt: null,
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
        return 10;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting cart",
          cause: err,
        });
      }
    },
  })
  .mutation("addItem", {
    input: z.object({
      productId: z.string().uuid(),
      // productInventoryId: z.string().uuid(),
      quantity: z.number().min(1),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const prod = await ctx.prisma.productSKU.findUnique({
          where: { productSKUId: input.productId },
          select: {
            productSKUId: true,
            deletedAt: true,
          },
        });
        if (prod === null || prod.deletedAt) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }
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
                deletedAt: true,
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
        if (item && !item.deletedAt) {
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
      } catch (err) {
        throw throwPrismaTRPCError({
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
          await ctx.prisma.cartItem.update({
            where: {
              cartItemId: item.cartItemId,
            },
            data: {
              deletedAt: new Date(),
            },
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
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
        throw throwPrismaTRPCError({
          message: "Error clearing cart",
          cause: err,
        });
      }
    },
  })
  .mutation("checkout", {
    // input: z.object({ addressId: z.string().uuid() }),
    input: z.object({}),
    resolve: async ({ ctx, input }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            cartId: true,
            Items: {
              where: {
                deletedAt: null,
              },
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
            const { stock, price } =
              (await ctx.prisma.productInventory.findFirst({
                where: {
                  productId: item.productId,
                },
                select: {
                  price: true,
                  stock: true,
                },
              })) ?? { stock: 0, price: 0 };
            const productId = item.productId;
            const purchasable = stock >= item.quantity;
            const quantity = item.quantity;
            const cost = item.quantity * price;
            return { productId, purchasable, cost, quantity };
          })
        );

        itemConfig.forEach((item) => {
          if (!item.purchasable) {
            console.log("not purchasable", item);
            throw throwTRPCError({
              code: "NOT_FOUND",
              message: "Product not found",
            });
          }
        });

        // race condition

        const transcationArray: PrismaPromise<any>[] = cart.Items.map(
          (item) => {
            return ctx.prisma.productInventory.updateMany({
              where: {
                // productInventoryId: item.productId,
                productId: item.productId,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        );

        // const UserAddress = await ctx.prisma.userAddress.findUnique({
        const UserAddress = await ctx.prisma.userAddress.findFirst({
          where: {
            // userAddressId: input.addressId,
            userId: ctx.session.user.id,
          },
          select: {
            line1: true,
            line2: true,
            City: {
              select: {
                name: true,
                State: {
                  select: {
                    identifier: true,
                    Country: {
                      select: {
                        code: true,
                      },
                    },
                  },
                },
              },
            },
            LatitudeLongitude: {
              select: {
                latitudeLongitudeId: true,
                lat: true,
                long: true,
              },
            },
            zipcode: true,
          },
        });

        if (!UserAddress) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "Address not found",
          });
        }

        const city = await ctx.prisma.city.findFirst({
          where: {
            name: UserAddress.City.name,
            State: {
              identifier: UserAddress.City.State.identifier,
              Country: {
                code: UserAddress.City.State.Country.code,
              },
            },
          },
          select: {
            cityId: true,
          },
        });

        if (!city) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "City not found",
          });
        }

        const DeliveryAddress = await ctx.prisma.orderAddress.create({
          data: {
            line1: UserAddress.line1,
            line2: UserAddress.line2,
            City: {
              connect: {
                cityId: city.cityId,
              },
            },
            LatitudeLongitude: {
              connect: {
                latitudeLongitudeId:
                  UserAddress.LatitudeLongitude.latitudeLongitudeId,
              },
            },
            zipcode: UserAddress.zipcode,
            AddressType: {
              connect: {
                name: "NORMAL",
              },
            },
          },
        });

        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
        });

        if (!user) {
          throw throwTRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        transcationArray.push(
          ctx.prisma.orders.update({
            where: {
              userId: ctx.session.user.id,
            },
            data: {
              OrderItems: {
                create: itemConfig.map((item) => ({
                  amount: item.cost,
                  DeliveryAddress: {
                    connect: {
                      orderAddressId: DeliveryAddress.orderAddressId,
                    },
                  },
                  OrderStatus: {
                    connect: {
                      name: "PAID",
                    },
                  },
                  User: {
                    create: {
                      name: user.name,
                      email: user.email,
                      Contact: user.email,
                    },
                  },
                  Reciever: {
                    create: {
                      name: user.name,
                      Contact: user.email,
                    },
                  },
                  productId: item.productId,
                  quantity: item.quantity,
                })),
              },
            },
          })
        );

        transcationArray.push(
          ctx.prisma.cartItem.updateMany({
            where: {
              cartId: cart.cartId,
            },
            data: {
              deletedAt: new Date(),
            },
          })
        );

        await ctx.prisma.$transaction(transcationArray);
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error clearing cart",
          cause: err,
        });
      }
    },
  });
