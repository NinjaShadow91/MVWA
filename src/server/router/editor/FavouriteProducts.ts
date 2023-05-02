/* eslint-disable @typescript-eslint/no-unused-vars */
import { createProtectedRouter, createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const EditorFavouriteProductsRouter = createProtectedRouter()
  .mutation("add", {
    input: z.object({
      productId: z.string().uuid(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            UserType: true,
          },
        });

        if (!user || !user.UserType || user.UserType.name !== "editor") {
          throw throwTRPCError({
            message: "User is not an editor",
            code: "UNAUTHORIZED",
          });
        }

        const resP = await ctx.prisma.product.findUnique({
          where: {
            productId: input.productId,
          },
          select: {
            productId: true,
            name: true,
            categoryCategoryId: true,
            deletedAt: true,
          },
        });

        if (resP === null || resP.deletedAt !== null) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }

        const res = await ctx.prisma.favouriteProduct.create({
          data: {
            productId: input.productId,
            name: resP.name,
            categoryId: resP.categoryCategoryId,
          },
        });
        return res;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error creating favourite products",
          cause: err,
        });
      }
    },
  })
  .mutation("delete", {
    input: z.object({
      productId: z.string().uuid(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          select: {
            UserType: true,
          },
        });

        if (!user || !user.UserType || user.UserType.name !== "editor") {
          throw throwTRPCError({
            message: "User is not an editor",
            code: "UNAUTHORIZED",
          });
        }

        const res = await ctx.prisma.favouriteProduct.updateMany({
          where: {
            productId: input.productId,
          },
          data: {
            deletedAt: new Date(),
          },
        });
        return res;
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error deleting favourite products",
          cause: err,
        });
      }
    },
  });

export const FavouriteProductsRouter = createRouter()
  .query("get", {
    input: z
      .object({
        category: z.string().uuid(),
      })
      .nullish(),
    resolve: async ({ ctx, input }) => {
      try {
        if (input) {
          return await ctx.prisma.product.findMany({
            where: {
              categoryCategoryId: input.category,
            },
            select: {
              productId: true,
              name: true,
              ProductSKU: true,
              description: true,
              Media: { select: { mediaId: true } },
            },
            take: 10,
          });
        } else {
          return await ctx.prisma.product.findMany({
            select: {
              productId: true,
              name: true,
              ProductSKU: true,
              description: true,
              Media: { select: { mediaId: true } },
            },
            take: 6,
          });
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          message: "Error getting favourite products",
          cause: err,
        });
      }
    },
  })
  .merge("editor", EditorFavouriteProductsRouter);

// .mutation("add", {
//   input: z.object({
//     productId: z.string().uuid(),
//   }),
//   resolve: async ({ ctx, input }) => {
//     try {
//       const resP = await ctx.prisma.product.findUnique({
//         where: {
//           productId: input.productId,
//         },
//         select: {
//           productId: true,
//           name: true,
//           categoryCategoryId: true,
//           deletedAt: true,
//         },
//       });

//       if (resP === null || resP.deletedAt !== null) {
//         throw throwTRPCError({
//           message: "Product not found",
//           code: "NOT_FOUND",
//         });
//       }

//       const res = await ctx.prisma.favouriteProduct.create({
//         data: {
//           productId: input.productId,
//           name: resP.name,
//           categoryId: resP.categoryCategoryId,
//         },
//       });
//       return res;
//     } catch (err) {
//       throw throwPrismaTRPCError({
//         message: "Error creating favourite products",
//         cause: err,
//       });
//     }
//   },
// })
// .mutation("delete", {
//   input: z.object({
//     productId: z.string().uuid(),
//   }),
//   resolve: async ({ ctx, input }) => {
//     try {
//       const res = await ctx.prisma.favouriteProduct.updateMany({
//         where: {
//           productId: input.productId,
//         },
//         data: {
//           deletedAt: new Date(),
//         },
//       });
//       return res;
//     } catch (err) {
//       throw throwPrismaTRPCError({
//         message: "Error deleting favourite products",
//         cause: err,
//       });
//     }
//   },
// });
