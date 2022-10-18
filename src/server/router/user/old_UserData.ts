import { z } from "zod";
import { createProtectedRouter } from "./context";
import { throwPrismaTRPCError, throwTRPCError } from "./util";

// Create add to cart, add

export const UserDataRouter = createProtectedRouter()
  .query("getUserData", {
    input: z.object({
      select: z
        .object({
          name: z.boolean().nullish(),
          email: z.boolean().nullish(),
          image: z.boolean().nullish(),
          dob: z.boolean().nullish(),
          primaryPhoneNumber: z.boolean().nullish(),
          secondaryPhoneNumber: z.boolean().nullish(),
          address: z.boolean().nullish(),
          sessions: z.boolean().nullish(),
          payments: z.number().nonnegative().nullish(),
          store: z.boolean().nullish(),
          viewedProducts: z.number().nonnegative().nullish(),
          dateCreated: z.boolean().nullish(),
          dateUpdated: z.boolean().nullish(),
          lastPasswordUpdateAt: z.boolean().nullish(),
          // orders: z.boolean().nullish(),
          // cart: z.boolean().nullish(),
          // wishlist: z.boolean().nullish(),
          // reviews: z.boolean().nullish(),
          // answeredQuestions: z.boolean().nullish(),
          // askedQuestions: z.boolean().nullish(),
        })
        .nullish(),
    }),
    output: z.object({
      id: z.string().uuid(),
      name: z.string().nullish(),
      email: z.string().email().nullish(),
      image: z.string().nullish(),
      dob: z.date().nullish(),
      primaryPhoneNumber: z.string().nullish(),
      secondaryPhoneNumber: z.string().nullish(),
      address: z
        .object({
          country: z.string(),
          city: z.string(),
          pincode: z.string(),
          state: z.string(),
        })
        .array()
        .nullish(),
      payments: z
        .object({
          id: z.string().uuid(),
          identifier: z.string(),
          provider: z.string(),
          status: z.number().nonnegative(),
          createdAt: z.date(),
        })
        .array()
        .nullish(),
      productViews: z.object({ pid: z.string() }).array().nullish(),
      dateCreated: z.date().nullish(),
      lastPasswordUpdateAt: z.date().nullish(),
      dateUpdated: z.date().nullish(),
      // sessions: z.array(z.string().uuid()).nullish(),
      // orders: z.array(z.string().uuid()).nullish(),
      // cart: z.array(z.string().uuid()).nullish(),
      // wishlist: z.array(z.string().uuid()).nullish(),
      // reviews: z.array(z.string().uuid()).nullish(),
      // store: z.string().uuid().nullish(),
      // answers: z.array(z.string().uuid()).nullish(),
      // qestions: z.array(z.string().uuid()).nullish(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            id: true,
            name: input.select?.name ?? false,
            email: input.select?.email ?? false,
            image: input.select?.image ?? false,
            dob: input.select?.dob ?? false,
            primaryPhoneNumber: input.select?.primaryPhoneNumber ?? false,
            secondaryPhoneNumber: input.select?.secondaryPhoneNumber ?? false,
            addresses: input.select?.address
              ? {
                  select: {
                    country: true,
                    city: true,
                    pincode: true,
                    state: true,
                  },
                }
              : false,
            payments: input.select?.payments
              ? {
                  select: {
                    id: true,
                    identifier: true,
                    provider: true,
                    status: true,
                    createdAt: true,
                  },
                  take: input.select?.payments,
                }
              : false,
            productViews: input.select?.viewedProducts
              ? {
                  select: { pid: true },
                  orderBy: { createdAt: "desc" },
                  take: input.select?.viewedProducts,
                }
              : false,
            dateCreated: input.select?.dateCreated ?? false,
            dateUpdated: input.select?.dateUpdated ?? false,
            lastPasswordUpdateAt: input.select?.lastPasswordUpdateAt ?? false,
            // stores: input.select?.store ? { select:{
            //   id:true,
            //   name:true,
            //   description:true
            // }}: false,
            // orders: input.select?.orders ?? false,
            // cart: input.select?.cart ?? false,
            // selfWishList: input.select?.wishlist ?? false,
            // reviews: input.select?.reviews ?? false,
            // answers: input.select?.answeredQuestions ?? false,
            // questions: input.select?.askedQuestions ?? false,
            // sessions: input.select?.sessions ?? false,
          },
        });
        if (!user) {
          throw throwTRPCError({
            message: "User not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        } else return user;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error while fetching user data",
        });
      }
    },
  })
  .mutation("updateUserData", {
    input: z.object({
      // name: z.string().nullish(),
      // email: z.string().email().nullish(),
      dob: z.date().nullish(),
      image: z.string().nullish(),
      primaryPhoneNumber: z.string().nullish(),
      secondaryPhoneNumber: z.string().nullish(),
      // address: z
      //   .object({
      //     country: z.string(),
      //     city: z.string(),
      //     pincode: z.string(),
      //     state: z.string(),
      //   })
      //   .nullish(),
    }),
    output: z.boolean(),
    resolve: async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            dob: input.dob,
            image: input.image,
            primaryPhoneNumber: input.primaryPhoneNumber,
            secondaryPhoneNumber: input.secondaryPhoneNumber,
          },
        });
        if (!user) {
          throw throwTRPCError({
            message: "User not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        } else return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error while updating user data",
        });
      }
    },
  })
  .mutation("deleteUser", {
    input: z.object({}).nullish(),
    output: z.boolean(),
    resolve: async ({ ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
        if (!user) {
          throw throwTRPCError({
            message: "User not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        } else return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error while deleting user data",
        });
      }
    },
  })
  .query("getCart", {
    input: z.object({
      includeProducts: z.boolean().nullish(),
      includeSavedProducts: z.boolean().nullish(),
      includeBoughtProducts: z.boolean().nullish(),
    }),
    output: z
      .object({
        products: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            images: z.string().array(),
            price: z.number().nonnegative(),
          })
          .array()
          .nullish(),
        boughtProducts: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            images: z.string().array(),
            price: z.number().nonnegative(),
          })
          .array()
          .nullish(),
        savedProducts: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            images: z.string().array(),
            price: z.number().nonnegative(),
          })
          .array()
          .nullish(),
      })
      .nullable(),
    resolve: async ({ input, ctx }) => {
      try {
        return await ctx.prisma.cart.findUnique({
          where: { id: ctx.session.user.id },
          select: {
            products: input.includeProducts
              ? {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                }
              : false,
            savedProducts: input.includeSavedProducts
              ? {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                }
              : false,
            boughtProducts: input.includeBoughtProducts
              ? {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                }
              : false,
          },
        });
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching cart details.",
        });
      }
    },
  })
  .query("getPurchasedItems", {
    input: z.object({}),
    output: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        images: z.string().array(),
        price: z.number().nonnegative(),
      })
      .array()
      .nullable(),
    resolve: async ({ ctx }) => {
      try {
        // if (! await ctx.prisma.cart.findUnique({where:{id:ctx.session.user.id}})) {
        //   throw throwTRPCError({
        //     message: "Cart not found",
        //     code: "NOT_FOUND",
        //   });
        // }

        return (
          (
            await ctx.prisma.cart.findUnique({
              where: { id: ctx.session.user.id },
              select: {
                boughtProducts: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                },
              },
            })
          )?.boughtProducts ?? null
        );
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching cart details.",
        });
      }
    },
  })
  .mutation("addItemToCart", {
    input: z.object({
      productId: z.string().uuid(),
    }),
    output: z.boolean(),
    resolve: async ({ input, ctx }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: { id: ctx.session.user.id },
          select: { products: { select: { id: true } } },
        });
        // if (!cart) {
        //   throw throwTRPCError({
        //     message: "Cart not found.",
        //     code: "INTERNAL_SERVER_ERROR",
        //   });
        // }
        if (cart!.products.find((product) => product.id === input.productId)) {
          // throw throwTRPCError({
          //   message: "Product already in cart.",
          //   code: "BAD_REQUEST",
          // });
          return true;
        }
        const product = await ctx.prisma.product.findUnique({
          where: { id: input.productId },
        });
        if (!product) {
          throw throwTRPCError({
            message: "Product not found.",
            code: "BAD_REQUEST",
          });
        }

        await ctx.prisma.cart.update({
          where: { id: ctx.session.user.id },
          data: {
            products: {
              connect: { id: input.productId },
            },
          },
        });
        return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while adding item to cart.",
        });
      }
    },
  })
  .mutation("removeItemFromCart", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ ctx, input }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: { id: ctx.session.user.id },
          select: { products: { select: { id: true } } },
        });
        // if (!cart) {
        //   throw throwTRPCError({
        //     message: "Cart not found.",
        //     code: "INTERNAL_SERVER_ERROR",
        //   });
        // }
        if (!cart!.products.find((product) => product.id === input)) {
          throw throwTRPCError({
            message: "Product not in cart.",
            code: "BAD_REQUEST",
          });
        }
        await ctx.prisma.cart.update({
          where: { id: ctx.session.user.id },
          data: {
            products: {
              disconnect: { id: input },
            },
          },
        });
        return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while removing item from cart.",
        });
      }
      return true;
    },
  })
  .query("getSavedProducts", {
    input: z.object({}).nullish(),
    output: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        images: z.string().array().nullable(),
        price: z.number().nonnegative(),
      })
      .array()
      .nullable(),
    resolve: async ({ ctx }) => {
      try {
        // if (! await ctx.prisma.cart.findUnique({
        //   where: { id: ctx.session.user.id },
        // })) {
        //   throw throwTRPCError({
        //     message: "Cart not found.",
        //     code: "INTERNAL_SERVER_ERROR",
        //   });
        // }
        const savedProducts =
          (
            await ctx.prisma.cart.findUnique({
              where: { id: ctx.session.user.id },
              select: {
                savedProducts: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                },
              },
            })
          )?.savedProducts ?? null;
        return savedProducts;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching saved products.",
        });
      }
    },
  })
  .mutation("addProductToSavedForLater", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ ctx, input }) => {
      try {
        const product = await ctx.prisma.product.findUnique({
          where: { id: input },
        });
        if (!product) {
          throw throwTRPCError({
            message: "Product not found.",
            code: "BAD_REQUEST",
          });
        }
        const cart = await ctx.prisma.cart.findUnique({
          where: { id: ctx.session.user.id },
          select: { savedProducts: { select: { id: true } } },
        });
        // if (!cart) {
        //   throw throwTRPCError({
        //     message: "Cart not found.",
        //     code: "INTERNAL_SERVER_ERROR",
        //   });
        // }
        if (cart!.savedProducts.find((product) => product.id === input)) {
          // throw throwTRPCError({
          //   message: "Product already saved.",
          //   code: "BAD_REQUEST",
          // });
          return true;
        }
        await ctx.prisma.cart.update({
          where: { id: ctx.session.user.id },
          data: {
            savedProducts: {
              connect: { id: input },
            },
          },
        });
        return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while saving product.",
        });
      }
    },
  })
  .mutation("removeProductFromSavedForLater", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ ctx, input }) => {
      try {
        const cart = await ctx.prisma.cart.findUnique({
          where: { id: ctx.session.user.id },
          select: { savedProducts: { select: { id: true } } },
        });
        // if (!cart) {
        //   throw throwTRPCError({
        //     message: "Cart not found.",
        //     code: "INTERNAL_SERVER_ERROR",
        //   });
        // }
        if (!cart!.savedProducts.find((product) => product.id === input)) {
          throw throwTRPCError({
            message: "Product not saved.",
            code: "BAD_REQUEST",
          });
        }
        await ctx.prisma.cart.update({
          where: { id: ctx.session.user.id },
          data: {
            savedProducts: {
              disconnect: { id: input },
            },
          },
        });
        return true;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while removing product from saved.",
        });
      }
    },
  })
  .query("getWishlist", {
    input: z.object({
      id: z.string(),
      includeProducts: z.boolean().nullish(),
      includeBoughtProducts: z.boolean().nullish(),
    }),
    output: z
      .object({
        id: z.string().uuid(),
        ownerId: z.string().uuid(),
        products: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            images: z.string().array(),
            price: z.number().nonnegative(),
          })
          .array()
          .nullish(),
        boughtProducts: z
          .object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            images: z.string().array(),
            price: z.number().nonnegative(),
          })
          .array()
          .nullish(),
      })
      .nullable(),
    async resolve({ input, ctx }) {
      try {
        const reqWishList = await ctx.prisma.wishlist.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            ownerId: true,
            otherUsers: {
              select: { id: true },
            },
            products: input.includeProducts
              ? {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                }
              : false,
            boughtProducts: input.includeBoughtProducts
              ? {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    images: true,
                    price: true,
                  },
                }
              : false,
          },
        });
        if (
          reqWishList &&
          ctx.session &&
          ctx.session.user.id === reqWishList.ownerId
        ) {
          return reqWishList;
        } else if (
          reqWishList &&
          ctx.session &&
          reqWishList.otherUsers.find((user) => user.id === ctx.session.user.id)
        ) {
          reqWishList.otherUsers = undefined as any;
          return reqWishList;
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to view this wishlist.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while detching the wishlist.",
        });
      }
    },
  })
  .mutation("addToWishlist", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: { id: input },
          select: { id: true },
        });
        if (prod) {
          if (
            await ctx.prisma.wishlist.findFirst({
              where: {
                ownerId: ctx.session.user.id,
                products: { some: { id: input } },
              },
            })
          ) {
            // throw throwTRPCError({
            //   code: "BAD_REQUEST",
            //   message: "Product already in wishlist.",
            // });
            return true;
          }
          const status = (await ctx.prisma.wishlist.update({
            where: { id: ctx.session.user.id },
            data: {
              products: {
                connect: { id: input },
              },
            },
            select: { id: true },
          }))
            ? true
            : false;
          if (status) return true;
          else {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong while adding to wishlist.",
            });
          }
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Product does not exist.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while adding to wishlist.",
        });
      }
    },
  })
  .mutation("removeFromWishlist", {
    input: z.string().uuid(),
    output: z.boolean(),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: { id: input },
          select: { id: true },
        });
        if (prod) {
          const status = (await ctx.prisma.wishlist.update({
            where: { id: ctx.session.user.id },
            data: {
              products: {
                disconnect: { id: input },
              },
            },
            select: { id: true },
          }))
            ? true
            : false;
          if (status) return true;
          else {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong while removing from wishlist.",
            });
          }
        } else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Product does not exist.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while removing from wishlist.",
        });
      }
    },
  });
