import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const productRouter = createRouter()
  .query("getProductDetails", {
    input: z.object({
      productId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      const { productId } = input;
      try {
        const product = await ctx.prisma.product.findUnique({
          where: { productId: productId },
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
          },
        });
        if (product === null) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }
        return product;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .query("getProductsDetails", {
    input: z.object({
      productIds: z.string().uuid().array(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const products = [];
        for (let i = 0; i < input.productIds.length; i++) {
          const product = await ctx.prisma.product.findUnique({
            where: { productId: input.productIds[i] },
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
            },
          });
          if (product === null) {
            throw throwTRPCError({
              message: "Product not found",
              code: "NOT_FOUND",
            });
          }
          products.push(product);
        }
        return products;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .query("getProductSKUDetails", {
    input: z.object({
      productSKUId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const productSKU = await ctx.prisma.productSKU.findUnique({
          where: { productSKUId: input.productSKUId },
          select: {
            productSKUId: true,
            skuName: true,
            productInventoryIds: true,
            Media: true,
            deletedAt: true,
          },
        });
        if (productSKU === null || productSKU.deletedAt !== null) {
          throw throwTRPCError({
            message: "Product SKU not found",
            code: "NOT_FOUND",
          });
        }
        return productSKU;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while fetching the product SKU data",
        });
      }
    },
  })
  .query("getProductSKUsDetails", {
    input: z.string().uuid(),

    resolve: async ({ input, ctx }) => {
      try {
        const productSKUs = await ctx.prisma.productSKU.findMany({
          where: { productId: input },
          select: {
            productSKUId: true,
            skuName: true,
            productInventoryIds: true,
            Media: true,
            deletedAt: true,
          },
        });

        if (productSKUs.length === 0) {
          throw throwTRPCError({
            message: "Product SKUs not found",
            code: "NOT_FOUND",
          });
        }
        return productSKUs.filter(
          (productSKU) => productSKU.deletedAt === null
        );
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while fetching the product SKU data",
        });
      }
    },
  })
  .query("getProductIDsOfCategory", {
    input: z.object({
      id: z.string().uuid().nullish(),
      key: z.string().nullish(),
    }),
    // output: z.object({
    //   isPresent: z.boolean(),
    //   productIDs: z.string().uuid().array().nullable(),
    // }),
    async resolve({ ctx, input }) {
      try {
        const productIDs =
          input.id && input.key
            ? (
                await ctx.prisma.category.findUnique({
                  where: { categoryId: input.id, name: input.key },
                  select: {
                    Products: {
                      where: { deletedAt: null },
                      select: { productId: true },
                    },
                  },
                })
              )?.Products.map((product) => product.productId) ?? null
            : input.id
            ? (
                await ctx.prisma.category.findUnique({
                  where: { categoryId: input.id },
                  select: {
                    Products: {
                      where: { deletedAt: null },
                      select: { productId: true },
                    },
                  },
                })
              )?.Products.map((product) => product.productId) ?? null
            : input.key
            ? (
                await ctx.prisma.category.findUnique({
                  where: { name: input.key },
                  select: {
                    Products: {
                      where: { deletedAt: null },
                      select: { productId: true },
                    },
                  },
                })
              )?.Products.map((product) => product.productId) ?? null
            : undefined;
        if (productIDs === null) {
          //   return { isPresent: false, productIDs: productIDs };
          throw throwTRPCError({
            message: "Category not found",
            code: "NOT_FOUND",
          });
        } else if (productIDs === undefined) {
          throw throwTRPCError({
            code: "BAD_REQUEST",
            message: "Please provide either id or key",
          });
        } else {
          return { isPresent: true, productIDs: productIDs };
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  });
