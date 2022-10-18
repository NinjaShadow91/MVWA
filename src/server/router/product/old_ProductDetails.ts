import { createRouter } from "../context";
import { z } from "zod";
import * as trpc from "@trpc/server";
import { throwPrismaTRPCError } from "../util";

// import { insertData, getData } from "../db/test";
// insertData();
// getData();

export const productRouter = createRouter()
  .query("getProductDetails", {
    input: z.object({
      id: z.string().uuid(),
      select: z
        .object({
          reviews: z.number().positive().nullish(),
          featuresOfReview: z.boolean().nullish(),
          questions: z.number().positive().nullish(),
          answers: z.number().positive().nullish(),
          paymentMethods: z.boolean().nullish(),
          details: z.boolean().nullish(),
          store: z.boolean().nullish(),
          tags: z.boolean().nullish(),
          brand: z.boolean().nullish(),
          category: z.boolean().nullish(),
          variants: z.boolean().nullish(),
          images: z.boolean().nullish(),
        })
        .nullish(),
    }),
    output: z.object({
      isSucess: z.boolean(),
      data: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          price: z.number(),
          dateCreated: z.date(),
          dateUpdated: z.date(),
          deletedAt: z.date().nullish(),
          replaceFrame: z.number().nonnegative(),
          returnFrame: z.number().nonnegative(),
          stock: z.number().nonnegative(),
          flagedForWrongInfo: z.number(),
          giftOptionAvailable: z.boolean(),
          paymentMethods: z.number().nullish(),
          images: z.string().array().nullish(),
          technicalDetails: z
            .object({
              key: z.string().array(),
              value: z.string().array(),
              description: z.string().array(),
              descriptionImages: z.string().array(),
            })
            .nullish(),
          category: z
            .object({
              id: z.string().uuid(),
              key: z.string(),
            })
            .nullish(),
          brand: z
            .object({
              id: z.string().uuid(),
              name: z.string(),
            })
            .nullish(),
          store: z
            .object({
              id: z.string().uuid(),
              name: z.string(),
              manager: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                })
                .nullish(),
            })
            .nullish(),
          tags: z
            .object({
              key: z.string(),
              value: z.string().nullish(),
            })
            .array()
            .nullish(),
          otherVariants: z
            .object({
              id: z.string().uuid(),
              name: z.string(),
              price: z.number(),
              stock: z.number().nonnegative(),
            })
            .array()
            .nullish(),
          reviews: z
            .object({
              id: z.string().uuid(),
              createdAt: z.date(),
              overallRating: z.number().min(0).max(5),
              content: z.string(),
              featuresRating: z
                .object({
                  key: z.string(),
                  value: z.number().min(0).max(5),
                })
                .array()
                .nullish(),
              user: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                })
                .nullish(),
            })
            .array()
            .nullish(),
          questions: z
            .object({
              id: z.string().uuid(),
              content: z.string(),
              upvotes: z.number().nonnegative(),
              downvotes: z.number().nonnegative(),
              answers: z
                .object({
                  content: z.string(),
                  upvotes: z.number().nonnegative(),
                  downvotes: z.number().nonnegative(),
                  user: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string(),
                    })
                    .nullish(),
                })
                .array()
                .nullish(),
              user: z
                .object({
                  id: z.string().uuid(),
                  name: z.string(),
                })
                .nullish(),
            })
            .array()
            .nullish(),
        })
        .strict()
        .nullish(),
    }),
    resolve: async ({ input, ctx }) => {
      try {
        const { prisma } = ctx;
        const prodDetails = await prisma.product.findUnique({
          where: { productId: input.id },
          select: {
            productId: true,
            name: true,
            price: true,
            replaceFrame: true,
            returnFrame: true,
            dateCreated: true,
            dateUpdated: true,
            deletedAt: true,
            stock: true,
            flagedForWrongInfo: true,
            giftOptionAvailable: true,
            paymentMethods: input.select?.paymentMethods ? true : false,
            images: input.select?.images ? true : false,
            category: input.select?.category
              ? {
                  select: {
                    id: true,
                    key: true,
                  },
                }
              : false,
            brand: input.select?.brand
              ? {
                  select: {
                    id: true,
                    name: true,
                  },
                }
              : false,
            store: {
              select: {
                id: true,
                name: true,
                manager: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            tags: input.select?.tags
              ? {
                  select: {
                    key: true,
                    value: true,
                  },
                }
              : false,
            otherVariants: input.select?.variants
              ? {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                  },
                }
              : false,
            technicalDetails: input.select?.details ? true : false,
            reviews: input.select?.reviews
              ? {
                  select: {
                    id: true,
                    createdAt: true,
                    overallRating: true,
                    content: true,
                    featuresRating: input.select?.featuresOfReview
                      ? {
                          select: {
                            key: true,
                            value: true,
                          },
                        }
                      : false,
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                  take: input.select?.reviews,
                }
              : false,
            questions: input.select?.questions
              ? {
                  select: {
                    id: true,
                    content: true,
                    upvotes: true,
                    downvotes: true,
                    createdAt: true,
                    answers: input.select.answers
                      ? {
                          select: {
                            content: true,
                            upvotes: true,
                            downvotes: true,
                            user: {
                              select: {
                                name: true,
                                id: true,
                              },
                            },
                          },
                          take: input.select.answers,
                        }
                      : false,
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                  take: input.select?.questions,
                }
              : false,
          },
        });
        if (
          prodDetails &&
          (!prodDetails.deletedAt ||
            (ctx.session &&
              ctx.session.user?.id === prodDetails.store.manager.id))
        ) {
          return { isSucess: true, data: prodDetails };
        } else {
          return { isSucess: false };
        }
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the store data",
        });
      }
    },
  })
  .query("getProductPrice", {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({
      isPresent: z.boolean(),
      price: z.number().nullish(),
    }),
    async resolve({ ctx, input }) {
      try {
        const { price, deletedAt } = (await ctx.prisma.product.findUnique({
          where: { id: input.id },
          select: {
            price: true,
            deletedAt: true,
          },
        })) ?? { price: null, deletedAt: null };
        if (price && !deletedAt) return { isPresent: true, price: price };
        else return { isPresent: false };
      } catch (err) {
        throw throwPrismaTRPCError({
          cause: err,
          message: "Something went bad while fetching the product data",
        });
      }
    },
  })
  .query("getProductStockDetails", {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({
      isPresent: z.boolean(),
      stock: z.number().nullish(),
    }),
    async resolve({ ctx, input }) {
      try {
        const { stock, deletedAt } = (await ctx.prisma.product.findUnique({
          where: { id: input.id },
          select: {
            deletedAt: true,
            stock: true,
          },
        })) ?? { stock: null };
        if (stock && !deletedAt) return { isPresent: true, price: stock };
        else return { isPresent: true };
      } catch (err) {
        throw throwPrismaTRPCError({
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
    output: z.object({
      isPresent: z.boolean(),
      productIDs: z.string().uuid().array().nullable(),
    }),
    async resolve({ ctx, input }) {
      try {
        const productIDs =
          input.id && input.key
            ? (
                await ctx.prisma.category.findUnique({
                  where: { id: input.id, key: input.key },
                  select: {
                    products: {
                      where: { deletedAt: null },
                      select: { id: true },
                    },
                  },
                })
              )?.products.map((product) => product.id) ?? null
            : input.id
            ? (
                await ctx.prisma.category.findUnique({
                  where: { id: input.id },
                  select: {
                    products: {
                      where: { deletedAt: null },
                      select: { id: true },
                    },
                  },
                })
              )?.products.map((product) => product.id) ?? null
            : input.key
            ? (
                await ctx.prisma.category.findUnique({
                  where: { key: input.key },
                  select: {
                    products: {
                      where: { deletedAt: null },
                      select: { id: true },
                    },
                  },
                })
              )?.products.map((product) => product.id) ?? null
            : undefined;
        if (productIDs === null) {
          return { isPresent: false, productIDs: productIDs };
        } else if (productIDs === undefined) {
          throw new trpc.TRPCError({
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
              price: { gte: priceRangeMin, lte: priceRangeMax },
            },
            select: {
              name: true,
              price: true,
              technicalDetails: true,
            },
          });
          const prodsWithQueryInDescription = await ctx.prisma.product.findMany(
            {
              where: {
                deletedAt: null,
                price: { gte: priceRangeMin, lte: priceRangeMax },
                technicalDetails: {
                  description: { hasSome: query },
                },
              },
              select: {
                name: true,
                price: true,
                technicalDetails: true,
              },
            }
          );
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
              technicalDetails: true,
            },
          });
          const prodsWithQueryInDescription = await ctx.prisma.product.findMany(
            {
              where: {
                deletedAt: null,
                technicalDetails: {
                  description: { hasSome: query },
                },
              },
              select: {
                name: true,
                price: true,
                technicalDetails: true,
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