import { createRouter } from "./context";
import { z } from "zod";

import { insertData, getData } from "../db/test";
// insertData();
// getData();

export const productRouter = createRouter()
  .query("getProductDetails", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      const { prisma } = ctx;
      const prodDetails = await prisma.product.findUnique({
        where: { id: input.id },
        select: {
          name: true,
          price: true,
        },
      });
      return prodDetails;
    },
  })
  .query("getProductPrice", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const productPrice = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        select: {
          price: true,
        },
      });
      return productPrice;
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
      // Add user personalisation
      // const user =
      if (input.filters) {
        const priceRangeMax = input.filters.priceRangeMax;
        const priceRangeMin = input.filters.priceRangeMin;
        const query = [input.query];
        const prodsWithQueryInName = await ctx.prisma.product.findMany({
          where: {
            name: { in: query },
            price: { gte: priceRangeMin, lte: priceRangeMax },
          },
          select: {
            name: true,
            price: true,
            TechnicalDetails: true,
          },
        });
        const prodsWithQueryInDescription = await ctx.prisma.product.findMany({
          where: {
            price: { gte: priceRangeMin, lte: priceRangeMax },
            TechnicalDetails: {
              description: { hasSome: query },
            },
          },
          select: {
            name: true,
            price: true,
            TechnicalDetails: true,
          },
        });
        console.log(
          "return ",
          prodsWithQueryInName.concat(prodsWithQueryInDescription)
        );
        return prodsWithQueryInName.concat(prodsWithQueryInDescription);
      } else {
        // Implement pagination
        // Process query and make token remove verb, number maybe
        const query = [input.query];
        const prodsWithQueryInName = await ctx.prisma.product.findMany({
          where: {
            name: { in: query },
          },
          select: {
            name: true,
            price: true,
            TechnicalDetails: true,
          },
        });
        const prodsWithQueryInDescription = await ctx.prisma.product.findMany({
          where: {
            TechnicalDetails: {
              description: { hasSome: query },
            },
          },
          select: {
            name: true,
            price: true,
            TechnicalDetails: true,
          },
        });
        console.log(
          "return ",
          prodsWithQueryInName.concat(prodsWithQueryInDescription)
        );
        return prodsWithQueryInName.concat(prodsWithQueryInDescription);
      }
    },
  });
