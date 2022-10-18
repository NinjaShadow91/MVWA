import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError } from "../util";

export const productSearchRouter = createRouter().query("searchProduct", {
  input: z.object({
    query: z.string(),
    filters: z
      .object({
        priceRangeMax: z.number().int().nonnegative(),
        priceRangeMin: z.number().int().nonnegative(),
        tags: z.string().array().nullish(),
      })
      .nullish(),
  }),
  async resolve({ ctx, input }) {
    try {
      // Add user personalisation
      // const user =
      if (input.filters) {
        const priceRangeMax = input.filters.priceRangeMax;
        const priceRangeMin = input.filters.priceRangeMin;
        const query = [input.query];
        const prodsWithQueryInName = await ctx.prisma.product.findMany({
          where: {
            name: { in: query },
            deletedAt: null,
            price: { gte: priceRangeMin, lte: priceRangeMax },
          },
          select: {
            name: true,
            price: true,
            //   Get only 1 pic
            Media: true,
            Details: {
              select: {
                description: true,
              },
            },
          },
        });
        const prodsWithQueryInDescription = await ctx.prisma.product.findMany({
          where: {
            deletedAt: null,
            price: { gte: priceRangeMin, lte: priceRangeMax },
            Details: {
              some: {
                description: {
                  search: input.query,
                },
              },
            },
          },
          select: {
            name: true,
            price: true,
            //   Get only 1 pic
            Media: {
              take: 1,
            },
            Details: {
              select: {
                description: true,
              },
            },
          },
        });
        return prodsWithQueryInName.concat(prodsWithQueryInDescription);
      } else {
        // Implement pagination
        // Process query and make token remove verb, number maybe
        const query = [input.query];
        const prodsWithQueryInName = await ctx.prisma.product.findMany({
          where: {
            deletedAt: null,
            name: { in: query },
          },
          select: {
            name: true,
            price: true,
            Details: {
              select: {
                description: true,
              },
            },
          },
        });
        const prodsWithQueryInDescription = await ctx.prisma.product.findMany({
          where: {
            deletedAt: null,
            Details: {
              some: {
                description: {
                  search: input.query,
                },
              },
            },
          },
          select: {
            name: true,
            price: true,
            Details: {
              select: {
                description: true,
              },
            },
          },
        });
        return prodsWithQueryInName.concat(prodsWithQueryInDescription);
      }
    } catch (err) {
      throw throwPrismaTRPCError({
        cause: err,
        message: "Something went bad while fetching the product data",
      });
    }
  },
});
