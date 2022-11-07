import { createRouter } from "../context";
import { z } from "zod";
import { throwPrismaTRPCError } from "../util";

export const productSearchRouter = createRouter()
  .query("searchProductv1", {
    input: z.string(),
    async resolve({ ctx, input }) {
      try {
        return await ctx.prisma.$queryRawUnsafe(
          `select name, description from "public"."Product" where position('${input}' in "public"."Product"."name")>0`
        );
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .query("searchProduct", {
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
              // price: { gte: priceRangeMin, lte: priceRangeMax },
            },
            select: {
              name: true,
              // price: true,
              //   Get only 1 pic
              Media: true,
              Details: {
                select: {
                  description: true,
                },
              },
            },
          });
          const prodsWithQueryInDescription = await ctx.prisma.product.findMany(
            {
              where: {
                deletedAt: null,
                // price: { gte: priceRangeMin, lte: priceRangeMax },
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
                // price: true,
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
            }
          );
          return prodsWithQueryInName.concat(prodsWithQueryInDescription);
        } else {
          // Implement pagination
          // Process query and make token remove verb, number maybe
          console.log("query", input.query);
          const query = [input.query];
          const prodsWithQueryInName = await ctx.prisma.product.findMany({
            where: {
              deletedAt: null,
              name: { in: query },
            },
            select: {
              productId: true,
              name: true,
              // price: true,
              description: true,
              // Details: {
              //   select: {
              //     description: true,
              //   },
              // },
            },
          });

          const prodsWithQueryInDescription = await ctx.prisma.product.findMany(
            {
              where: {
                deletedAt: null,
                OR: [
                  {
                    Details: {
                      some: {
                        description: {
                          search: input.query,
                        },
                      },
                    },
                  },
                  {
                    description: {
                      contains: input.query,
                    },
                  },
                ],
              },
              select: {
                productId: true,
                name: true,
                // price: true,
                description: true,
                // Details: {
                //   select: {
                //     description: true,
                //   },
                // },
              },
            }
          );
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
