import { z } from "zod";
import { createRouter } from "../context";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const storeRouter = createRouter()
  .query("getDetails", {
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
  })
  .query("getProducts", {
    input: z.string().uuid(),
    resolve: async ({ input, ctx }) => {
      try {
        const store = await ctx.prisma.store.findUnique({
          where: {
            storeId: input,
          },
          select: {
            Products: true,
            deletedAt: true,
          },
        });

        if (!store || store.deletedAt) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Store not found",
          });
        }

        if (store.Products.length === 0) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Store has no products",
          });
        }

        const products = await Promise.all(
          store.Products.map(async (product) => {
            return await ctx.prisma.product.findUnique({
              where: {
                productId: product,
              },
              select: {
                productId: true,
                name: true,
                description: true,
                returnFrame: true,
                replaceFrame: true,
                giftOptionAvailable: true,
                Details: {
                  select: {
                    heading: true,
                    description: true,
                    Media: true,
                  },
                },
                TechnicalDetails: true,
                Media: true,
                Category: true,
                ProductSKU: true,
                deletedAt: true,
              },
            });
          })
        );

        if (products.length === 0) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Store has no products",
          });
        }

        return products.filter((product) => product && !product.deletedAt);
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Error getting store products",
        });
      }
    },
  });
