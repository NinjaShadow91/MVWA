import { z } from "zod";
import { createProtectedRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

// add address to wishlist and allow to buy from wishlist
export const WishlistRouter = createProtectedRouter()
  .query("getWishlist", {
    input: z.object({
      id: z.string(),
      includeProducts: z.boolean().nullish(),
      includeBoughtProducts: z.boolean().nullish(),
    }),
    async resolve({ input, ctx }) {
      try {
        const reqWishList = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.id },
        });
        if (
          reqWishList &&
          ctx.session &&
          ctx.session.user.id === reqWishList.userId &&
          !reqWishList.deletedAt
        ) {
          return reqWishList;
        } else if (
          reqWishList &&
          ctx.session &&
          reqWishList.authorizedUserIds.find(
            (user) => user === ctx.session.user.id
          ) &&
          !reqWishList.deletedAt
        ) {
          reqWishList.authorizedUserIds = undefined as any;
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
    input: z.object({
      productId: z.string().uuid(),
      wishlistId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const prod = await ctx.prisma.product.findUnique({
          where: { productId: input.productId },
          select: { productId: true },
        });
        if (prod) {
          const wishlist = await ctx.prisma.wishlist.findUnique({
            where: { wishlistId: input.wishlistId },
            select: { wishlistId: true, userId: true },
          });
          if (!wishlist) {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "Wishlist not found.",
            });
          }
          if (ctx.session.user.id !== wishlist.userId) {
            throw throwTRPCError({
              code: "BAD_REQUEST",
              message: "You are not authorized to add to this wishlist.",
            });
          }

          if (
            await ctx.prisma.wishlist.findFirst({
              where: {
                wishlistId: input.wishlistId,
                userId: ctx.session.user.id,
                Products: {
                  some: { productId: input.productId, deletedAt: null },
                },
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
            where: {
              wishlistId: input.wishlistId,
            },
            data: {
              Products: {
                create: {
                  productId: input.productId,
                  Status: {
                    connect: {
                      status: "WISHLIST",
                    },
                  },
                },
              },
            },
            select: { wishlistId: true },
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
    input: z.object({
      wishlistItemId: z.string().uuid(),
      wishlistId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { wishlistId: true, userId: true },
        });
        if (!wishlist) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist not found.",
          });
        }
        if (ctx.session.user.id !== wishlist.userId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to remove from this wishlist.",
          });
        }

        const status = (await ctx.prisma.wishlist.update({
          where: {
            wishlistId: input.wishlistId,
          },
          data: {
            Products: {
              update: {
                where: {
                  wishlistItemId: input.wishlistItemId,
                },
                data: {
                  deletedAt: new Date(),
                },
              },
            },
          },
          select: { wishlistId: true },
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
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while removing from wishlist.",
        });
      }
    },
  })
  .mutation("createWishlist", {
    input: z.object({
      name: z.string(),
      description: z.string().nullish(),
      authorizedUserIds: z.array(z.string().uuid()).nullish(),
      addressIds: z.string().uuid().array().nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.create({
          data: {
            name: input.name,
            description: input.description ?? "",
            userId: ctx.session.user.id,
            authorizedUserIds: input.authorizedUserIds ?? [],
          },
          select: {
            wishlistId: true,
            name: true,
            description: true,
            userId: true,
            authorizedUserIds: true,
          },
        });
        return wishlist;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while creating wishlist.",
        });
      }
    },
  })
  .mutation("updateWishlist", {
    input: z.object({
      wishlistId: z.string().uuid(),
      name: z.string(),
      description: z.string().nullish(),
      authorizedUserIds: z.array(z.string().uuid()).nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { wishlistId: true, userId: true },
        });
        if (!wishlist) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist not found.",
          });
        }
        if (ctx.session.user.id !== wishlist.userId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to update this wishlist.",
          });
        }

        const updatedWishlist = await ctx.prisma.wishlist.update({
          where: {
            wishlistId: input.wishlistId,
          },
          data: {
            name: input.name,
            description: input.description ?? "",
            authorizedUserIds: input.authorizedUserIds ?? [],
          },
          select: {
            wishlistId: true,
            name: true,
            description: true,
            userId: true,
            authorizedUserIds: true,
          },
        });
        return updatedWishlist;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while updating wishlist.",
        });
      }
    },
  })
  .mutation("deleteWishlist", {
    input: z.object({
      wishlistId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { wishlistId: true, userId: true },
        });
        if (!wishlist) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist not found.",
          });
        }
        if (ctx.session.user.id !== wishlist.userId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to delete this wishlist.",
          });
        }

        const status = (await ctx.prisma.wishlist.delete({
          where: {
            wishlistId: input.wishlistId,
          },
          select: { wishlistId: true },
        }))
          ? true
          : false;
        if (status) return true;
        else {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong while deleting wishlist.",
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while deleting wishlist.",
        });
      }
    },
  })
  .mutation("addUserToAuthorizedUsers", {
    input: z.object({
      wishlistId: z.string().uuid(),
      userId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { wishlistId: true, userId: true },
        });
        if (!wishlist) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist not found.",
          });
        }
        if (ctx.session.user.id !== wishlist.userId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to update this wishlist.",
          });
        }

        const updatedWishlist = await ctx.prisma.wishlist.update({
          where: {
            wishlistId: input.wishlistId,
          },
          data: {
            authorizedUserIds: {
              push: input.userId,
            },
          },
          select: {
            wishlistId: true,
            name: true,
            description: true,
            userId: true,
            authorizedUserIds: true,
          },
        });
        return updatedWishlist;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while updating wishlist.",
        });
      }
    },
  })
  .mutation("removeUserFromAuthorizedUsers", {
    input: z.object({
      wishlistId: z.string().uuid(),
      userId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const wishlist = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { wishlistId: true, userId: true },
        });
        if (!wishlist) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Wishlist not found.",
          });
        }
        if (ctx.session.user.id !== wishlist.userId) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "You are not authorized to update this wishlist.",
          });
        }

        const wishlistUsers = await ctx.prisma.wishlist.findUnique({
          where: { wishlistId: input.wishlistId },
          select: { authorizedUserIds: true },
        });
        if (
          !wishlistUsers ||
          !wishlistUsers.authorizedUserIds.includes(input.userId)
        ) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "User is not authorized to access this wishlist.",
          });
        }

        const updatedWishlist = await ctx.prisma.wishlist.update({
          where: {
            wishlistId: input.wishlistId,
          },
          data: {
            authorizedUserIds: wishlistUsers.authorizedUserIds.filter(
              (id) => id !== input.userId
            ),
          },
          select: {
            wishlistId: true,
            name: true,
            description: true,
            userId: true,
            authorizedUserIds: true,
          },
        });
        return updatedWishlist;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went wrong while updating wishlist.",
        });
      }
    },
  });
