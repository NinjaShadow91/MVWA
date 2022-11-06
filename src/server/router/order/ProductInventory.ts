import { createProtectedRouter, createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError, throwTRPCError } from "../util";

const sellerProductInventoryRouter = createProtectedRouter().mutation(
  "updateProductInventory",
  {
    input: z.object({
      productInventoryId: z.string().uuid(),
      price: z.number().nonnegative(),
      stock: z.number().nonnegative(),
      comingSoon: z.number().nonnegative(),
    }),
    resolve: async ({ input, ctx }) => {
      const { productInventoryId, price, stock, comingSoon } = input;
      try {
        const prodInventory = await ctx.prisma.productInventory.findUnique({
          where: { productInventoryId: productInventoryId },
          select: {
            productId: true,
            deletedAt: true,
          },
        });
        if (prodInventory === null || prodInventory.deletedAt) {
          throw throwTRPCError({
            message: "Product Inventory not found",
            code: "NOT_FOUND",
          });
        }
        const product = await ctx.prisma.product.findUnique({
          where: { productId: prodInventory.productId },
          select: {
            storeId: true,
            deletedAt: true,
          },
        });

        if (product === null || product.deletedAt) {
          throw throwTRPCError({
            message: "Product not found",
            code: "NOT_FOUND",
          });
        }

        const store = await ctx.prisma.store.findUnique({
          where: { storeId: product.storeId },
          select: {
            deletedAt: true,
            userId: true,
          },
        });

        if (store === null || store.deletedAt) {
          throw throwTRPCError({
            message: "Store not found",
            code: "NOT_FOUND",
          });
        }

        if (store.userId !== ctx.session.user.id) {
          throw throwTRPCError({
            message: "You are not authorized to update this product",
            code: "UNAUTHORIZED",
          });
        }

        const productInventory = await ctx.prisma.productInventory.update({
          where: { productInventoryId: productInventoryId },
          data: {
            price: price,
            stock: stock,
            comingSoon: comingSoon,
          },
        });

        await ctx.prisma.product.update({
          where: { productId: prodInventory.productId },
          data: {
            price: price,
            updatedAt: new Date(),
          },
        });
        return productInventory;
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message:
            "Something went bad while updating the product inventory data",
        });
      }
    },
  }
);

export const productInventoryRouter = createRouter()
  .query("getProductInventory", {
    input: z.object({
      productInventoryId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      const { productInventoryId } = input;
      try {
        const productInventory = await ctx.prisma.productInventory.findUnique({
          where: { productInventoryId: productInventoryId },
          select: {
            productInventoryId: true,
            price: true,
            stock: true,
            productId: true,
            comingSoon: true,
            deletedAt: true,
          },
        });
        if (productInventory === null || productInventory.deletedAt) {
          throw throwTRPCError({
            message: "Product Inventory not found",
            code: "NOT_FOUND",
          });
        }
        return productInventory;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message:
            "Something went bad while fetching the product inventory data",
        });
      }
    },
  })
  .query("getProductInventories", {
    input: z.object({
      productSKUId: z.string().uuid(),
    }),
    resolve: async ({ input, ctx }) => {
      const { productSKUId } = input;
      try {
        const productInventories = await ctx.prisma.productInventory.findMany({
          where: { productId: productSKUId },
          select: {
            productInventoryId: true,
            price: true,
            stock: true,
            productId: true,
            comingSoon: true,
            deletedAt: true,
          },
        });
        return productInventories;
      } catch (err) {
        throw throwTRPCError({
          cause: err,
          message:
            "Something went bad while fetching the product inventory data",
        });
      }
    },
  })
  .merge("seller.", sellerProductInventoryRouter);
