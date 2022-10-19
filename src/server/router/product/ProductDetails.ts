import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

export const productRouter = createRouter()
  .query("getProductDetails", {
    input: z.object({
      productId: z.string(),
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
        return product;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
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
